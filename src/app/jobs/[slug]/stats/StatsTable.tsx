'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import InterviewList from '../../../../../components/InterviewList'
import { useSession } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider'
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
import { Users, FileText, Mail, Phone, Edit3, Save, XCircle, Eye, EyeOff, Workflow, Check } from 'lucide-react'

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

function Card({ 
  row, 
  onClick, 
  isSelected, 
  onToggleSelection,
}: { 
  row: Row
  onClick: (row: Row) => void
  isSelected: boolean
  onToggleSelection: (candidateId: number, event: React.MouseEvent) => void
}) {
  const { t } = useLocale()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.candidat_id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getScoreColor = (score: number | null) => {
    if (score === null || score === undefined) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    if (score >= 8) return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' }
    if (score >= 6) return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' }
    return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' }
  }

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-700'
    if (score >= 8) return 'bg-green-100 text-green-700'
    if (score >= 6) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const scoreColors = getScoreColor(row.candidat_score)

  const cardClasses = `
    ${scoreColors.bg} rounded-lg shadow-sm border 
    ${isSelected 
      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
      : scoreColors.border
    } 
    p-3 cursor-pointer hover:shadow-md transition-all select-none mb-2 group touch-manipulation relative
  `

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) {
          if (e.ctrlKey || e.metaKey) {
            onToggleSelection(row.candidat_id, e)
          } else {
            onClick(row)
          }
        }
      }}
      className={cardClasses}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div>
          <p className={`font-medium ${isSelected ? 'text-blue-800' : scoreColors.text} text-sm leading-tight`}>
            {row.candidats?.candidat_firstname ?? '—'} {row.candidats?.candidat_lastname ?? ''}
          </p>
          <p className="text-xs text-gray-500">{t('trelloBoard.card.id')}: {row.candidat_id}</p>
        </div>
        {row.candidat_score !== null && (
          <span className={`${getScoreBadgeColor(row.candidat_score)} text-xs px-2 py-1 rounded-full font-medium ${isSelected ? 'ml-6' : ''}`}>
            {row.candidat_score}
          </span>
        )}
      </div>

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
          <a
            href={row.candidats.cv_file}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 hover:underline text-xs transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-3 h-3" />
            <span>{t('trelloBoard.card.viewCV')}</span>
          </a>
        )}
      </div>
    </div>
  )
}

