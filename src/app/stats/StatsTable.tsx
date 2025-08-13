'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import * as Popover from '@radix-ui/react-popover'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text?: string
  cv_file?: string
}

type Row = {
  candidat_score: number | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null // 🔹 ajouté
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

  const session = useSession()
  const supabase = useSupabaseClient()

  // 🔹 Récupération des étapes pour la dropdown
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
        body: JSON.stringify({
          candidat_id: editingId,
          comment: commentValue,
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.candidat_id === editingId
              ? { ...row, candidat_comment: commentValue }
              : row
          )
        )
        setEditingId(null)
      } else {
        console.error('Update failed', data)
        alert(data?.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Network or unexpected error', err)
      alert('Erreur réseau ou inattendue')
    }
  }

  /*const handleStepChange = async (candidat_id: number, step_id: string) => {
    console.log(`Candidat ${candidat_id} → Nouvelle étape ${step_id}`)
    // 🔹 Ici tu peux ajouter un appel API pour sauvegarder step_id dans position_to_candidat
    setRows((prev) =>
      prev.map((row) =>
        row.candidat_id === candidat_id ? { ...row, candidat_next_step: step_id } : row
      )
    )
  }*/
 
  const handleStepChange = async (candidat_id: number, step_name: string) => {
  // Si step_name est vide, envoyer null au backend
  const stepValueToSend = step_name === '' ? null : step_name

  try {
    const res = await fetch('/api/update-next-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidat_id, step_name: stepValueToSend }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Erreur mise à jour étape', errorData)
      alert('Erreur lors de la mise à jour de l’étape')
      return
    }

    setRows(prev =>
      prev.map(row =>
        row.candidat_id === candidat_id
          ? { ...row, candidat_next_step: stepValueToSend }
          : row
      )
    )
  } catch (err) {
    console.error('Erreur réseau', err)
    alert('Erreur réseau lors de la mise à jour')
  }
}

  

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th>First name</th>
              <th>Last Name</th>
              <th>Score</th>
              <th>CV</th>
              <th>Next Step</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const candidat = row.candidats
              const isLowScore = row.candidat_score !== null && row.candidat_score <= 5

              const badgeStyle = {
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: isLowScore ? '#f8d7da' : '#d4edda',
                color: isLowScore ? 'red' : 'green',
                fontWeight: 'bold' as const,
              }

              return (
                <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{candidat?.candidat_firstname ?? '—'}</td>
                  <td>{candidat?.candidat_lastname ?? '—'}</td>
                  <td>
                    <span style={badgeStyle}>{row.candidat_score ?? '—'}</span>
                  </td>
                  <td>
                    {candidat?.cv_file ? (
                      <a
                        href={candidat.cv_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0070f3' }}
                      >
                        See the CV
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <select
                      value={row.candidat_next_step ?? ''} // 🔹 valeur depuis la DB si existante
                      onChange={(e) => handleStepChange(row.candidat_id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="">Select step</option>
                      {steps.map((step) => (
                        <option key={step.step_id} value={step.step_name}>
                          {step.step_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{row.candidat_comment ?? '—'}</span>
                    <Popover.Root
                      open={editingId === row.candidat_id}
                      onOpenChange={(open) =>
                        open ? handleEditClick(row) : setEditingId(null)
                      }
                    >
                      <Popover.Trigger asChild>
                        <button>✏️</button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="top"
                          align="end"
                          style={{
                            background: 'white',
                            padding: 10,
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            width: 250,
                          }}
                        >
                          <textarea
                            value={commentValue}
                            onChange={(e) => setCommentValue(e.target.value)}
                            rows={3}
                            style={{
                              width: '100%',
                              border: '1px solid #ccc',
                              borderRadius: 4,
                              padding: 6,
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              marginTop: 6,
                              gap: 8,
                            }}
                          >
                            <button
                              onClick={handleSave}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: '6px 10px',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              💾
                            </button>
                            <Popover.Close asChild>
                              <button
                                style={{
                                  backgroundColor: '#f7f7f7ff',
                                  color: 'black',
                                  padding: '6px 10px',
                                  border: '1px solid black',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                              >
                                ❌
                              </button>
                            </Popover.Close>
                          </div>
                          <Popover.Arrow
                            offset={5}
                            width={10}
                            height={5}
                            style={{ fill: 'white', stroke: '#ccc' }}
                          />
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
