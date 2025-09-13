'use client'

import PositionsList from '../jobs/[slug]/openedpositions/PositionList'
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-gray-900">
        Available Positions
      </h1>
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">
        <PositionsList />
      </div>
      <Analytics />
    </main>
  )
}
