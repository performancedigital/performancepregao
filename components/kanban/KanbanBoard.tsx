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
import { useState } from 'react'
import { Bell, Clock, GripVertical, MoreHorizontal, Plus } from 'lucide-react'
import { formatCurrency, getTimeUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'LEAD' | 'AVALIANDO' | 'ENCAMINHADO' | 'VENCIDO'

interface KanbanItem {
  id: string
  title: string
  organ: string
  estimatedValue?: number | null
  openingDate?: string | null
  stage: Stage
  portal: string
  notes?: string
}

const COLUMNS: { id: Stage; label: string; color: string; bg: string; border: string }[] = [
  {
    id: 'LEAD',
    label: 'Lead',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    id: 'AVALIANDO',
    label: 'Avaliando',
    color: 'text-neon',
    bg: 'bg-neon/10',
    border: 'border-neon/20',
  },
  {
    id: 'ENCAMINHADO',
    label: 'Encaminhado',
    color: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/20',
  },
  {
    id: 'VENCIDO',
    label: 'Vencido',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
]

const INITIAL_ITEMS: KanbanItem[] = [
  {
    id: 'k1',
    title: 'Fornecimento de Equipamentos TI — Prefeitura SP',
    organ: 'Prefeitura Municipal de São Paulo',
    estimatedValue: 234500,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    stage: 'LEAD',
    portal: 'PNCP',
  },
  {
    id: 'k2',
    title: 'Serviços de Limpeza — TRF 3ª Região',
    organ: 'Tribunal Regional Federal',
    estimatedValue: 890000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    stage: 'AVALIANDO',
    portal: 'Compras.gov',
    notes: 'Verificar certidão FGTS antes do prazo',
  },
  {
    id: 'k3',
    title: 'Mobiliário para Secretaria de Educação — BH',
    organ: 'Secretaria de Educação MG',
    estimatedValue: 145200,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    stage: 'AVALIANDO',
    portal: 'BLL',
  },
  {
    id: 'k4',
    title: 'Desenvolvimento de Software — DETRAN-GO',
    organ: 'DETRAN-GO',
    estimatedValue: 1850000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    stage: 'ENCAMINHADO',
    portal: 'PNCP',
    notes: 'Proposta técnica enviada. Aguardando abertura.',
  },
  {
    id: 'k5',
    title: 'Energia Solar em Prédios Públicos — PE',
    organ: 'Governo do Estado de Pernambuco',
    estimatedValue: 12500000,
    openingDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    stage: 'VENCIDO',
    portal: 'Compras.gov',
    notes: 'Contrato assinado em 15/01/2025. Valor final: R$ 11.800.000',
  },
]

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({
  item,
  isDragging,
}: {
  item: KanbanItem
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const timeUntil = getTimeUntil(item.openingDate)
  const isUrgent =
    item.openingDate != null &&
    new Date(item.openingDate).getTime() - Date.now() < 86400000 * 2

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 group',
        isDragging && 'shadow-neon border-neon/40 rotate-1',
        'hover:border-white/20 hover:bg-white/[0.07]'
      )}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors"
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-neon font-mono mb-1.5">
            {item.portal}
          </p>
          <h4 className="text-white text-xs font-semibold leading-snug line-clamp-2 group-hover:text-neon transition-colors">
            {item.title}
          </h4>
          <p className="text-slate-500 text-[10px] mt-1 truncate">{item.organ}</p>
        </div>
        <button className="flex-shrink-0 p-1 text-slate-600 hover:text-slate-400 transition-colors rounded">
          <MoreHorizontal size={14} />
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
          <button className="p-1 text-slate-600 hover:text-yellow-400 transition-colors">
            <Bell size={12} />
          </button>
          <div
            className={cn(
              'flex items-center gap-1 text-[10px] font-medium',
              isUrgent ? 'text-red-400' : 'text-slate-500'
            )}
          >
            <Clock size={10} />
            {timeUntil}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  items,
}: {
  column: (typeof COLUMNS)[number]
  items: KanbanItem[]
}) {
  const totalValue = items.reduce((sum, i) => sum + (i.estimatedValue ?? 0), 0)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl mb-3 border',
          column.bg,
          column.border
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-2 h-2 rounded-full', column.color.replace('text-', 'bg-'))} />
          <span className={cn('font-bold text-sm', column.color)}>{column.label}</span>
          <span
            className={cn(
              'text-[10px] font-black px-1.5 py-0.5 rounded-full',
              column.bg,
              column.color,
              'border',
              column.border
            )}
          >
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-[10px]">
            {formatCurrency(totalValue)}
          </span>
          <button
            className={cn(
              'p-1 rounded-lg transition-colors',
              column.color,
              'hover:opacity-80'
            )}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2.5 min-h-[200px]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
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

// ─── Main Board ───────────────────────────────────────────────────────────────

export function KanbanBoard() {
  const [items, setItems] = useState<KanbanItem[]>(INITIAL_ITEMS)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null

  function getItemsByStage(stage: Stage) {
    return items.filter((i) => i.stage === stage)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeItem = items.find((i) => i.id === active.id)
    if (!activeItem) return

    // Check if over a column id
    const overColumn = COLUMNS.find((c) => c.id === over.id)
    if (overColumn && activeItem.stage !== overColumn.id) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === active.id ? { ...item, stage: overColumn.id } : item
        )
      )
      return
    }

    // Check if over another item
    const overItem = items.find((i) => i.id === over.id)
    if (overItem && activeItem.stage !== overItem.stage) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === active.id ? { ...item, stage: overItem.stage } : item
        )
      )
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return
    if (active.id === over.id) return

    const activeItem = items.find((i) => i.id === active.id)
    const overItem = items.find((i) => i.id === over.id)

    if (!activeItem || !overItem) return
    if (activeItem.stage !== overItem.stage) return

    const stageItems = items.filter((i) => i.stage === activeItem.stage)
    const oldIndex = stageItems.findIndex((i) => i.id === active.id)
    const newIndex = stageItems.findIndex((i) => i.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(stageItems, oldIndex, newIndex)
    const otherItems = items.filter((i) => i.stage !== activeItem.stage)

    setItems([...otherItems, ...reordered])
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={getItemsByStage(column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
