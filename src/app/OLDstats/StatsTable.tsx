'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Users, FileText, BarChart3, X, Mail, Phone } from 'lucide-react'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_file?: string
  created_at: string
  candidat_email: string
  candidat_phone: string
}

type Row = {
  candidat_score: number | null
  candidat_ai_analyse: string | null
  candidat_id: number
  candidat_comment: string | null
  candidat_next_step: string | null
  source: string | null
  candidats?: Candidat | null
}

type RecruitmentStep = {
  step_id: string
  step_name: string
}

function Card({ row, onClick }: { row: Row; onClick: (row: Row) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.candidat_id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Get color based on score
  const getScoreColor = (score: number | null) => {
    if (!score) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    if (score >= 8) return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' }
    if (score >= 6) return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' }
    return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  }

  const getScoreBadgeColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-700'
    if (score >= 8) return 'bg-green-100 text-green-700'
    if (score >= 6) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const scoreColors = getScoreColor(row.candidat_score)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) onClick(row)
      }}
      className={`${scoreColors.bg} rounded-lg shadow-sm border ${scoreColors.border} p-3 cursor-pointer hover:shadow-md transition-all select-none mb-2 group touch-manipulation`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className={`font-medium ${scoreColors.text} text-sm leading-tight`}>
            {row.candidats?.candidat_firstname ?? '—'} {row.candidats?.candidat_lastname ?? ''}
          </p>
          <p className="text-xs text-gray-500">ID: {row.candidat_id}</p>
        </div>
        {row.candidat_score !== null && (
          <span className={`${getScoreBadgeColor(row.candidat_score)} text-xs px-2 py-1 rounded-full font-medium`}>
            {row.candidat_score}
          </span>
        )}
      </div>

      {/* Candidate email & phone */}
      <div className="space-y-1 mb-2">
        {row.candidats?.candidat_email && (
          <a
            href={`mailto:${row.candidats.candidat_email}`}
            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-3 h-3" /> {row.candidats.candidat_email}
          </a>
        )}
        {row.candidats?.candidat_phone && (
          <a
            href={`tel:${row.candidats.candidat_phone}`}
            className="flex items-center gap-1 text-green-600 hover:underline text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3 h-3" /> {row.candidats.candidat_phone}
          </a>
        )}
      </div>

      {row.candidat_comment && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {row.candidat_comment}
        </p>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {row.candidats?.created_at ? new Date(row.candidats.created_at).toLocaleDateString('en-GB') : '—'}
        </span>
        {row.candidats?.cv_file && (
          <FileText className="w-3 h-3 text-blue-500" />
        )}
      </div>
    </div>
  )
}

