'use client'
import { useState } from 'react'

export default function StatsTable({ rows }: { rows: any[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState('')

  const handleEditClick = (row: any) => {
    setEditingId(row.candidat_id)
    setCommentValue(row.candidat_comment || '')
  }

  const handleSave = async () => {
    await fetch('/api/update-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidat_id: editingId,
        comment: commentValue,
      }),
    })
    setEditingId(null)
    window.location.reload() // 🔄 recharge la page pour afficher la mise à jour
    // ici tu peux rafraîchir la page ou mettre à jour le state si tu veux
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
          const candidat = row.candidats as any
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
              <td><span style={badgeStyle}>{row.candidat_score ?? '—'}</span></td>
              <td>
                {candidat?.cv_file ? (
                  <a href={candidat.cv_file} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
                    See the CV
                  </a>
                ) : '—'}
              </td>
              <td>
                {editingId === row.candidat_id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <textarea
                      value={commentValue}
                      onChange={(e) => setCommentValue(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px',
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={handleSave}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '4px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '4px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{row.candidat_comment ?? '—'}</span>
                    <button onClick={() => handleEditClick(row)} style={{ marginLeft: '8px' }}>✏️</button>
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
