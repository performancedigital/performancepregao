'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import {
  Activity,
  Bot,
  ChevronRight,
  Send,
  Users,
  X,
  Zap,
  Database,
  Globe,
} from 'lucide-react'

const MOCK_STATS = [
  { label: 'Usuários Totais', value: '412', sub: '+12 este mês', icon: Users, color: 'text-neon' },
  { label: 'Usuários Ativos', value: '387', sub: '94% do total', icon: Activity, color: 'text-green-400' },
  { label: 'Editais Coletados', value: '89.240', sub: '+3.180 hoje', icon: Database, color: 'text-neon-purple' },
  { label: 'Portais Ativos', value: '3 / 19', sub: 'PNCP, Compras.gov, BLL', icon: Globe, color: 'text-yellow-400' },
]

const QUICK_LINKS = [
  { label: 'Gestão de Usuários', href: '/admin/users', desc: 'Ver e gerenciar todos os usuários, planos e status.', icon: Users },
  { label: 'Portais Monitorados', href: '/admin/portals', desc: 'Status dos scrapers, logs de coleta e configuração.', icon: Globe },
  { label: 'Logs do Sistema', href: '/admin/logs', desc: 'Erros de coleta, falhas de IA e eventos de pagamento.', icon: Activity },
  { label: 'IA & Modelos', href: '/admin/ai', desc: 'Configurar prompts, modelos Gemini e limites de tokens.', icon: Bot },
]

export default function AdminPage() {
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
        {MOCK_STATS.map((stat) => (
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

      {/* Recent activity feed */}
      <GlassCard className="p-6">
        <h2 className="text-white font-bold text-base mb-5">Atividade Recente</h2>
        <div className="space-y-3">
          {[
            { time: 'há 2 min', text: 'Scraper PNCP coletou 47 novos editais', type: 'success' },
            { time: 'há 8 min', text: 'Novo usuário cadastrado: joao.silva@empresa.com.br', type: 'info' },
            { time: 'há 15 min', text: 'Pagamento PRO aprovado — MercadoPago #PAY-001842', type: 'success' },
            { time: 'há 32 min', text: 'Scraper BLL: timeout na tentativa 2/3 — retentando', type: 'warn' },
            { time: 'há 1h', text: 'Resumos IA gerados para 124 editais PNCP', type: 'success' },
            { time: 'há 2h', text: 'Alertas de manhã enviados para 198 usuários', type: 'info' },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  event.type === 'success'
                    ? 'bg-green-400'
                    : event.type === 'warn'
                    ? 'bg-yellow-400'
                    : 'bg-neon'
                }`}
              />
              <p className="text-slate-300 text-xs flex-1">{event.text}</p>
              <span className="text-slate-600 text-[10px] flex-shrink-0">{event.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
