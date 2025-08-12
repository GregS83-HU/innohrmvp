'use client'

import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

type Position = {
  id: number
  position_name: string
  position_description: string
  company: {
    company_logo?: string
  }
}

export default function PositionsList() {
  const session = useSession()
  const isLoggedIn = !!session?.user
  const userId = session?.user?.id

  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingClose, setLoadingClose] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  console.log("userID in PositionList:",userId)
  useEffect(() => {
    async function fetchPositions() {
      setLoading(true)
      setError(null)
      console.log("Start Getting Positions")
      try {
        const url = isLoggedIn
          ? `/api/positions-private?userId=${encodeURIComponent(userId!)}`
          : '/api/positions-public'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Erreur lors du chargement des positions')
        const data = await res.json()
        setPositions(data.positions)
      } catch (e) {
        setError((e as Error).message)
      }
      setLoading(false)
    }
    if (isLoggedIn && userId) {
      fetchPositions()
    } else if (!isLoggedIn) {
      fetchPositions()
    }
  }, [isLoggedIn, userId])

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
        alert('Error during the closing of the position:' + (data.error || 'Erreur inconnue'))
        setLoadingClose(null)
        return
      }
      alert('Position closed successfully')
      setPositions((prev) => prev.filter((p) => p.id !== positionId))
    } catch (e) {
      alert('Error during the closing of the position:' + (e as Error).message)
    }
    setLoadingClose(null)
  }

  // Filtrer la liste selon la recherche
  const filteredPositions = positions.filter((p) =>
    p.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <p>Chargement...</p>
  if (error) return <p>Erreur : {error}</p>
  if (positions.length === 0) return <p>No available position at the moment</p>

  return (
    <div>
      {/* Titre avec nombre de positions */}
      <h1
        className="text-2xl font-bold text-center mb-6"
        style={{ userSelect: 'none' }}
      >
        📄 List of available positions <span style={{ color: '#0070f3' }}>({filteredPositions.length})</span>
      </h1>

      {/* Barre de recherche */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search positions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '250px',
          }}
        />
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredPositions.length === 0 && <p>No available position at the moment</p>}

        {filteredPositions.map((position) => (
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <h2 style={{ margin: 0, fontWeight: 'bold' }}>{position.position_name}</h2>
              {position.company?.company_logo && (
                <img
                  src={position.company.company_logo}
                  alt="Logo entreprise"
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                  }}
                />
              )}
            </div>

            <p>{position.position_description}</p>

            <div>
              {!isLoggedIn && (
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
                  📝 Apply
                </Link>
              )}
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
    </div>
  )
}
