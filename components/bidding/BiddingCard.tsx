'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { formatCurrency, getTimeUntil } from '@/lib/utils'
import { Building2, Clock, MapPin, Star, Zap } from 'lucide-react'
import { useState } from 'react'

interface BiddingCardProps {
  id: string
  title: string
  organ: string
  state?: string | null
  city?: string | null
  modality: string
  estimatedValue?: number | null
  openingDate?: string | null
  portal: string
  status: string
  onSave?: (id: string) => void
  onView?: (id: string) => void
  isSaved?: boolean
}

export function BiddingCard({
  id,
  title,
  organ,
  state,
  city,
  modality,
  estimatedValue,
  openingDate,
  portal,
  status,
  onSave,
  onView,
  isSaved = false,
}: BiddingCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const timeUntil = getTimeUntil(openingDate)

  const isUrgent =
    openingDate !== null &&
    openingDate !== undefined &&
    new Date(openingDate).getTime() - Date.now() < 86400000 * 2 // less than 2 days

  const isExpired = timeUntil === 'Encerrado'

  function handleSave() {
    setSaved((prev) => !prev)
    onSave?.(id)
  }

  return (
    <GlassCard className="p-5 hover:border-neon/30 hover:shadow-neon transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neon font-mono mb-1 truncate">
            {portal} &bull; {modality}
          </p>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-neon transition-colors">
            {title}
          </h3>
        </div>
        <button
          onClick={handleSave}
          aria-label={saved ? 'Remover dos favoritos' : 'Salvar edital'}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
            saved
              ? 'text-yellow-400 hover:text-yellow-500'
              : 'text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10'
          }`}
        >
          <Star size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Building2 size={12} className="flex-shrink-0" />
          <span className="truncate">{organ}</span>
        </div>
        {(state || city) && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{[city, state].filter(Boolean).join(' — ')}</span>
          </div>
        )}
        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            isExpired
              ? 'text-slate-600'
              : isUrgent
              ? 'text-red-400'
              : 'text-slate-400'
          }`}
        >
          <Clock size={12} className="flex-shrink-0" />
          <span>{timeUntil}</span>
          {isUrgent && !isExpired && (
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
              URGENTE
            </span>
          )}
          {isExpired && (
            <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
              ENCERRADO
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Valor Est.</p>
          <p className="text-neon font-bold text-sm">{formatCurrency(estimatedValue)}</p>
        </div>
        <NeonButton
          size="sm"
          onClick={() => onView?.(id)}
          className="flex items-center gap-1.5"
          disabled={isExpired}
        >
          <Zap size={12} />
          Ver Edital
        </NeonButton>
      </div>
    </GlassCard>
  )
}
