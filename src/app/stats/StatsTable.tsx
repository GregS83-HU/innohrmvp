'use client'

import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'

type Candidat = {
  id: number
  candidat_firstname: string
  candidat_lastname: string
  cv_text: string
  cv_file: string
}

type Row = {
  candidat_score: number | null
  candidat_id: number
  candidat_comment: string | null
  candidats?: Candidat[]
}

export default function StatsTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState('')

  const handleEditClick = (row: Row) => {
    setEditingId(row.candidat_id)
    setCommentValue(row.candidat_comment || '')
  }

  const handleSave = async () => {
    if (editingId === null) return

    try {
      const res: Response = await fetch('/api/update-comment', {
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
          <th>First name</th>
          <th>Last Name</th>
          <th>Score</th>
          <th>CV</th>
          <th>Comment</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const candidat = row.candidats?.[0] // prendre le premier candidat s'il existe
          const isLowScore =
            row.candidat_score !== null && row.candidat_score <= 5

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
              <td>
                <Popover.Root
                  open={editingId === row.candidat_id}
                  onOpenChange={(open) =>
                    open ? handleEditClick(row) : setEditingId(null)
                  }
                >
                  <Popover.Trigger asChild>
                    <button style={{ marginLeft: '8px' }}>✏️</button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      side="top"
                      align="center"
                      style={{
                        background: 'white',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '250px',
                      }}
                    >
                      <textarea
                        value={commentValue}
                        onChange={(e) => setCommentValue(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '6px',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginTop: '6px',
                          gap: '8px',
                        }}
                      >
                        <button
                          onClick={handleSave}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '6px 10px',
                            border: 'none',
                            borderRadius: '4px',
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
                              borderRadius: '4px',
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
                <span style={{ marginLeft: '8px' }}>
                  {row.candidat_comment ?? '—'}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
