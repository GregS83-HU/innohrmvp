'use client'

import { useState } from 'react'
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
  candidats?: Candidat | null
}

export default function StatsTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState('')

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

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>First name</th>
          <th style={{ textAlign: 'left' }}>Last Name</th>
          <th style={{ textAlign: 'left' }}>Score</th>
          <th style={{ textAlign: 'left' }}>CV</th>
          <th style={{ textAlign: 'left' }}>Comment</th>
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
            <tr key={index}>
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
                      align="center"
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
  )
}
