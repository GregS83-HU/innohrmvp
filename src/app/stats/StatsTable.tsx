'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import * as Popover from '@radix-ui/react-popover'
import { Edit, Save, X, Search } from 'lucide-react'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text?: string
  cv_file?: string
}

type Row = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  candidats?: Candidat | null
}

type RecruitmentStep = {
  step_id: string
  step_name: string
}

export default function StatsTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [steps, setSteps] = useState<RecruitmentStep[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return
    const fetchSteps = async () => {
      try {
        const res = await fetch(`/api/recruitment-step?user_id=${session.user.id}`)
        if (!res.ok) {
          console.error('Erreur API', await res.text())
          return
        }
        const data = await res.json()
        setSteps(data)
      } catch (error) {
        console.error('Erreur chargement steps', error)
      }
    }
    fetchSteps()
  }, [session])

  const handleSelectRow = (candidat_id: number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(candidat_id)
      } else {
        newSet.delete(candidat_id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rows.map(row => row.candidat_id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleEditClick = (row: Row) => {
    setEditingId(row.candidat_id)
    setCommentValue(row.candidat_comment ?? '')
  }

  const handleSave = async () => {
    if (editingId === null) return
    try {
      const res = await fetch('/api/update-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidat_id: editingId, comment: commentValue }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        setRows((prev) =>
          prev.map((row) =>
            row.candidat_id === editingId ? { ...row, candidat_comment: commentValue } : row
          )
        )
        setEditingId(null)
      } else {
        console.error('Update failed', data)
        alert(data?.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Network error', err)
      alert('Erreur réseau ou inattendue')
    }
  }

  const handleStepChange = async (candidat_id: number, step_name: string) => {
    const stepValueToSend = step_name === '' ? null : step_name
    
    // Si la ligne est sélectionnée et qu'il y a d'autres lignes sélectionnées, mettre à jour toutes les lignes sélectionnées
    const isRowSelected = selectedRows.has(candidat_id)
    const candidatsToUpdate = isRowSelected && selectedRows.size > 1 
      ? Array.from(selectedRows) 
      : [candidat_id]

    try {
      // Mettre à jour tous les candidats concernés
      const updatePromises = candidatsToUpdate.map(id => 
        fetch('/api/update-next-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidat_id: id, step_name: stepValueToSend }),
        })
      )

      const responses = await Promise.all(updatePromises)
      const hasError = responses.some(res => !res.ok)

      if (hasError) {
        console.error('Erreur mise à jour étape')
        alert("Erreur lors de la mise à jour de l'étape'ó")
        return
      }

      // Mettre à jour l'état local
      setRows((prev) =>
        prev.map((row) =>
          candidatsToUpdate.includes(row.candidat_id) 
            ? { ...row, candidat_next_step: stepValueToSend } 
            : row
        )
      )

      // Si on a mis à jour plusieurs lignes, on peut désélectionner après la mise à jour
      if (candidatsToUpdate.length > 1) {
        setSelectedRows(new Set())
      }
    } catch (err) {
      console.error('Erreur réseau', err)
      alert('Erreur réseau lors de la mise à jour')
    }
  }

  const handleSort = () => {
    let newOrder: 'asc' | 'desc' | null = null
    if (sortOrder === null) newOrder = 'asc'
    else if (sortOrder === 'asc') newOrder = 'desc'
    else newOrder = null
    setSortOrder(newOrder)

    if (newOrder === null) {
      setRows(initialRows)
    } else {
      const sorted = [...rows].sort((a, b) => {
        if (a.candidat_score === null) return 1
        if (b.candidat_score === null) return -1
        if (newOrder === 'asc') return a.candidat_score - b.candidat_score
        return b.candidat_score - a.candidat_score
      })
      setRows(sorted)
    }
  }

  const renderSortIcon = () => {
    if (sortOrder === 'asc') {
      return <span style={{ color: 'red', marginLeft: 6 }}>↑</span> // ascending → red
    }
    if (sortOrder === 'desc') {
      return <span style={{ color: 'green', marginLeft: 6 }}>↓</span> // descending → green
    }
    return <span style={{ color: 'grey', marginLeft: 6 }}>↕</span> // neutral
  }

  const isAllSelected = rows.length > 0 && selectedRows.size === rows.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < rows.length

  return (
    <div style={{ overflowX: 'auto', padding: '1rem', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={thStyle}>
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={checkboxStyle}
              />
            </th>
            <th style={thStyle}>First name</th>
            <th style={thStyle}>Last Name</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={handleSort}>
              Score {renderSortIcon()}
            </th>
            <th style={thStyle}>CV</th>
            <th style={thStyle}>Next Step</th>
            <th style={thStyle}>Comment</th>
            <th style={thStyle}>AI Analyse</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const candidat = row.candidats
            const isLowScore = row.candidat_score !== null && row.candidat_score <= 5
            const isSelected = selectedRows.has(row.candidat_id)
            const badgeStyle = {
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: isLowScore ? '#f8d7da' : '#d4edda',
              color: isLowScore ? 'red' : 'green',
              fontWeight: 'bold' as const,
            }
            return (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: '1px solid #ccc',
                  backgroundColor: isSelected ? '#e3f2fd' : 'transparent'
                }}
              >
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectRow(row.candidat_id, e.target.checked)}
                    style={checkboxStyle}
                  />
                </td>
                <td style={tdStyle}>{candidat?.candidat_firstname ?? '—'}</td>
                <td style={tdStyle}>{candidat?.candidat_lastname ?? '—'}</td>
                <td style={tdStyle}><span style={badgeStyle}>{row.candidat_score ?? '—'}</span></td>
                <td style={tdStyle}>
                  {candidat?.cv_file ? (
                    <a href={candidat.cv_file} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'underline' }}>
                      Voir CV
                    </a>
                  ) : '—'}
                </td>
                <td style={tdStyle}>
                  <select
                    value={row.candidat_next_step ?? ''}
                    onChange={(e) => handleStepChange(row.candidat_id, e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select step</option>
                    {steps.map((step) => (
                      <option key={step.step_id} value={step.step_name}>
                        {step.step_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ flex: 1 }}>{row.candidat_comment ?? '—'}</span>
                  <Popover.Root
                    open={editingId === row.candidat_id}
                    onOpenChange={(open) => open ? handleEditClick(row) : setEditingId(null)}
                  >
                    <Popover.Trigger asChild>
                      <button style={iconBtnStyle}><Edit size={16} /></button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content side="top" align="end" sideOffset={5} collisionPadding={16} avoidCollisions sticky="always" style={popoverStyle}>
                        <textarea value={commentValue} onChange={(e) => setCommentValue(e.target.value)} rows={3} style={textareaStyle}/>
                        <div style={btnContainerStyle}>
                          <button onClick={handleSave} style={iconBtnGreen}><Save size={16} /></button>
                          <Popover.Close asChild>
                            <button style={iconBtnRed}><X size={16} /></button>
                          </Popover.Close>
                        </div>
                        <Popover.Arrow offset={5} width={10} height={5} style={{ fill: 'white', stroke: '#ccc' }} />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </td>
                <td style={tdStyle}>
                  {row.candidat_ai_analyse ? (
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <button style={iconBtnStyle}><Search size={16} /></button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content side="top" align="center" sideOffset={5} collisionPadding={16} avoidCollisions sticky="always" style={aiPopoverStyle}>
                          {row.candidat_ai_analyse}
                          <Popover.Arrow offset={5} width={10} height={5} style={{ fill: 'white', stroke: '#ccc' }} />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  ) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ==== Styles ==== */
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px', fontWeight: 'bold' }
const tdStyle: React.CSSProperties = { padding: '8px', verticalAlign: 'middle' }
const selectStyle: React.CSSProperties = { padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }
const iconBtnStyle: React.CSSProperties = { background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, padding: '4px', cursor: 'pointer' }
const iconBtnGreen: React.CSSProperties = { backgroundColor: '#28a745', color: 'white', padding: '4px', border: 'none', borderRadius: 4, cursor: 'pointer' }
const iconBtnRed: React.CSSProperties = { backgroundColor: '#f8d7da', color: 'black', padding: '4px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }
const popoverStyle: React.CSSProperties = { background: 'white', padding: 10, border: '1px solid #ccc', borderRadius: 6, boxShadow: '0px 4px 6px rgba(0,0,0,0.1)', width: 'min(250px, 90vw)', maxHeight: '60vh', overflowY: 'auto' }
const aiPopoverStyle: React.CSSProperties = { background: 'white', padding: 12, border: '1px solid #ccc', borderRadius: 6, boxShadow: '0px 4px 8px rgba(0,0,0,0.15)', maxWidth: 'min(400px, 90vw)', maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.9rem', paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 48px)' }
const textareaStyle: React.CSSProperties = { width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: 6 }
const btnContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', marginTop: 6, gap: 8 }
const checkboxStyle: React.CSSProperties = { cursor: 'pointer', transform: 'scale(1.1)' }