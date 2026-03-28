import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { GlassCard } from '@/components/ui/GlassCard'
import { Info, Kanban } from 'lucide-react'

export default function NegociosPage() {
  return (
    <div className="space-y-5">
      {/* Instructions */}
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
            <Info size={15} className="text-neon" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-1">Como usar o Quadro de Disputas</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Arraste os cartões entre as colunas para mover editais pelo funil.{' '}
              <strong className="text-white">Lead</strong> → editais recém identificados;{' '}
              <strong className="text-white">Avaliando</strong> → em análise técnica;{' '}
              <strong className="text-white">Encaminhado</strong> → proposta enviada;{' '}
              <strong className="text-white">Vencido</strong> → contratos ganhos.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total de Disputas', value: '5', color: 'text-white' },
          { label: 'Em Avaliação', value: '2', color: 'text-neon' },
          { label: 'Encaminhados', value: '1', color: 'text-neon-purple' },
          { label: 'Contratos Ganhos', value: '1', color: 'text-green-400' },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <p className="text-slate-500 text-xs mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  )
}
