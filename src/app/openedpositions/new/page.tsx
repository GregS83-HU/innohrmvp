'use client'

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewOpenedPositionPage() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()

  const [positionName, setPositionName] = useState('')
  const [positionDescription, setPositionDescription] = useState('')
  const [positionStartDate, setPositionStartDate] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return <p>Loading user info...</p>
  }

  const user = session.user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!user) {
      setMessage({ text: '❌ You must be logged in to create a position', type: 'error' })
      return
    }

    setLoading(true)

    const { error } = await supabase.from('OpenedPositions').insert([
      {
        position_name: positionName,
        position_description: positionDescription,
        position_start_date: positionStartDate,
        // Pas d'user_id ici car ta table ne l'a pas
      },
    ])

    setLoading(false)

    if (error) {
      console.error('Error inserting position:', error)
      setMessage({ text: '❌ Error during the creation of the position', type: 'error' })
    } else {
      setMessage({ text: '✅ New position successfully created', type: 'success' })
      setPositionName('')
      setPositionDescription('')
      setPositionStartDate('')
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Position</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="positionName" className="block mb-1 font-medium">
            Position Name
          </label>
          <input
            id="positionName"
            type="text"
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="positionDescription" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="positionDescription"
            value={positionDescription}
            onChange={(e) => setPositionDescription(e.target.value)}
            required
            className="border rounded p-2 w-full"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="positionStartDate" className="block mb-1 font-medium">
            Starting Date
          </label>
          <input
            id="positionStartDate"
            type="date"
            value={positionStartDate}
            onChange={(e) => setPositionStartDate(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 font-medium ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}