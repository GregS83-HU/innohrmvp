'use client'

import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import { useState } from 'react'

type Position = {
  id: number
  position_name: string
  position_description: string
  company: {
    company_logo?: string
  }
}


export default function PositionsList({ positions }: { positions: Position[] }) {
  const session = useSession()
  const isLoggedIn = !!session?.user
  const [loadingClose, setLoadingClose] = useState<number | null>(null) // id de la position en cours de fermeture

  async function handleClose(positionId: number) {
    if (!confirm('Do you really want to close this position?')) return

    setLoadingClose(positionId)
    try {
      const res = await fetch('/api/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId }),
      })

      const data = await res.json()

      if (!res.ok) {

        alert('Erreur lors de la fermeture de la position: ' + (data.error || 'Erreur inconnue'))
        setLoadingClose(null)
        return
      }

      alert('Position fermée avec succès. Merci !')
      // Ici tu peux aussi rafraîchir la liste ou recharger la page si besoin
      location.reload()
    } catch(e) {
        alert('Erreur lors de la fermeture de la position : ' + (e as Error).message)
        setLoadingClose
    }
  }  



  return (
    
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {positions.map((position) => (
        <li
          key={position.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header avec titre et logo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <h2 style={{ margin: 0, fontWeight: 'bold'}}>{position.position_name}</h2>
            {position.company.company_logo && (
              <img
                src={position.company.company_logo}
                alt="Logo entreprise"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              />
            )}
          </div>

          <p>{position.position_description}</p>

          <div>
            <Link
              href={`/cv-analyse?position=${encodeURIComponent(position.position_name)}&description=${encodeURIComponent(
                position.position_description
              )}&id=${position.id}`}
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              📝 Postuler
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  href={`/stats?positionId=${position.id}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    marginLeft: '0.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                  }}
                >
                  📊 Stats
                </Link>

                <button
                  onClick={() => handleClose(position.id)}
                  disabled={loadingClose === position.id}
                  style={{
                    marginLeft: '0.5rem',
                    marginTop: '1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {loadingClose === position.id ? 'Fermeture...' : 'Fermer'}
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}