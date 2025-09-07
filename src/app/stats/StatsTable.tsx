'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import * as Popover from '@radix-ui/react-popover'
import { Edit, Save, X, Search, BarChart3, Users, CheckSquare, Square, ArrowUp, ArrowDown, ArrowUpDown, FileText, User, Calendar } from 'lucide-react'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_text?: string
  cv_file?: string
  created_at: string // Retiré le ? pour le rendre obligatoire
}

type Row = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  candidats?: Candidat | null
}

type RecruitmentStep = {
  step_id: string
  step_name: string
}

type SortField = 'score' | 'date' | null

export default function StatsTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [steps, setSteps] = useState<RecruitmentStep[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentValue, setCommentValue] = useState('')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return
    const fetchSteps = async () => {
      try {
        const res = await fetch(`/api/recruitment-step?user_id=${session.user.id}`)
        if (!res.ok) {
          console.error('Erreur API', await res.text())
          return
        }
        const data = await res.json()
        setSteps(data)
      } catch (error) {
        console.error('Erreur chargement steps', error)
      }
    }
    fetchSteps()
  }, [session])

  const handleSelectRow = (candidat_id: number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(candidat_id)
      } else {
        newSet.delete(candidat_id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rows.map(row => row.candidat_id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleEditClick = (row: Row) => {
    setEditingId(row.candidat_id)
    setCommentValue(row.candidat_comment ?? '')
  }

  const handleSave = async () => {
    if (editingId === null) return
    try {
      const res = await fetch('/api/update-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidat_id: editingId, comment: commentValue }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        setRows((prev) =>
          prev.map((row) =>
            row.candidat_id === editingId ? { ...row, candidat_comment: commentValue } : row
          )
        )
        setEditingId(null)
      } else {
        console.error('Update failed', data)
        alert(data?.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Network error', err)
      alert('Erreur réseau ou inattendue')
    }
  }

  const handleStepChange = async (candidat_id: number, step_name: string) => {
    const stepValueToSend = step_name === '' ? null : step_name
    
    const isRowSelected = selectedRows.has(candidat_id)
    const candidatsToUpdate = isRowSelected && selectedRows.size > 1 
      ? Array.from(selectedRows) 
      : [candidat_id]

    try {
      const updatePromises = candidatsToUpdate.map(id => 
        fetch('/api/update-next-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidat_id: id, step_name: stepValueToSend }),
        })
      )

      const responses = await Promise.all(updatePromises)
      const hasError = responses.some(res => !res.ok)

      if (hasError) {
        console.error('Erreur mise à jour étape')
        alert("Erreur lors de la mise à jour de l'étape")
        return
      }

      setRows((prev) =>
        prev.map((row) =>
          candidatsToUpdate.includes(row.candidat_id) 
            ? { ...row, candidat_next_step: stepValueToSend } 
            : row
        )
      )

      if (candidatsToUpdate.length > 1) {
        setSelectedRows(new Set())
      }
    } catch (err) {
      console.error('Erreur réseau', err)
      alert('Erreur réseau lors de la mise à jour')
    }
  }

  const handleSort = (field: SortField) => {
    let newOrder: 'asc' | 'desc' | null = null
    
    if (sortField !== field) {
      // Nouveau champ de tri
      setSortField(field)
      newOrder = 'desc' // Commencer par desc pour les dates (plus récent d'abord)
    } else {
      // Même champ, changer l'ordre
      if (sortOrder === null) newOrder = 'desc'
      else if (sortOrder === 'desc') newOrder = 'asc'
      else newOrder = null
    }
    
    setSortOrder(newOrder)

    if (newOrder === null) {
      setSortField(null)
      setRows(initialRows)
    } else {
      const sorted = [...rows].sort((a, b) => {
        if (field === 'score') {
          if (a.candidat_score === null) return 1
          if (b.candidat_score === null) return -1
          if (newOrder === 'asc') return a.candidat_score - b.candidat_score
          return b.candidat_score - a.candidat_score
        } else if (field === 'date') {
          const dateA = a.candidats?.created_at ? new Date(a.candidats.created_at).getTime() : 0
          const dateB = b.candidats?.created_at ? new Date(b.candidats.created_at).getTime() : 0
          if (newOrder === 'asc') return dateA - dateB
          return dateB - dateA
        }
        return 0
      })
      setRows(sorted)
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 ml-1" />
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-500 ml-1" />
    }
    if (sortOrder === 'desc') {
      return <ArrowDown className="w-4 h-4 text-blue-500 ml-1" />
    }
    return <ArrowUpDown className="w-4 h-4 text-gray-400 ml-1" />
  }

  // Fonction améliorée pour formater les dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    try {
      // Support pour différents formats de date de Supabase
      const date = new Date(dateString)
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn('Date invalide:', dateString)
        return '—'
      }
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Erreur formatage date:', error, 'Date string:', dateString)
      return '—'
    }
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        console.warn('DateTime invalide:', dateString)
        return '—'
      }
      
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Erreur formatage datetime:', error, 'Date string:', dateString)
      return '—'
    }
  }

  const isAllSelected = rows.length > 0 && selectedRows.size === rows.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < rows.length

  const getScoreBadgeStyle = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-600"
    if (score <= 5) return "bg-red-100 text-red-700"
    if (score <= 7) return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Candidates Analysis
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{rows.length}</span>
                <span>candidates</span>
              </div>
              {selectedRows.size > 0 && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full">
                  <CheckSquare className="w-4 h-4" />
                  <span className="font-semibold">{selectedRows.size}</span>
                  <span>selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
            <table className="w-full" style={{ minWidth: '1000px' }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <div className="flex items-center">
                      {isAllSelected ? (
                        <CheckSquare 
                          className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700" 
                          onClick={() => handleSelectAll(false)}
                        />
                      ) : isIndeterminate ? (
                        <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 cursor-pointer hover:bg-blue-700 flex items-center justify-center"
                             onClick={() => handleSelectAll(true)}>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      ) : (
                        <Square 
                          className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" 
                          onClick={() => handleSelectAll(true)}
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      First Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    Last Name
                  </th>
                  <th 
                    className="px-4 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center">
                      Score
                      {renderSortIcon('score')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Application Date
                      {renderSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CV
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    Next Step
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    Comment
                  </th>
                  <th className="px-4 py-4 text-left font-semibold text-gray-700">
                    AI Analysis
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const candidat = row.candidats
                  const isSelected = selectedRows.has(row.candidat_id)
                  
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-3 py-4 w-12">
                        {isSelected ? (
                          <CheckSquare 
                            className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700" 
                            onClick={() => handleSelectRow(row.candidat_id, false)}
                          />
                        ) : (
                          <Square 
                            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" 
                            onClick={() => handleSelectRow(row.candidat_id, true)}
                          />
                        )}
                      </td>
                      
                      <td className="px-3 py-4 font-medium text-gray-800 w-32 truncate">
                        {candidat?.candidat_firstname ?? '—'}
                      </td>
                      
                      <td className="px-3 py-4 font-medium text-gray-800 w-32 truncate">
                        {candidat?.candidat_lastname ?? '—'}
                      </td>
                      
                      <td className="px-3 py-4 w-24">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreBadgeStyle(row.candidat_score)}`}>
                          {row.candidat_score ?? '—'}
                        </span>
                      </td>
                      
                      <td className="px-3 py-4 w-32">
                        <div className="text-sm text-gray-600" title={formatDateTime(candidat?.created_at)}>
                          {formatDate(candidat?.created_at)}
                        </div>
                      </td>
                      
                      <td className="px-3 py-4 w-24">
                        {candidat?.cv_file ? (
                          <a 
                            href={candidat.cv_file} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                          >
                            <FileText className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      
                      <td className="px-3 py-4 w-40">
                        <select
                          value={row.candidat_next_step ?? ''}
                          onChange={(e) => handleStepChange(row.candidat_id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-xs w-full"
                        >
                          <option value="">Select step</option>
                          {steps.map((step) => (
                            <option key={step.step_id} value={step.step_name}>
                              {step.step_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="px-3 py-4 w-48">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-gray-700 text-xs truncate" title={row.candidat_comment ?? ''}>
                            {row.candidat_comment ?? '—'}
                          </span>
                          <Popover.Root
                            open={editingId === row.candidat_id}
                            onOpenChange={(open) => open ? handleEditClick(row) : setEditingId(null)}
                          >
                            <Popover.Trigger asChild>
                              <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <Edit className="w-3 h-3" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content 
                                side="top" 
                                align="end" 
                                sideOffset={5} 
                                collisionPadding={16} 
                                avoidCollisions 
                                sticky="always"
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                                style={{ width: 'min(300px, 90vw)', maxHeight: '60vh', overflowY: 'auto' }}
                              >
                                <textarea 
                                  value={commentValue} 
                                  onChange={(e) => setCommentValue(e.target.value)} 
                                  rows={3} 
                                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                  placeholder="Add your comment here..."
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                  <button 
                                    onClick={handleSave} 
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <Popover.Close asChild>
                                    <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </Popover.Close>
                                </div>
                                <Popover.Arrow className="fill-white stroke-gray-200" />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        </div>
                      </td>
                      
                      <td className="px-3 py-4 w-28 text-center">
                        {row.candidat_ai_analyse ? (
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                <Search className="w-3 h-3" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content 
                                side="top" 
                                align="center" 
                                sideOffset={5} 
                                collisionPadding={16} 
                                avoidCollisions 
                                sticky="always"
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                                style={{ 
                                  maxWidth: 'min(450px, 90vw)', 
                                  maxHeight: '60vh', 
                                  overflowY: 'auto',
                                  paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 24px)'
                                }}
                              >
                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {row.candidat_ai_analyse}
                                </div>
                                <Popover.Arrow className="fill-white stroke-gray-200" />
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No candidates found</h2>
            <p className="text-gray-500">There are no candidates to analyze for this position yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}