function Column({ 
  columnId, 
  columnName, 
  rows, 
  onCardClick,
  isRejectedColumn = false,
  showRejected = true,
  selectedCandidates,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: { 
  columnId: string
  columnName: string
  rows: Row[]
  onCardClick: (row: Row) => void
  isRejectedColumn?: boolean
  showRejected?: boolean
  selectedCandidates: Set<number>
  onToggleSelection: (candidateId: number, event: React.MouseEvent) => void
  onSelectAll: (columnId: string) => void
  onDeselectAll: (columnId: string) => void
}) {
  const { t } = useLocale()
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  })

  const isRejected = columnName.toLowerCase() === "rejected"
  const baseBg = isRejected ? "bg-red-100" : "bg-gray-100"
  const badgeBg = isRejected ? "bg-red-200 text-red-700" : "bg-gray-200 text-gray-600"
  const titleColor = isRejected ? "text-red-700" : "text-gray-700"

  const displayRows = isRejectedColumn && !showRejected ? [] : rows
  const actualCount = rows.length

  const selectedInColumn = displayRows.filter(row => selectedCandidates.has(row.candidat_id)).length
  const allSelected = displayRows.length > 0 && selectedInColumn === displayRows.length

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
        <div className="flex items-center gap-2">
          <span className={`${badgeBg} text-xs px-2 py-1 rounded-full font-medium`}>
            {actualCount}
          </span>
          {selectedInColumn > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {selectedInColumn} {t('trelloBoard.stats.selected')}
            </span>
          )}
        </div>
      </div>

      {displayRows.length > 0 && (
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => onSelectAll(columnId)}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            disabled={allSelected}
          >
            {t('trelloBoard.buttons.selectAll')}
          </button>
          <button
            onClick={() => onDeselectAll(columnId)}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            disabled={selectedInColumn === 0}
          >
            {t('trelloBoard.buttons.selectNone')}
          </button>
        </div>
      )}
      
      <div className="flex-1 min-h-[300px]">
        <SortableContext items={displayRows.map(r => r.candidat_id.toString())} strategy={verticalListSortingStrategy}>
          {displayRows.map(row => (
            <Card 
              key={row.candidat_id} 
              row={row} 
              onClick={onCardClick}
              isSelected={selectedCandidates.has(row.candidat_id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </SortableContext>
        
        {displayRows.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
            {isRejectedColumn && !showRejected ? (
              <p className="text-gray-500 text-sm italic">{t('trelloBoard.column.rejectedHidden')}</p>
            ) : (
              <p className="text-gray-500 text-sm italic">{t('trelloBoard.column.dropHere')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrelloBoard({ rows: initialRows }: { rows: Row[] }) {
  const { t } = useLocale()
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
  const [showRejected, setShowRejected] = useState(false)
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [editedComment, setEditedComment] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set())
  const [draggingMultiple, setDraggingMultiple] = useState<Row[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()
  const [positionId, setPositionId] = useState<number | null>(null)

  useEffect(() => {
    const id = Number(searchParams.get('positionId'))
    if (!isNaN(id)) {
      setPositionId(id)
    } else {
      setPositionId(null)
    }
  }, [searchParams])

  useEffect(() => {
    router.refresh()
  }, [searchParams])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

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

        const normalizedRows = initialRows.map(r => {
          const raw = r.candidat_next_step
          const rawStr = raw === null || raw === undefined ? '' : String(raw).trim().toLowerCase()
          const isNullish = raw === null || raw === undefined || rawStr === '' || rawStr === '0' || rawStr === 'null'
          return {
            ...r,
            candidat_next_step: isNullish ? null : String(r.candidat_next_step),
          }
        })
        
        setRows(normalizedRows)
      } catch (err) {
        console.error(t('trelloBoard.errors.fetchDataError'), err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, initialRows, t])

  const handleToggleSelection = (candidateId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(candidateId)) {
        newSelection.delete(candidateId)
      } else {
        newSelection.add(candidateId)
      }
      return newSelection
    })
  }

  const handleSelectAllInColumn = (columnId: string) => {
    const columnRows = columnId === 'unassigned' 
      ? getRowsByStepId('unassigned')
      : getRowsByStepId(columnId)
    
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      columnRows.forEach(row => newSelection.add(row.candidat_id))
      return newSelection
    })
  }

  const handleDeselectAllInColumn = (columnId: string) => {
    const columnRows = columnId === 'unassigned' 
      ? getRowsByStepId('unassigned')
      : getRowsByStepId(columnId)
    
    setSelectedCandidates(prev => {
      const newSelection = new Set(prev)
      columnRows.forEach(row => newSelection.delete(row.candidat_id))
      return newSelection
    })
  }

  const clearAllSelections = () => {
    setSelectedCandidates(new Set())
  }

  const handleBatchStepChange = async (candidateIds: number[], step_id: string | null) => {
    const originalRows = [...rows]
    
    setRows(prev =>
      prev.map(r => candidateIds.includes(r.candidat_id) ? { 
        ...r, 
        candidat_next_step: step_id === 'unassigned' || step_id === null ? null : step_id 
      } : r)
    )

    try {
      await Promise.all(candidateIds.map(candidateId => 
        fetch('/api/update-next-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidat_id: candidateId, 
            step_id: step_id === 'unassigned' || step_id === null ? null : Number(step_id)
          }),
        })
      ))

      setSelectedCandidates(new Set())
    } catch (err) {
      console.error(t('trelloBoard.errors.updateStepError'), err)
      setRows(originalRows)
      alert(t('trelloBoard.errors.updateStepError'))
    }
  }

  const handleStepChange = async (candidat_id: number, step_id: string | null) => {
    const originalRows = [...rows]
    
    setRows(prev =>
      prev.map(r => (r.candidat_id === candidat_id ? { 
        ...r, 
        candidat_next_step: step_id === 'unassigned' || step_id === null ? null : step_id 
      } : r))
    )

    try {
      const response = await fetch('/api/update-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidat_id, 
          step_id: step_id === 'unassigned' || step_id === null ? null : Number(step_id)
        }),
      })

      if (!response.ok) throw new Error('Failed to update step')
    } catch (err) {
      console.error(t('trelloBoard.errors.updateStepError'), err)
      setRows(originalRows)
      alert(t('trelloBoard.errors.updateStepError'))
    }
  }

  const handleCommentUpdate = async () => {
    if (!selectedCandidate) return
    
    setIsSavingComment(true)
    const originalRows = [...rows]
    
    setRows(prev =>
      prev.map(r => (r.candidat_id === selectedCandidate.candidat_id ? { 
        ...r, 
        candidat_comment: editedComment 
      } : r))
    )
    
    setSelectedCandidate(prev => prev ? {
      ...prev,
      candidat_comment: editedComment
    } : null)

    try {
      const response = await fetch('/api/update-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidat_id: selectedCandidate.candidat_id, 
          comment: editedComment 
        }),
      })

      if (!response.ok) throw new Error('Failed to update comment')
      
      setIsEditingComment(false)
    } catch (err) {
      console.error(t('trelloBoard.errors.updateCommentError'), err)
      setRows(originalRows)
      setSelectedCandidate(originalRows.find(r => r.candidat_id === selectedCandidate.candidat_id) || null)
      alert(t('trelloBoard.errors.updateCommentError'))
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedCandidateId = Number(active.id)
    const row = rows.find(r => r.candidat_id === draggedCandidateId) || null
    
    if (selectedCandidates.has(draggedCandidateId) && selectedCandidates.size > 1) {
      const selectedRows = rows.filter(r => selectedCandidates.has(r.candidat_id))
      setDraggingMultiple(selectedRows)
      setDraggingRow(row)
    } else {
      setSelectedCandidates(new Set())
      setDraggingMultiple([])
      setDraggingRow(row)
    }
    
    setIsDragging(true)
    
    const scrollElement = document.querySelector('#scroll-container') as HTMLElement
    if (scrollElement) {
      setScrollContainer(scrollElement)
      scrollElement.style.overflowX = 'hidden'
      scrollElement.style.touchAction = 'none'
    }
  }

  const findColumnForElement = (elementId: string): string | null => {
    const columns = [{ step_id: 'unassigned', step_name: t('trelloBoard.column.unassigned') }, ...steps]
    if (columns.some(col => col.step_id === elementId)) return elementId

    const candidateId = Number(elementId)
    const candidate = rows.find(r => r.candidat_id === candidateId)
    return candidate ? (candidate.candidat_next_step ?? 'unassigned') : null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const multiDragActive = draggingMultiple.length > 0
    
    setDraggingRow(null)
    setDraggingMultiple([])
    setIsDragging(false)
    clearAutoScroll()
    
    if (scrollContainer) {
      scrollContainer.style.overflowX = 'auto'
      scrollContainer.style.touchAction = 'auto'
      setScrollContainer(null)
    }
    
    const { active, over } = event
    if (!over || !active) return

    const targetColumnId = findColumnForElement(over.id as string)
    if (targetColumnId === null) return

    const newStepId: string | null = targetColumnId === 'unassigned' ? null : targetColumnId
    
    if (multiDragActive) {
      const candidateIds = draggingMultiple.map(r => r.candidat_id)
      const needsUpdate = draggingMultiple.some(row => row.candidat_next_step !== newStepId)
      
      if (needsUpdate) {
        handleBatchStepChange(candidateIds, newStepId)
      }
    } else {
      const activeId = Number(active.id)
      const currentRow = rows.find(r => r.candidat_id === activeId)
      if (!currentRow) return

      if (currentRow.candidat_next_step !== newStepId) {
        handleStepChange(activeId, newStepId)
      }
    }
  }

  const getRowsByStepId = (stepId: string | null) => {
    if (stepId === 'unassigned' || stepId === null) {
      return rows.filter(r => {
        const s = r.candidat_next_step
        return s === null || s === undefined || String(s).toLowerCase() === 'null' || String(s) === '0'
      })
    }

    return rows.filter(r => String(r.candidat_next_step) === String(stepId))
  }

  const getStepName = (stepId: string | null) => {
    if (!stepId || stepId === '0') return t('trelloBoard.column.unassigned')
    const stepIdStr = String(stepId)
    const foundStep = steps.find(s => String(s.step_id) === stepIdStr)
    return foundStep?.step_name ?? t('trelloBoard.column.unknown')
  }

  const handleCandidateClick = (row: Row) => {
    setSelectedCandidates(new Set())
    setSelectedCandidate(row)
    setEditedComment(row.candidat_comment || '')
    setIsEditingComment(false)
  }

  const handleCloseModal = () => {
    setSelectedCandidate(null)
    setIsEditingComment(false)
    setEditedComment('')
  }

  const startEditingComment = () => {
    setIsEditingComment(true)
    setEditedComment(selectedCandidate?.candidat_comment || '')
  }

  const cancelEditingComment = () => {
    setIsEditingComment(false)
    setEditedComment(selectedCandidate?.candidat_comment || '')
  }

  const isRejectedCandidate = (row: Row) => {
    return String(row.candidat_next_step) === '1'
  }

  const nonRejectedCandidatesCount = rows.filter(row => !isRejectedCandidate(row)).length
  const rejectedCandidatesCount = rows.filter(row => isRejectedCandidate(row)).length

  if (loading || steps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('trelloBoard.header.loading')}</p>
        </div>
      </div>
    )
  }

  const columns = [{ step_id: 'unassigned', step_name: t('trelloBoard.column.unassigned') }, ...steps]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <Workflow className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0" />
                <div className="text-center">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{t('trelloBoard.header.title')}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{t('trelloBoard.header.subtitle')}</p>
                </div>
              </div>

              {/* Candidates count and controls */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold text-lg">{showRejected ? rows.length : nonRejectedCandidatesCount}</span>
                  <span>{t('trelloBoard.stats.candidates')}</span>
                  {!showRejected && rejectedCandidatesCount > 0 && (
                    <span className="text-blue-100 text-sm">({rejectedCandidatesCount} {t('trelloBoard.stats.hidden')})</span>
                  )}
                </div>

                {/* Selection info and clear button */}
                {selectedCandidates.size > 0 && (
                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">{selectedCandidates.size} {t('trelloBoard.stats.selected')}</span>
                    <button
                      onClick={clearAllSelections}
                      className="ml-2 text-blue-200 hover:text-white transition-colors"
                      title="Clear selection"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Show/Hide Rejected Button */}
                {rejectedCandidatesCount > 0 && (
                  <button
                    onClick={() => setShowRejected(!showRejected)}
                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium"
                  >
                    {showRejected ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>{t('trelloBoard.buttons.hideRejected')}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>{t('trelloBoard.buttons.showRejected')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {/* Full-width horizontal scroll container */}
          <div
            id="scroll-container"
            style={{ 
              overflowX: 'auto', 
              overflowY: 'hidden', 
              WebkitOverflowScrolling: 'touch', 
              scrollbarGutter: 'stable'
            }}
            className="flex gap-4 pb-4 px-4 sm:px-6 w-full items-start"
          >
            {columns.map(col => {
              const columnRows = col.step_id === 'unassigned'
                ? getRowsByStepId('unassigned')
                : getRowsByStepId(col.step_id)

              const isRejectedColumn = col.step_name.toLowerCase() === 'rejected'

              return (
                <Column
                  key={col.step_id}
                  columnId={col.step_id}
                  columnName={col.step_name}
                  rows={columnRows}
                  onCardClick={handleCandidateClick}
                  isRejectedColumn={isRejectedColumn}
                  showRejected={showRejected}
                  selectedCandidates={selectedCandidates}
                  onToggleSelection={handleToggleSelection}
                  onSelectAll={handleSelectAllInColumn}
                  onDeselectAll={handleDeselectAllInColumn}
                />
              )
            })}
          </div>

          <DragOverlay>
            {draggingRow && (
              <div className="relative">
                {/* Main dragging card */}
                <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-3 cursor-grabbing w-72 transform rotate-3 z-50">
                  <p className="font-medium text-gray-800 text-sm">
                    {draggingRow.candidats?.candidat_firstname} #{draggingRow.candidat_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t('trelloBoard.modal.score')}: {draggingRow.candidat_score ?? '—'}</p>
                </div>
                
                {/* Multi-drag indicator */}
                {draggingMultiple.length > 1 && (
                  <>
                    <div className="absolute top-1 left-1 bg-blue-100 rounded-lg shadow-md border border-blue-200 p-3 w-72 transform rotate-2 -z-10">
                      <div className="h-4 bg-blue-200 rounded mb-2"></div>
                      <div className="h-3 bg-blue-150 rounded"></div>
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-3 w-72 transform rotate-1 -z-20">
                      <div className="h-4 bg-blue-100 rounded mb-2"></div>
                      <div className="h-3 bg-blue-75 rounded"></div>
                    </div>
                    
                    {/* Counter badge */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-60">
                      {draggingMultiple.length}
                    </div>
                  </>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Candidate Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Enhanced Candidate Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedCandidate.candidats?.candidat_firstname ?? '—'}{' '}
                      {selectedCandidate.candidats?.candidat_lastname ?? ''}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">{t('trelloBoard.modal.candidateId')}: {selectedCandidate.candidat_id}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('trelloBoard.modal.email')}</p>
                      {selectedCandidate.candidats?.candidat_email ? (
                        <a
                          href={`mailto:${selectedCandidate.candidats.candidat_email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                        >
                          {selectedCandidate.candidats.candidat_email}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">{t('trelloBoard.modal.notProvided')}</span>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('trelloBoard.modal.phone')}</p>
                      {selectedCandidate.candidats?.candidat_phone ? (
                        <a
                          href={`tel:${selectedCandidate.candidats.candidat_phone}`}
                          className="text-green-600 hover:text-green-800 hover:underline transition-colors font-medium"
                        >
                          {selectedCandidate.candidats.candidat_phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">{t('trelloBoard.modal.notProvided')}</span>
                      )}
                    </div>
                  </div>

                  {/* CV File */}
                  {selectedCandidate.candidats?.cv_file && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('trelloBoard.modal.cvFile')}</p>
                        <a
                          href={selectedCandidate.candidats.cv_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 hover:underline transition-colors font-medium"
                        >
                          {t('trelloBoard.modal.viewCV')}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('trelloBoard.modal.source')}</p>
                      <p className="text-gray-800 font-medium">{selectedCandidate.source ?? t('trelloBoard.modal.notSpecified')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">{t('trelloBoard.modal.score')}</h3>
                  <p className="text-2xl font-bold text-blue-900">{selectedCandidate.candidat_score ?? t('trelloBoard.card.notScored')}</p>
                </div>
                
                {/* Enhanced Comment Section with Edit Functionality */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">{t('trelloBoard.modal.comment')}</h3>
                    {!isEditingComment && (
                      <button
                        onClick={startEditingComment}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-xs">{t('trelloBoard.buttons.edit')}</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditingComment ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder={t('trelloBoard.modal.commentPlaceholder')}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCommentUpdate}
                          disabled={isSavingComment}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          {isSavingComment ? t('trelloBoard.buttons.saving') : t('trelloBoard.buttons.save')}
                        </button>
                        <button
                          onClick={cancelEditingComment}
                          disabled={isSavingComment}
                          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          {t('trelloBoard.buttons.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedCandidate.candidat_comment || t('trelloBoard.modal.noComments')}</p>
                  )}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">{t('trelloBoard.modal.aiAnalysis')}</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedCandidate.candidat_ai_analyse ?? t('trelloBoard.modal.noAiAnalysis')}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2">{t('trelloBoard.modal.nextStep')}</h3>
                  <p className="text-gray-800">{getStepName(selectedCandidate.candidat_next_step)}</p>
                </div>
              </div>

              {/* INTERVIEW MANAGEMENT */}
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <h3 className="text-sm font-semibold text-green-800 mb-3">{t('trelloBoard.modal.interviews')}</h3>
                <InterviewList candidatId={selectedCandidate.candidat_id} positionId={positionId} stepId={selectedCandidate.candidat_next_step} />
              </div>

              
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleCloseModal}
                >
                  {t('trelloBoard.buttons.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar styling */}
      <style>{`
        #scroll-container::-webkit-scrollbar { height: 10px; }
        #scroll-container::-webkit-scrollbar-thumb { background: rgba(156,163,175,0.6); border-radius: 6px; }
        #scroll-container::-webkit-scrollbar-track { background: rgba(229,231,235,0.4); }
        #scroll-container { scrollbar-gutter: stable; }
        
        .animate-pulse-blue {
          animation: pulse-blue 2s infinite;
        }
        
        @keyframes pulse-blue {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  )
}