'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, GripVertical, Trash2, ExternalLink } from 'lucide-react'
import { formatCurrency, getTimeUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Stage = 'LEAD' | 'AVALIANDO' | 'ENCAMINHADO' | 'VENCIDO'

interface KanbanItem {
  id: string           // SavedBidding.id
  biddingId: string
  title: string
  organ: string
  estimatedValue?: number | null
  openingDate?: string | null
  stage: Stage
  portal: string
  notes?: string | null
}

const COLUMNS: { id: Stage; label: string; color: string; bg: string; border: string }[] = [
  { id: 'LEAD', label: 'Lead', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'AVALIANDO', label: 'Avaliando', color: 'text-neon', bg: 'bg-neon/10', border: 'border-neon/20' },
  { id: 'ENCAMINHADO', label: 'Encaminhado', color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  { id: 'VENCIDO', label: 'Vencido', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
]

function KanbanCard({ item, isDragging, onDelete, onOpen }: {
  item: KanbanItem
  isDragging?: boolean
  onDelete?: (id: string) => void
  onOpen?: (biddingId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const timeUntil = getTimeUntil(item.openingDate)
  const isUrgent = item.openingDate != null && new Date(item.openingDate).getTime() - Date.now() < 86400000 * 2

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-200 group',
        isDragging && 'shadow-neon border-neon/40 rotate-1',
        'hover:border-white/20 hover:bg-white/[0.07]'
      )}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing" title="Arrastar">
          <GripVertical size={14} />
        </div>
        <button
          type="button"
          onClick={() => onOpen?.(item.biddingId)}
          className="flex-1 min-w-0 text-left cursor-pointer"
          title="Abrir edital"
        >
          <p className="text-[10px] text-neon font-mono mb-1.5">{item.portal}</p>
          <h4 className="text-white text-xs font-semibold leading-snug line-clamp-2 group-hover:text-neon transition-colors">
            {item.title}
          </h4>
          <p className="text-slate-500 text-[10px] mt-1 truncate">{item.organ}</p>
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(item.id)}
          className="flex-shrink-0 p-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Remover da disputa"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {item.notes && (
        <p className="mt-2 text-slate-500 text-[10px] leading-snug italic line-clamp-2 bg-white/5 rounded-lg px-2.5 py-1.5">
          {item.notes}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        <span className="text-neon font-bold text-xs">{formatCurrency(item.estimatedValue)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen?.(item.biddingId)}
            className="text-slate-600 hover:text-neon transition-colors"
            title="Abrir edital"
          >
            <ExternalLink size={12} />
          </button>
          <div className={cn('flex items-center gap-1 text-[10px] font-medium', isUrgent ? 'text-red-400' : 'text-slate-500')}>
            <Clock size={10} />
            {timeUntil}
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ column, items, onDelete, onOpen }: {
  column: typeof COLUMNS[number]
  items: KanbanItem[]
  onDelete?: (id: string) => void
  onOpen?: (biddingId: string) => void
}) {
  const totalValue = items.reduce((sum, i) => sum + (i.estimatedValue ?? 0), 0)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-xl mb-3 border', column.bg, column.border)}>
        <div className="flex items-center gap-2.5">
          <div className={cn('w-2 h-2 rounded-full', column.color.replace('text-', 'bg-'))} />
          <span className={cn('font-bold text-sm', column.color)}>{column.label}</span>
          <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full border', column.bg, column.color, column.border)}>
            {items.length}
          </span>
        </div>
        <span className="text-slate-600 text-[10px]">{formatCurrency(totalValue)}</span>
      </div>

      <div className="flex-1 space-y-2.5 min-h-[200px]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onDelete={onDelete} onOpen={onOpen} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl">
            <p className="text-slate-600 text-xs">Arraste cartões aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}

export interface KanbanBoardProps {
  onStatsChange?: (stats: { total: number; avaliando: number; encaminhado: number; vencido: number }) => void
}

export function KanbanBoard({ onStatsChange }: KanbanBoardProps) {
  const router = useRouter()
  const [items, setItems] = useState<KanbanItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function openItem(biddingId: string) {
    router.push(`/dashboard/bidding/${biddingId}`)
  }

  async function deleteItem(id: string) {
    if (!confirm('Remover este edital da sua disputa?')) return
    const snapshot = items
    setItems((prev) => prev.filter((i) => i.id !== id)) // otimista
    try {
      const res = await fetch(`/api/saved/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('falha ao remover')
    } catch {
      setItems(snapshot)
      alert('Nao foi possivel remover. Tente novamente.')
    }
  }

  useEffect(() => {
    fetch('/api/saved')
      .then(r => r.json())
      .then(json => {
        const mapped: KanbanItem[] = (json.data ?? []).map((s: any) => ({
          id: s.id,
          biddingId: s.biddingId,
          title: s.bidding?.title ?? 'Sem título',
          organ: s.bidding?.organ ?? '',
          estimatedValue: s.bidding?.estimatedValue ? Number(s.bidding.estimatedValue) : null,
          openingDate: s.bidding?.openingDate ?? null,
          stage: s.stage as Stage,
          portal: s.bidding?.portal?.name ?? 'Portal',
          notes: s.notes,
        }))
        setItems(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    onStatsChange?.({
      total: items.length,
      avaliando: items.filter(i => i.stage === 'AVALIANDO').length,
      encaminhado: items.filter(i => i.stage === 'ENCAMINHADO').length,
      vencido: items.filter(i => i.stage === 'VENCIDO').length,
    })
  }, [items, onStatsChange])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const activeItem = activeId ? items.find((i) => i.id === activeId) : null

  function getItemsByStage(stage: Stage) { return items.filter((i) => i.stage === stage) }

  function handleDragStart(event: DragStartEvent) { setActiveId(event.active.id as string) }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeItem = items.find((i) => i.id === active.id)
    if (!activeItem) return
    const overColumn = COLUMNS.find((c) => c.id === over.id)
    if (overColumn && activeItem.stage !== overColumn.id) {
      setItems((prev) => prev.map((item) => item.id === active.id ? { ...item, stage: overColumn.id } : item))
      return
    }
    const overItem = items.find((i) => i.id === over.id)
    if (overItem && activeItem.stage !== overItem.stage) {
      setItems((prev) => prev.map((item) => item.id === active.id ? { ...item, stage: overItem.stage } : item))
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    // Snapshot para reverter caso a persistencia falhe
    const snapshot = items

    const activeItem = items.find((i) => i.id === active.id)
    if (!activeItem) return

    // Reorder within same column
    if (active.id !== over.id) {
      const overItem = items.find((i) => i.id === over.id)
      if (overItem && activeItem.stage === overItem.stage) {
        const stageItems = items.filter((i) => i.stage === activeItem.stage)
        const oldIndex = stageItems.findIndex((i) => i.id === active.id)
        const newIndex = stageItems.findIndex((i) => i.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(stageItems, oldIndex, newIndex)
          setItems([...items.filter((i) => i.stage !== activeItem.stage), ...reordered])
        }
      }
    }

    // Persiste o novo estagio; reverte a UI se falhar (evita estado inconsistente)
    try {
      const res = await fetch(`/api/saved/${activeItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: activeItem.stage }),
      })
      if (!res.ok) throw new Error('falha ao salvar')
    } catch {
      setItems(snapshot)
      alert('Nao foi possivel mover o cartao. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[280px] flex-1">
            <div className={cn('px-4 py-3 rounded-xl mb-3 border animate-pulse', col.bg, col.border)}>
              <span className={cn('font-bold text-sm', col.color)}>{col.label}</span>
            </div>
            <div className="space-y-2.5">
              {[1, 2].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn key={column.id} column={column} items={getItemsByStage(column.id)} onDelete={deleteItem} onOpen={openItem} />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? <KanbanCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
