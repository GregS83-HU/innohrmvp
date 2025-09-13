'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
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
  MouseSensor,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Users, FileText, BarChart3, X, GripVertical } from 'lucide-react'

type Candidat = {
  candidat_firstname: string
  candidat_lastname: string
  cv_file?: string
  created_at: string
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.candidat_id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'pan-y', // empêche le scroll horizontal sur mobile
  }

  const getScoreColor = (score: number | null) => {
    if (!score)
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    if (score >= 8)
      return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' }
    if (score >= 6)
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' }
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
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) onClick(row)
      }}
      className={`${scoreColors.bg} rounded-lg shadow-sm border ${scoreColors.border} p-3 cursor-pointer hover:shadow-md transition-all select-none mb-2 group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {/* DRAG HANDLE */}
          <div {...attributes} {...listeners} className="p-1 cursor-grab">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p
              className={`font-medium ${scoreColors.text} text-sm leading-tight`}
            >
              {row.candidats?.candidat_firstname ?? '—'}{' '}
              {row.candidats?.candidat_lastname ?? ''}
            </p>
            <p className="text-xs text-gray-500">ID: {row.candidat_id}</p>
          </div>
        </div>
        {row.candidat_score !== null && (
          <span
            className={`${getScoreBadgeColor(
              row.candidat_score
            )} text-xs px-2 py-1 rounded-full font-medium`}
          >
            {row.candidat_score}
          </span>
        )}
      </div>

      {row.candidat_comment && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {row.candidat_comment}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {row.candidats?.created_at
            ? new Date(row.candidats.created_at).toLocaleDateString('en-GB')
            : '—'}
        </span>
        {row.candidats?.cv_file && (
          <FileText className="w-3 h-3 text-blue-500" />
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
}: {
  columnId: string
  columnName: string
  rows: Row[]
  onCardClick: (row: Row) => void
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 rounded-lg p-3 w-72 flex-shrink-0 min-h-[400px] flex flex-col transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {columnName}
        </h2>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
          {rows.length}
        </span>
      </div>

      <div className="flex-1 min-h-[300px]">
        <SortableContext
          items={rows.map((r) => r.candidat_id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {rows.map((row) => (
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

  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // sensors pour desktop + mobile
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const preventTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const resSteps = await fetch(
          `/api/recruitment-step?user_id=${session.user.id}`
        )
        const stepsData = await resSteps.json()
        setSteps(stepsData)

        const normalizedRows = initialRows.map((r) => ({
          ...r,
          candidat_next_step:
            r.candidat_next_step !== null && r.candidat_next_step !== undefined
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

  const handleStepChange = async (
    candidat_id: number,
    step_id: string | null
  ) => {
    try {
      const response = await fetch('/api/update-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidat_id,
          step_id: step_id === 'unassigned' ? null : Number(step_id),
        }),
      })

      if (!response.ok) throw new Error('Failed to update step')

      setRows((prev) =>
        prev.map((r) =>
          r.candidat_id === candidat_id
            ? { ...r, candidat_next_step: step_id === 'unassigned' ? null : step_id }
            : r
        )
      )
    } catch (err) {
      console.error('Error updating step:', err)
      alert("Erreur lors de la mise à jour de l'étape")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const row = rows.find((r) => r.candidat_id.toString() === active.id) || null
    setDraggingRow(row)

    if (scrollerRef.current) {
      scrollerRef.current.style.touchAction = 'none'
    }
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingRow(null)

    if (scrollerRef.current) {
      scrollerRef.current.style.touchAction = ''
    }
    document.removeEventListener('touchmove', preventTouchMove)

    const { active, over } = event
    if (!over || !active) return

    const activeId = Number(active.id)
    const currentRow = rows.find((r) => r.candidat_id === activeId)
    if (!currentRow) return

    const targetColumnId = findColumnForElement(over.id as string)
    if (targetColumnId === null) return

    let newStepId: string | null = targetColumnId === 'unassigned' ? null : targetColumnId

    if (currentRow.candidat_next_step !== newStepId) {
      handleStepChange(activeId, newStepId)
    }
  }

  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', preventTouchMove)
    }
  }, [preventTouchMove])

  const findColumnForElement = (elementId: string): string | null => {
    const columns = [{ step_id: 'unassigned', step_name: 'Unassigned' }, ...steps]
    if (columns.some((col) => col.step_id === elementId)) return elementId

    const candidateId = Number(elementId)
    const candidate = rows.find((r) => r.candidat_id === candidateId)
    if (candidate) return candidate.candidat_next_step || 'unassigned'

    return null
  }

  const getRowsByStepId = (stepId: string | null) =>
    rows.filter((r) =>
      stepId === null ? r.candidat_next_step === null : String(r.candidat_next_step) === String(stepId)
    )

  const getStepName = (stepId: string | null) => {
    if (!stepId) return 'Unassigned'
    const stepIdStr = String(stepId)
    const foundStep = steps.find((s) => String(s.step_id) === stepIdStr)
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
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Recruitment Board
            </h1>
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
          <div ref={scrollerRef} className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((col) => {
              const columnRows =
                col.step_id === 'unassigned'
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
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 p-3 cursor-grabbing w-72 transform rotate-3">
                <p className="font-medium text-gray-800 text-sm">
                  {draggingRow.candidats?.candidat_firstname} #
                  {draggingRow.candidat_id}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Score: {draggingRow.candidat_score ?? '—'}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {selectedCandidate && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCandidate(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setSelectedCandidate(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="pr-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Candidate Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedCandidate.candidats?.candidat_firstname?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">
                          {selectedCandidate.candidats?.candidat_firstname ?? '—'}{' '}
                          {selectedCandidate.candidats?.candidat_lastname ?? ''} (ID:{' '}
                          {selectedCandidate.candidat_id})
                        </p>
                        {selectedCandidate.source && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                            {selectedCandidate.source}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Applied:{' '}
                        {selectedCandidate.candidats?.created_at
                          ? new Date(
                              selectedCandidate.candidats.created_at
                            ).toLocaleDateString('en-GB')
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Score</p>
                      <p className="text-xl font-bold text-green-600">
                        {selectedCandidate.candidat_score ?? '—'}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Current Step
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {getStepName(selectedCandidate.candidat_next_step)}
                      </p>
                    </div>
                  </div>

                  {selectedCandidate.candidat_comment && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        Comments
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedCandidate.candidat_comment}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.candidat_ai_analyse && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 mb-2">
                        AI Analysis
                      </p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {selectedCandidate.candidat_ai_analyse}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.candidats?.cv_file && (
                    <a
                      href={selectedCandidate.candidats.cv_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mt-3"
                    >
                      <FileText className="w-4 h-4" />
                      View CV
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
