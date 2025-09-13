'use client'

import Link from "next/link"
import { useSession } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
import { Search, Briefcase, BarChart3, X, Building2, FileText } from 'lucide-react'

type Position = {
  id: number
  position_name: string
  position_description: string
  position_description_detailed: string
  company?: {
    company_logo?: string
    company_name?: string
    slug?: string
  }
}

type Props = {
  initialPositions?: Position[]
  companySlug?: string
}

export default function PositionsList({ initialPositions = [], companySlug }: Props) {
  const session = useSession()
  const isLoggedIn = !!session?.user
  const userId = session?.user?.id

  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingClose, setLoadingClose] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (initialPositions.length > 0) return
    if (isLoggedIn && !userId) return

    async function fetchPositions() {
      setLoading(true)
      setError(null)
      try {
        let url = ""

        if (companySlug) {
          url = `/api/positions-public?slug=${encodeURIComponent(companySlug)}`
        } else if (isLoggedIn && userId) {
          url = `/api/positions-private?userId=${encodeURIComponent(userId)}`
        } else {
          url = `/api/positions-public`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error("Erreur lors du chargement des positions")
        const data = await res.json()
        setPositions(data.positions || [])
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [companySlug, isLoggedIn, userId, initialPositions.length])

  async function handleClose(positionId: number) {
    if (!confirm("Do you really want to close this position?")) return
    setLoadingClose(positionId)
    try {
      const res = await fetch("/api/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert("Error closing position: " + (data.error || "Erreur inconnue"))
        setLoadingClose(null)
        return
      }
      alert("Position closed successfully")
      setPositions((prev) => prev.filter((p) => p.id !== positionId))
    } catch (e) {
      alert("Error closing position: " + (e as Error).message)
    }
    setLoadingClose(null)
  }

  // Function to generate the apply link based on context
  const getApplyLink = (position: Position) => {
    const queryParams = new URLSearchParams({
      position: position.position_name,
      description: position.position_description_detailed,
      id: position.id.toString()
    })

    // If we have a company slug, use the slug-specific route
    if (companySlug) {
      return `/jobs/${companySlug}/cv-analyse?${queryParams.toString()}`
    }
    
    // Otherwise, use the general route
    return `/cv-analyse?${queryParams.toString()}`
  }

  const filteredPositions = positions.filter(
    (p) =>
      (!companySlug || p.company?.slug === companySlug) &&
      (p.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.position_description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Available Positions
            </h1>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
              <span className="font-semibold">{filteredPositions.length}</span>
              <span>positions available</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredPositions.length === 0 && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No positions available</h2>
              <p className="text-gray-500">Check back later for new opportunities!</p>
            </div>
          </div>
        )}

        {/* Positions List - Explicit Single Column */}
        <div style={{ display: 'block', width: '100%' }}>
          {filteredPositions.map((position, index) => (
            <div
              key={position.id}
              style={{ 
                width: '100%', 
                display: 'block', 
                marginBottom: '24px',
                clear: 'both'
              }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="p-6" style={{ width: '100%' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {position.position_name}
                    </h2>
                    {position.company?.company_name && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-5 h-5" />
                        <span className="text-base">{position.company.company_name}</span>
                      </div>
                    )}
                  </div>
                  {position.company?.company_logo && (
                    <div className="flex-shrink-0 ml-6">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg p-3 border">
                        <img
                          src={position.company.company_logo}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base mb-6">
                  {position.position_description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  {!isLoggedIn && (
                    <Link
                      href={getApplyLink(position)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FileText className="w-5 h-5" />
                      Apply
                    </Link>
                  )}
                  
                  {isLoggedIn && (
                    <>
                      <Link
                        href={`/stats?positionId=${position.id}`}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <BarChart3 className="w-5 h-5" />
                        Stats
                      </Link>

                      <button
                        onClick={() => handleClose(position.id)}
                        disabled={loadingClose === position.id}
                        className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loadingClose === position.id ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Closing...
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5" />
                            Close
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}