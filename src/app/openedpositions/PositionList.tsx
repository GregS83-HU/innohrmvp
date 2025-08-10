'use client'

import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'

type Position = {
  id: number
  position_name: string
  position_description: string
}

export default function PositionsList({ positions }: { positions: Position[] }) {
  const session = useSession()
  const isLoggedIn = !!session?.user

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
          }}
        >
          <h2>{position.position_name}</h2>
          <p>{position.position_description}</p>

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
          )}
        </li>
      ))}
    </ul>
  )
}