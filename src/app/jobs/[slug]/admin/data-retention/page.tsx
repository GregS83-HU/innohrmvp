'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Clock, History, Trash2, AlertTriangle, Save } from 'lucide-react'

type DataType = 'medical_certificate' | 'cv_job_assistant' | 'cv_company_pipeline'

const DATA_TYPE_LABELS: Record<DataType, string> = {
  medical_certificate: 'Medical certificates',
  cv_job_assistant: 'Job Assistant CVs (public)',
  cv_company_pipeline: 'Company hiring pipeline CVs',
}

interface Setting {
  id: number
  data_type: DataType
  retention_days: number | null
  updated_at: string
  updated_by: string | null
  updated_by_name?: string | null
}

interface HistoryEntry {
  id: number
  data_type: DataType
  old_retention_days: number | null
  new_retention_days: number | null
  changed_at: string
  changed_by: string | null
  changed_by_name?: string | null
}

interface PreviewEntry {
  data_type: DataType
  retention_days: number | null
  cutoff: string | null
  count: number
  sample: { id: number | string; created_at: string }[]
  note?: string
}

export default function DataRetentionAdminPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [preview, setPreview] = useState<PreviewEntry[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [deleteForm, setDeleteForm] = useState<{ data_type: DataType; record_id: string }>({
    data_type: 'medical_certificate',
    record_id: '',
  })
  const [deleteStatus, setDeleteStatus] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [settingsRes, previewRes] = await Promise.all([
        fetch('/api/admin/data-retention/settings'),
        fetch('/api/admin/data-retention/preview'),
      ])
      const settingsJson = await settingsRes.json()
      const previewJson = await previewRes.json()

      if (!settingsRes.ok) throw new Error(settingsJson.error || 'Failed to load settings')
      if (!previewRes.ok) throw new Error(previewJson.error || 'Failed to load preview')

      setSettings(settingsJson.settings)
      setHistory(settingsJson.history)
      setPreview(previewJson.preview)

      const nextDrafts: Record<string, string> = {}
      for (const s of settingsJson.settings as Setting[]) {
        nextDrafts[s.data_type] = s.retention_days === null ? '' : String(s.retention_days)
      }
      setDrafts(nextDrafts)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSave = async (dataType: DataType) => {
    setSaving(dataType)
    setError('')
    try {
      const raw = drafts[dataType]
      const retention_days = raw.trim() === '' ? null : Number(raw)
      const res = await fetch('/api/admin/data-retention/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_type: dataType, retention_days }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')
      await fetchAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteNow = async () => {
    setDeleteStatus('')
    setError('')
    if (!deleteForm.record_id.trim()) {
      setDeleteStatus('Enter a record id first.')
      return
    }
    if (!confirm(`Permanently delete ${deleteForm.data_type} record #${deleteForm.record_id}? This cannot be undone.`)) {
      return
    }
    try {
      const res = await fetch('/api/admin/data-retention/delete-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_type: deleteForm.data_type, record_id: Number(deleteForm.record_id) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Deletion failed')
      setDeleteStatus(`Deleted ${json.deleted} record(s).`)
      setDeleteForm((f) => ({ ...f, record_id: '' }))
      await fetchAll()
    } catch (e: unknown) {
      setDeleteStatus(e instanceof Error ? e.message : 'Deletion failed')
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-800">Data Retention</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Retention periods below are legal/compliance parameters, editable here without any code change or
            redeploy. A daily scheduled job deletes data older than the current setting. See{' '}
            <code>REDACTION_RETENTION_FIX.md</code> for what these numbers mean and what still needs a real legal
            decision. This page does not certify GDPR/HIPAA compliance.
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <>
            {/* Settings table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Retention periods
              </h2>
              <div className="space-y-4">
                {settings.map((s) => {
                  const previewEntry = preview.find((p) => p.data_type === s.data_type)
                  return (
                    <div key={s.data_type} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-800">{DATA_TYPE_LABELS[s.data_type]}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Last changed: {new Date(s.updated_at).toLocaleString()}
                            {s.updated_by_name ? ` by ${s.updated_by_name}` : ' (seeded placeholder, no admin edit yet)'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            placeholder="Indefinite"
                            value={drafts[s.data_type] ?? ''}
                            onChange={(e) => setDrafts((d) => ({ ...d, [s.data_type]: e.target.value }))}
                            className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                          />
                          <span className="text-xs text-gray-500">days</span>
                          <button
                            onClick={() => handleSave(s.data_type)}
                            disabled={saving === s.data_type}
                            className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {saving === s.data_type ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      </div>
                      {previewEntry && (
                        <p className="text-xs text-gray-500 mt-3">
                          {previewEntry.retention_days === null
                            ? 'Retained indefinitely — nothing scheduled for deletion.'
                            : `${previewEntry.count} record(s) currently older than ${previewEntry.retention_days} days (cutoff ${previewEntry.cutoff ? new Date(previewEntry.cutoff).toLocaleDateString() : '—'}) — will be deleted on the next scheduled run.`}
                          {previewEntry.note && <span className="block italic mt-1">{previewEntry.note}</span>}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Audit trail */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> Change history
              </h2>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">No changes recorded yet — settings are still at their seeded placeholder values.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {history.map((h) => (
                    <li key={h.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
                      <span className="text-gray-600">
                        {DATA_TYPE_LABELS[h.data_type]}: {h.old_retention_days ?? 'indefinite'} → {h.new_retention_days ?? 'indefinite'} days
                      </span>
                      <span className="text-gray-400 text-xs">
                        {h.changed_by_name ?? 'unknown'} · {new Date(h.changed_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Manual delete-now */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete a specific record now
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                For a data-subject deletion request that shouldn&apos;t wait for the scheduled sweep. Independent of the
                retention settings above.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={deleteForm.data_type}
                  onChange={(e) => setDeleteForm((f) => ({ ...f, data_type: e.target.value as DataType }))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="medical_certificate">Medical certificate</option>
                  <option value="cv_company_pipeline">Company pipeline CV (candidat)</option>
                </select>
                <input
                  type="number"
                  placeholder="Record ID"
                  value={deleteForm.record_id}
                  onChange={(e) => setDeleteForm((f) => ({ ...f, record_id: e.target.value }))}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  onClick={handleDeleteNow}
                  className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Delete permanently
                </button>
              </div>
              {deleteStatus && <p className="text-sm text-gray-600 mt-3">{deleteStatus}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
