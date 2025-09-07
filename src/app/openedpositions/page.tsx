'use client'

import PositionsList from './PositionList'
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  return (
    <main style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold text-center mb-6">
      </h1>
      <PositionsList />
    </main>
  )
}
