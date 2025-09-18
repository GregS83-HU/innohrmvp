'use client'

import Link from "next/link"
import { useSession } from "@supabase/auth-helpers-react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Search, Briefcase, BarChart3, X, Building2, FileText, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

// Simple Snackbar component
function Snackbar({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up z-50">
      {message}
    </div>
  )
}

export default function PositionsList({ initialPositions = [], companySlug }: Props) {
  const router = useRouter()
  const session = useSession()
  const isLoggedIn = !!session?.user
  const userId = session?.user?.id

  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingClose, setLoadingClose] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  // Redirect to 404 if no slug
  useEffect(() => {
    if (!companySlug) {
      router.replace('/404')
    }
  }, [companySlug, router])

  // Memoized filtered positions for better performance
  const filteredPositions = useMemo(() => {
    return positions.filter(
      (p) =>
        (!companySlug || p.company?.slug === companySlug) &&
        (p.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.position_description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [positions, companySlug, searchTerm])

  useEffect(() => {
    if (!companySlug) return
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

  const handleClose = useCallback(async (positionId: number) => {
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
        setSnackbarMessage("Error closing position: " + (data.error || "Erreur inconnue"))
        setLoadingClose(null)
        return
      }
      setSnackbarMessage("Position closed successfully")
      setPositions((prev) => prev.filter((p) => p.id !== positionId))
    } catch (e) {
      setSnackbarMessage("Error closing position: " + (e as Error).message)
    }
    setLoadingClose(null)
  }, [])

  // Memoized link generators for better performance
  const getApplyLink = useCallback((position: Position) => {
  if (!companySlug) return null
  // Only pass the position ID - much cleaner URL!
  return `/jobs/${companySlug}/cv-analyse?id=${position.id}`
}, [companySlug])

  const getStatsLink = useCallback((position: Position) => {
    if (!companySlug) return null
    return `/jobs/${companySlug}/stats?positionId=${position.id}`
  }, [companySlug])

  const getPublicLink = useCallback((position: Position) => {
  if (!companySlug) return null
  const url = new URL(
    `/jobs/${companySlug}/cv-analyse?id=${position.id}`,
    window.location.origin
  )
  return url.toString()
}, [companySlug])

  const handleCopyLink = useCallback(async (position: Position) => {
    const link = getPublicLink(position)
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setSnackbarMessage("Link copied to clipboard!")
    } catch (err) {
      setSnackbarMessage("Failed to copy link: " + (err as Error).message)
    }
  }, [getPublicLink])

  // Hide snackbar after 3 seconds
  useEffect(() => {
    if (snackbarMessage) {
      const timer = setTimeout(() => setSnackbarMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [snackbarMessage])

  if (!companySlug) {
    return null // Already redirecting to 404
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Available Positions
            </h1>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base">
              <span className="font-semibold">{filteredPositions.length}</span>
              <span>positions available</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredPositions.length === 0 && (
          <div className="text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No positions available</h2>
              <p className="text-gray-500 text-sm sm:text-base">Check back later for new opportunities!</p>
            </div>
          </div>
        )}

        {/* Positions List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredPositions.map((position) => (
            <div
              key={position.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] sm:hover:scale-[1.02]"
            >
              <div className="p-4 sm:p-6">
                {/* Header with responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0"> {/* min-w-0 allows text truncation */}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                      {position.position_name}
                    </h2>
                    {position.company?.company_name && (
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">{position.company.company_name}</span>
                      </div>
                    )}
                  </div>
                  {position.company?.company_logo && (
                    <div className="flex-shrink-0 self-start sm:ml-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg p-2 sm:p-3 border">
                        <img
                          src={position.company.company_logo}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  {position.position_description}
                </p>

                {/* Actions - Responsive button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {!isLoggedIn && companySlug && (
                    <Link
                      href={getApplyLink(position)!}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      Apply
                    </Link>
                  )}

                  {isLoggedIn && companySlug && (
                    <>
                      {/* Board */}
                      <Link
                        href={getStatsLink(position)!}
                        className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                      >
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                        Board
                      </Link>

                      {/* Copy Link */}
                      <button
                        onClick={() => handleCopyLink(position)}
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                      >
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                        Copy Link
                      </button>

                      {/* Close */}
                      <button
                        onClick={() => handleClose(position.id)}
                        disabled={loadingClose === position.id}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                      >
                        {loadingClose === position.id ? (
                          <>
                            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="hidden sm:inline">Closing...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {/* Snackbar */}
      {snackbarMessage && <Snackbar message={snackbarMessage} />}
    </div>
  )
}