'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  Activity,
  Bot,
  ChevronRight,
  Users,
  Zap,
  Database,
  Globe,
} from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Gestão de Usuários', href: '/admin/users', desc: 'Ver e gerenciar todos os usuários, planos e status.', icon: Users },
  { label: 'Portais Monitorados', href: '/admin/portals', desc: 'Status dos portais e health check da coleta.', icon: Globe },
  { label: 'Integrações', href: '/admin/integrations', desc: 'Sincronização PNCP, execuções e fila de erros (DLQ).', icon: Activity },
  { label: 'IA & Modelos', href: '/admin/ai', desc: 'Configurar a chave do Gemini para o chat e resumos.', icon: Bot },
]

export default function AdminPage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/metrics').then(r => r.json()).then(setMetrics).catch(() => {})
  }, [])

  const stats = [
    { label: 'Usuários Totais', value: metrics?.totalUsers ?? '...', sub: `${metrics?.activeUsers ?? 0} ativos`, icon: Users, color: 'text-neon' },
    { label: 'Usuários Ativos', value: metrics?.activeUsers ?? '...', sub: `${metrics?.totalUsers ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}% do total`, icon: Activity, color: 'text-green-400' },
    { label: 'Editais Coletados', value: metrics?.totalBiddings?.toLocaleString('pt-BR') ?? '...', sub: 'Total no banco', icon: Database, color: 'text-neon-purple' },
    { label: 'Portais Ativos', value: metrics?.activePortals ?? '...', sub: 'Fonte: PNCP (nacional)', icon: Globe, color: 'text-yellow-400' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-neon flex items-center justify-center">
              <Zap size={12} className="text-black" />
            </div>
            <span className="text-xs text-neon font-semibold tracking-wider uppercase">Painel Admin</span>
          </div>
          <h1 className="text-3xl font-black text-white">Visão Geral da Plataforma</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 glass rounded-full px-4 py-2 border border-green-500/20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-semibold">Todos os sistemas online</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-5 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <p className="text-slate-600 text-xs">{stat.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Acessos Rápidos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group glass rounded-xl p-5 border border-white/10 hover:border-neon/30 hover:shadow-neon transition-all duration-300 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 group-hover:bg-neon/20 transition-all">
                <link.icon size={20} className="text-neon" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm group-hover:text-neon transition-colors">
                  {link.label}
                </p>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{link.desc}</p>
              </div>
              <ChevronRight
                size={16}
                className="text-slate-600 flex-shrink-0 group-hover:text-neon group-hover:translate-x-1 transition-all"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <GlassCard className="p-6">
        <h2 className="text-white font-bold text-base mb-5">Métricas do Sistema</h2>
        {metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Plano Free</p>
              <p className="text-white font-bold text-lg">{metrics.byPlan?.FREE ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Plano PRO</p>
              <p className="text-cyan-400 font-bold text-lg">{metrics.byPlan?.PRO ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Infinity Plus</p>
              <p className="text-purple-400 font-bold text-lg">{metrics.byPlan?.INFINITY_PLUS ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Editais Abertos</p>
              <p className="text-green-400 font-bold text-lg">{metrics.openBiddings ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Editais Salvos Total</p>
              <p className="text-white font-bold text-lg">{metrics.totalSaved ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Portais Ativos</p>
              <p className="text-yellow-400 font-bold text-lg">{metrics.activePortals ?? 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Carregando métricas...</p>
        )}
      </GlassCard>
    </div>
  )
}
