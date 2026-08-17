// Data retention sweep for medical certificates and CV data.
//
// IMPORTANT: retention_days is read from the database on every call in this
// file — nothing here is cached at module load or deploy time. Changing a
// value in data_retention_settings takes effect on the very next call,
// scheduled or manual, with zero code change and zero redeploy. See
// REDACTION_RETENTION_FIX.md for the verification test proving this.
//
// This module does not make HRInno GDPR/HIPAA compliant. It only makes the
// retention period a legal/compliance-editable parameter instead of a
// hardcoded one. See REDACTION_RETENTION_FIX.md for what still requires a
// human legal decision.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type DataType = 'medical_certificate' | 'cv_job_assistant' | 'cv_company_pipeline';

export type RetentionSetting = {
  id: number;
  data_type: DataType;
  retention_days: number | null;
  updated_at: string;
  updated_by: string | null;
};

const MEDICAL_CERT_BUCKET = 'medical-certificates';
const CV_BUCKET = 'cvs';

// --- Settings -------------------------------------------------------------

export async function getRetentionSettings(): Promise<RetentionSetting[]> {
  const { data, error } = await supabase
    .from('data_retention_settings')
    .select('*')
    .order('data_type');
  if (error) throw error;
  return data ?? [];
}

export async function getRetentionHistory(limit = 50) {
  const { data, error } = await supabase
    .from('data_retention_settings_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function updateRetentionSetting(
  dataType: DataType,
  retentionDays: number | null,
  updatedBy: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('data_retention_settings')
    .select('retention_days')
    .eq('data_type', dataType)
    .single();

  const { error } = await supabase
    .from('data_retention_settings')
    .update({
      retention_days: retentionDays,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .eq('data_type', dataType);

  if (error) throw error;

  await supabase.from('data_retention_settings_history').insert({
    data_type: dataType,
    old_retention_days: existing?.retention_days ?? null,
    new_retention_days: retentionDays,
    changed_by: updatedBy,
  });
}

// --- Helpers ----------------------------------------------------------------

function daysToCutoff(retentionDays: number): Date {
  return new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
}

// The OCR-staging copy of a medical certificate (uploads/{companyId}/...)
// has no DB row to key off of — it's tracked purely by storage object age.
// See DATA_FLOW_AUDIT.md, section 1a.
async function listOrphanedCertificateStagingFiles(
  cutoff: Date
): Promise<{ path: string; created_at: string }[]> {
  const results: { path: string; created_at: string }[] = [];

  const { data: companyFolders } = await supabase.storage
    .from(MEDICAL_CERT_BUCKET)
    .list('uploads', { limit: 1000 });

  for (const folder of companyFolders ?? []) {
    if (!folder.name) continue;
    const { data: files } = await supabase.storage
      .from(MEDICAL_CERT_BUCKET)
      .list(`uploads/${folder.name}`, { limit: 1000 });

    for (const file of files ?? []) {
      if (!file.name || !file.created_at) continue;
      if (new Date(file.created_at) < cutoff) {
        results.push({ path: `uploads/${folder.name}/${file.name}`, created_at: file.created_at });
      }
    }
  }

  return results;
}

async function logDeletion(entry: {
  data_type: DataType;
  record_id: string;
  storage_path: string | null;
  reason: 'scheduled' | 'manual';
  deleted_by: string | null;
  record_created_at: string | null;
}) {
  await supabase.from('data_deletion_log').insert(entry);
}

// --- Medical certificates -----------------------------------------------

async function sweepMedicalCertificates(
  reason: 'scheduled' | 'manual',
  opts: { cutoff?: Date; onlyId?: number; deletedBy?: string | null }
): Promise<number> {
  let query = supabase.from('medical_certificates').select('id, certificate_file, created_at');
  query = opts.onlyId != null ? query.eq('id', opts.onlyId) : query.lt('created_at', opts.cutoff!.toISOString());

  const { data: rows, error } = await query;
  if (error) throw error;

  for (const row of rows ?? []) {
    // medical_certificates <-> leave_requests reference each other; null
    // out the leave_requests side first so the FK doesn't block deletion.
    await supabase.from('leave_requests').update({ medical_certificate_id: null }).eq('medical_certificate_id', row.id);

    if (row.certificate_file) {
      await supabase.storage.from(MEDICAL_CERT_BUCKET).remove([row.certificate_file]);
    }

    await supabase.from('medical_certificates').delete().eq('id', row.id);

    await logDeletion({
      data_type: 'medical_certificate',
      record_id: String(row.id),
      storage_path: row.certificate_file,
      reason,
      deleted_by: opts.deletedBy ?? null,
      record_created_at: row.created_at,
    });
  }

  return rows?.length ?? 0;
}

async function sweepOrphanedCertificateStagingFiles(
  reason: 'scheduled' | 'manual',
  cutoff: Date,
  deletedBy?: string | null
): Promise<number> {
  const files = await listOrphanedCertificateStagingFiles(cutoff);

  for (const file of files) {
    await supabase.storage.from(MEDICAL_CERT_BUCKET).remove([file.path]);
    await logDeletion({
      data_type: 'medical_certificate',
      record_id: file.path,
      storage_path: file.path,
      reason,
      deleted_by: deletedBy ?? null,
      record_created_at: file.created_at,
    });
  }

  return files.length;
}

// --- Company-pipeline CVs -------------------------------------------------

async function sweepCandidates(
  reason: 'scheduled' | 'manual',
  opts: { cutoff?: Date; onlyId?: number; deletedBy?: string | null }
): Promise<number> {
  let query = supabase.from('candidats').select('id, cv_file, created_at');
  query = opts.onlyId != null ? query.eq('id', opts.onlyId) : query.lt('created_at', opts.cutoff!.toISOString());

  const { data: rows, error } = await query;
  if (error) throw error;

  for (const row of rows ?? []) {
    await supabase.from('position_to_candidat').delete().eq('candidat_id', row.id);

    if (row.cv_file) {
      await supabase.storage.from(CV_BUCKET).remove([row.cv_file]);
    }

    await supabase.from('candidats').delete().eq('id', row.id);

    await logDeletion({
      data_type: 'cv_company_pipeline',
      record_id: String(row.id),
      storage_path: row.cv_file,
      reason,
      deleted_by: opts.deletedBy ?? null,
      record_created_at: row.created_at,
    });
  }

  return rows?.length ?? 0;
}

// --- Public API -------------------------------------------------------------

export type SweepSummary = Record<DataType, { retentionDays: number | null; deleted: number; note?: string }>;

/**
 * Reads data_retention_settings fresh from the database and deletes
 * everything older than the CURRENT retention_days for each data type.
 * Called by the daily cron (reason='scheduled'); nothing about the
 * retention period is baked in here.
 */
export async function runRetentionSweep(reason: 'scheduled' | 'manual' = 'scheduled'): Promise<SweepSummary> {
  const settings = await getRetentionSettings();
  const summary = {} as SweepSummary;

  for (const setting of settings) {
    if (setting.retention_days == null) {
      summary[setting.data_type] = { retentionDays: null, deleted: 0, note: 'Retain indefinitely — no automatic deletion.' };
      continue;
    }

    const cutoff = daysToCutoff(setting.retention_days);

    if (setting.data_type === 'medical_certificate') {
      const deletedRows = await sweepMedicalCertificates(reason, { cutoff });
      const deletedOrphans = await sweepOrphanedCertificateStagingFiles(reason, cutoff);
      summary[setting.data_type] = { retentionDays: setting.retention_days, deleted: deletedRows + deletedOrphans };
    } else if (setting.data_type === 'cv_company_pipeline') {
      const deleted = await sweepCandidates(reason, { cutoff });
      summary[setting.data_type] = { retentionDays: setting.retention_days, deleted };
    } else {
      // cv_job_assistant: no persistence layer exists (see DATA_FLOW_AUDIT.md,
      // section 3) — nothing to delete, logged explicitly rather than
      // silently skipped.
      summary[setting.data_type] = {
        retentionDays: setting.retention_days,
        deleted: 0,
        note: 'No persistence layer exists for Job Assistant CVs — nothing to delete.',
      };
    }
  }

  return summary;
}

export type DeletionPreviewEntry = {
  data_type: DataType;
  retention_days: number | null;
  cutoff: string | null;
  count: number;
  sample: { id: number | string; created_at: string }[];
  note?: string;
};

/**
 * Same logic as runRetentionSweep, but read-only — shows what the next
 * scheduled run would delete without deleting anything.
 */
export async function previewDeletions(): Promise<DeletionPreviewEntry[]> {
  const settings = await getRetentionSettings();
  const preview: DeletionPreviewEntry[] = [];

  for (const setting of settings) {
    if (setting.retention_days == null) {
      preview.push({ data_type: setting.data_type, retention_days: null, cutoff: null, count: 0, sample: [] });
      continue;
    }

    const cutoff = daysToCutoff(setting.retention_days);

    if (setting.data_type === 'medical_certificate') {
      const { data: sample } = await supabase
        .from('medical_certificates')
        .select('id, created_at')
        .lt('created_at', cutoff.toISOString())
        .order('created_at', { ascending: true })
        .limit(20);
      const { count } = await supabase
        .from('medical_certificates')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', cutoff.toISOString());
      const orphaned = await listOrphanedCertificateStagingFiles(cutoff);

      preview.push({
        data_type: setting.data_type,
        retention_days: setting.retention_days,
        cutoff: cutoff.toISOString(),
        count: (count ?? 0) + orphaned.length,
        sample: sample ?? [],
        note: orphaned.length > 0 ? `Includes ${orphaned.length} orphaned OCR-staging file(s) with no DB row.` : undefined,
      });
    } else if (setting.data_type === 'cv_company_pipeline') {
      const { data: sample } = await supabase
        .from('candidats')
        .select('id, created_at')
        .lt('created_at', cutoff.toISOString())
        .order('created_at', { ascending: true })
        .limit(20);
      const { count } = await supabase
        .from('candidats')
        .select('id', { count: 'exact', head: true })
        .lt('created_at', cutoff.toISOString());

      preview.push({
        data_type: setting.data_type,
        retention_days: setting.retention_days,
        cutoff: cutoff.toISOString(),
        count: count ?? 0,
        sample: sample ?? [],
      });
    } else {
      preview.push({
        data_type: setting.data_type,
        retention_days: setting.retention_days,
        cutoff: cutoff.toISOString(),
        count: 0,
        sample: [],
        note: 'No persistence layer exists for Job Assistant CVs — nothing to delete.',
      });
    }
  }

  return preview;
}

/**
 * Immediate deletion of one specific record, independent of the scheduled
 * sweep — supports a data-subject deletion request arriving before
 * automated retention kicks in.
 */
export async function deleteRecordNow(dataType: DataType, recordId: number, deletedBy: string): Promise<number> {
  if (dataType === 'medical_certificate') {
    return sweepMedicalCertificates('manual', { onlyId: recordId, deletedBy });
  }
  if (dataType === 'cv_company_pipeline') {
    return sweepCandidates('manual', { onlyId: recordId, deletedBy });
  }
  throw new Error(`No stored data to delete for data_type "${dataType}" — nothing is persisted for it.`);
}
