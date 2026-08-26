// Super-admin-only: view and edit retention_days per data type. This is the
// route that makes the legal retention parameter editable without a code
// change or redeploy — see REDACTION_RETENTION_FIX.md.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '../../../../../../lib/authz';
import { getRetentionSettings, getRetentionHistory, updateRetentionSetting, DataType } from '../../../../../../lib/dataRetention';
import { safeErrorInfo } from '../../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_DATA_TYPES: DataType[] = ['medical_certificate', 'cv_job_assistant', 'cv_company_pipeline'];

async function withUserNames<T extends { updated_by?: string | null; changed_by?: string | null }>(
  rows: T[]
): Promise<(T & { updated_by_name?: string | null; changed_by_name?: string | null })[]> {
  const ids = Array.from(
    new Set(rows.map((r) => r.updated_by ?? r.changed_by).filter((id): id is string => !!id))
  );
  if (ids.length === 0) return rows;

  const { data: users } = await supabase.from('users').select('id, user_firstname, user_lastname').in('id', ids);
  const nameById = new Map((users ?? []).map((u) => [u.id, `${u.user_firstname ?? ''} ${u.user_lastname ?? ''}`.trim() || u.id]));

  return rows.map((r) => ({
    ...r,
    updated_by_name: r.updated_by ? nameById.get(r.updated_by) ?? r.updated_by : null,
    changed_by_name: r.changed_by ? nameById.get(r.changed_by) ?? r.changed_by : null,
  }));
}

export async function GET(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  try {
    const [rawSettings, rawHistory] = await Promise.all([getRetentionSettings(), getRetentionHistory()]);
    const [settings, history] = await Promise.all([withUserNames(rawSettings), withUserNames(rawHistory)]);
    return NextResponse.json({ settings, history });
  } catch (err) {
    console.error('Failed to load retention settings:', safeErrorInfo(err));
    return NextResponse.json({ error: 'Failed to load retention settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const dataType = body?.data_type as DataType | undefined;
  const retentionDaysRaw = body?.retention_days;

  if (!dataType || !VALID_DATA_TYPES.includes(dataType)) {
    return NextResponse.json({ error: `data_type must be one of ${VALID_DATA_TYPES.join(', ')}` }, { status: 400 });
  }

  let retentionDays: number | null;
  if (retentionDaysRaw === null || retentionDaysRaw === '' || retentionDaysRaw === undefined) {
    retentionDays = null;
  } else {
    const parsed = Number(retentionDaysRaw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return NextResponse.json({ error: 'retention_days must be a positive integer, or null for indefinite retention' }, { status: 400 });
    }
    retentionDays = parsed;
  }

  try {
    await updateRetentionSetting(dataType, retentionDays, authCheck.userId);
    const rawSettings = await getRetentionSettings();
    const settings = await withUserNames(rawSettings);
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Failed to update retention setting:', safeErrorInfo(err));
    return NextResponse.json({ error: 'Failed to update retention setting' }, { status: 500 });
  }
}