// Droppable column with useDroppable hook
function Column({ 
  columnId, 
  columnName, 
  rows, 
  onCardClick,
}: { 
  columnId: string
  columnName: string
  rows: Row[]
  onCardClick: (row: Row) => void
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  })

  const isRejected = columnName.toLowerCase() === "rejected"
  const baseBg = isRejected ? "bg-red-100" : "bg-gray-100"
  const badgeBg = isRejected ? "bg-red-200 text-red-700" : "bg-gray-200 text-gray-600"
  const titleColor = isRejected ? "text-red-700" : "text-gray-700"

  return (
    <div
      ref={setNodeRef}
      className={`${baseBg} rounded-lg p-3 w-72 flex-shrink-0 min-h-[400px] flex flex-col transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-sm font-semibold ${titleColor} uppercase tracking-wide`}>
          {columnName}
        </h2>
        <span className={`${badgeBg} text-xs px-2 py-1 rounded-full font-medium`}>
          {rows.length}
        </span>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <SortableContext items={rows.map(r => r.candidat_id.toString())} strategy={verticalListSortingStrategy}>
          {rows.map(row => (
            <Card key={row.candidat_id} row={row} onClick={onCardClick} />
          ))}
        </SortableContext>
        
        {rows.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-sm italic">Drop candidates here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrelloBoard({ rows: initialRows }: { rows: Row[] }) {
  const session = useSession()
  const [steps, setSteps] = useState<RecruitmentStep[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<Row | null>(null)
  const [draggingRow, setDraggingRow] = useState<Row | null>(null)
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null)
  const [currentMousePosition, setCurrentMousePosition] = useState({ x: 0, y: 0 })

  // Auto-scroll functionality for smooth column transitions
  const handleAutoScroll = (clientX: number) => {
    if (!scrollContainer || !isDragging) return

    const containerRect = scrollContainer.getBoundingClientRect()
    const scrollThreshold = 100
    const maxScrollSpeed = 8
    const minScrollSpeed = 1
    
    let scrollSpeed = 0
    
    if (clientX - containerRect.left < scrollThreshold) {
      const distanceFromEdge = clientX - containerRect.left
      const speedMultiplier = Math.max(0, (scrollThreshold - distanceFromEdge) / scrollThreshold)
      scrollSpeed = -(minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * speedMultiplier)
    } else if (containerRect.right - clientX < scrollThreshold) {
      const distanceFromEdge = containerRect.right - clientX
      const speedMultiplier = Math.max(0, (scrollThreshold - distanceFromEdge) / scrollThreshold)
      scrollSpeed = minScrollSpeed + (maxScrollSpeed - minScrollSpeed) * speedMultiplier
    }

    if (scrollSpeed !== 0) {
      scrollContainer.scrollLeft += scrollSpeed
    }
  }

  const clearAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      setAutoScrollInterval(null)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX: number
      if (e instanceof MouseEvent) {
        clientX = e.clientX
      } else {
        clientX = e.touches[0]?.clientX || 0
      }
      setCurrentMousePosition({ x: clientX, y: 0 })
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove)

    const interval = setInterval(() => {
      handleAutoScroll(currentMousePosition.x)
    }, 16)
    
    setAutoScrollInterval(interval)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      clearInterval(interval)
    }
  }, [isDragging, scrollContainer, currentMousePosition.x])

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const resSteps = await fetch(`/api/recruitment-step?user_id=${session.user.id}`)
        const stepsData = await resSteps.json()
        setSteps(stepsData)

        const normalizedRows = initialRows.map(r => ({
          ...r,
          candidat_next_step: r.candidat_next_step !== null && r.candidat_next_step !== undefined 
            ? String(r.candidat_next_step) 
            : null,
        }))
        
        setRows(normalizedRows)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, initialRows])

  const handleStepChange = async (candidat_id: number, step_id: string | null) => {
    const originalRows = [...rows]
    
    setRows(prev =>
      prev.map(r => (r.candidat_id === candidat_id ? { 
        ...r, 
        candidat_next_step: step_id === 'unassigned' ? null : step_id 
      } : r))
    )

    try {
      const response = await fetch('/api/update-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidat_id, 
          step_id: step_id === 'unassigned' ? null : Number(step_id)
        }),
      })

      if (!response.ok) throw new Error('Failed to update step')
    } catch (err) {
      console.error('Error updating step:', err)
      setRows(originalRows)
      alert("Erreur lors de la mise à jour de l'étape")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const row = rows.find(r => r.candidat_id.toString() === active.id) || null
    setDraggingRow(row)
    setIsDragging(true)
    
    const scrollElement = document.querySelector('#scroll-container') as HTMLElement
    if (scrollElement) {
      setScrollContainer(scrollElement)
      scrollElement.style.overflowX = 'hidden'
      scrollElement.style.touchAction = 'none'
    }
  }

  const findColumnForElement = (elementId: string): string | null => {
    const columns = [{ step_id: 'unassigned', step_name: 'Unassigned' }, ...steps]
    if (columns.some(col => col.step_id === elementId)) return elementId

    const candidateId = Number(elementId)
    const candidate = rows.find(r => r.candidat_id === candidateId)
    return candidate ? candidate.candidat_next_step || 'unassigned' : null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingRow(null)
    setIsDragging(false)
    clearAutoScroll()
    
    if (scrollContainer) {
      scrollContainer.style.overflowX = 'auto'
      scrollContainer.style.touchAction = 'auto'
      setScrollContainer(null)
    }
    
    const { active, over } = event
    if (!over || !active) return

    const activeId = Number(active.id)
    const currentRow = rows.find(r => r.candidat_id === activeId)
    if (!currentRow) return

    const targetColumnId = findColumnForElement(over.id as string)
    if (targetColumnId === null) return

    const newStepId: string | null = targetColumnId === 'unassigned' ? null : targetColumnId
    if (currentRow.candidat_next_step !== newStepId) {
      handleStepChange(activeId, newStepId)
    }
  }

  const getRowsByStepId = (stepId: string | null) => {
    return rows.filter(r => {
      if ((r.candidat_next_step ?? null) === (stepId ?? null)) return true
      return String(r.candidat_next_step) === String(stepId)
    })
  }

  const getStepName = (stepId: string | null) => {
    if (!stepId) return 'Unassigned'
    const stepIdStr = String(stepId)
    const foundStep = steps.find(s => String(s.step_id) === stepIdStr)
    return foundStep?.step_name ?? 'Unknown'
  }

  if (loading || steps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading board...</p>
        </div>
      </div>
    )
  }

  const columns = [{ step_id: 'unassigned', step_name: 'Unassigned' }, ...steps]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Recruitment Board</h1>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
              <Users className="w-5 h-5" />
              <span className="font-semibold text-lg">{rows.length}</span>
              <span>candidates</span>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div 
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            id="scroll-container"
          >
            {columns.map(col => {
              const columnRows = col.step_id === 'unassigned' 
                ? getRowsByStepId(null) 
                : getRowsByStepId(col.step_id)
              
              return (
                <Column
                  key={col.step_id}
                  columnId={col.step_id}
                  columnName={col.step_name}
                  rows={columnRows}
                  onCardClick={setSelectedCandidate}
                />
              )
            })}
          </div>

          <DragOverlay>
            {draggingRow && (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-3 cursor-grabbing w-72 transform rotate-3 z-50">
                <p className="font-medium text-gray-800 text-sm">
                  {draggingRow.candidats?.candidat_firstname} #{draggingRow.candidat_id}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Score: {draggingRow.candidat_score ?? '—'}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedCandidate(null)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {selectedCandidate.candidats?.candidat_firstname ?? '—'}{' '}
                {selectedCandidate.candidats?.candidat_lastname ?? ''}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                ID: {selectedCandidate.candidat_id}
              </p>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Score</h3>
                  <p className="text-lg font-bold text-blue-900">{selectedCandidate.candidat_score ?? 'Not scored'}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Comment</h3>
                  <p className="text-gray-800">{selectedCandidate.candidat_comment ?? 'No comments yet'}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-800 mb-1">AI Analysis</h3>
                  <p className="text-gray-800">{selectedCandidate.candidat_ai_analyse ?? 'No AI analysis available'}</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-purple-800 mb-1">Source</h3>
                  <p className="text-gray-800">{selectedCandidate.source ?? 'Not specified'}</p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-800 mb-1">Next Step</h3>
                  <p className="text-gray-800">
                    {getStepName(selectedCandidate.candidat_next_step)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
