'use client'

import { GlassCard } from '@/components/ui/GlassCard'
import { formatCurrency } from '@/lib/utils'
import {
  Award,
  BarChart2,
  DollarSign,
  Layers,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { useEffect, useState } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  savedTotal: number
  totalBiddings: number
  totalValue: number
  byStage: Record<string, number>
  byPortal: Record<string, number>
  monthly: { month: string; count: number }[]
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {label && <p className="text-slate-400 text-xs mb-2">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}:{' '}
            <span className="text-white">
              {typeof entry.value === 'number' && entry.value > 10000
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-4 py-3 border border-white/10">
        <p className="text-white font-semibold text-sm">
          {payload[0].name}: <span style={{ color: payload[0].payload.color }}>{payload[0].value}%</span>
        </p>
      </div>
    )
  }
  return null
}

// ─── Stage labels and colors ───────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  AVALIANDO: 'Avaliando',
  ENCAMINHADO: 'Encaminhado',
  VENCIDO: 'Vencido',
}

const STAGE_COLORS: Record<string, string> = {
  LEAD: '#00E5FF',
  AVALIANDO: '#7B61FF',
  ENCAMINHADO: '#FACC15',
  VENCIDO: '#4ADE80',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalisePage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  // ─── Derived data from API ────────────────────────────────────────────────

  const stats = data
    ? [
        {
          label: 'Disputas Ativas',
          value: String(data.savedTotal),
          sub: `de ${data.totalBiddings} licitacoes`,
          trend: data.savedTotal > 0 ? 'up' : 'neutral',
          icon: Layers,
          color: 'text-neon',
          iconBg: 'bg-neon/10 border-neon/20',
        },
        {
          label: 'Taxa de Vitoria',
          value:
            data.savedTotal > 0
              ? `${Math.round(((data.byStage['VENCIDO'] || 0) / data.savedTotal) * 100)}%`
              : '0%',
          sub: data.byStage['VENCIDO'] > 0 ? `${data.byStage['VENCIDO']} vencidos` : 'sem vitorias',
          trend: (data.byStage['VENCIDO'] || 0) > 0 ? 'up' : 'neutral',
          icon: Award,
          color: 'text-green-400',
          iconBg: 'bg-green-400/10 border-green-400/20',
        },
        {
          label: 'Valor em Jogo',
          value:
            data.totalValue >= 1_000_000
              ? `R$ ${(data.totalValue / 1_000_000).toFixed(1)}M`
              : data.totalValue >= 1_000
              ? `R$ ${(data.totalValue / 1_000).toFixed(0)}K`
              : `R$ ${data.totalValue.toFixed(0)}`,
          sub: `em ${data.savedTotal} editais`,
          trend: 'neutral',
          icon: DollarSign,
          color: 'text-neon-purple',
          iconBg: 'bg-neon-purple/10 border-neon-purple/20',
        },
        {
          label: 'Contratos Ganhos',
          value: String(data.byStage['VENCIDO'] || 0),
          sub:
            (data.byStage['VENCIDO'] || 0) > 0
              ? `~${formatCurrency(
                  (data.totalValue / (data.savedTotal || 1)) * (data.byStage['VENCIDO'] || 0)
                )} estimado`
              : 'sem vitorias',
          trend: (data.byStage['VENCIDO'] || 0) > 0 ? 'up' : 'neutral',
          icon: BarChart2,
          color: 'text-yellow-400',
          iconBg: 'bg-yellow-400/10 border-yellow-400/20',
        },
      ]
    : []

  const statusData = data
    ? Object.entries(data.byStage)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: STAGE_LABELS[key] || key,
          value: data.savedTotal > 0 ? Math.round((value / data.savedTotal) * 100) : 0,
          count: value,
          color: STAGE_COLORS[key] || '#94A3B8',
        }))
    : []

  const portalData = data
    ? Object.entries(data.byPortal).map(([portal, count]) => ({
        portal,
        value: count,
      }))
    : []

  const monthlyData = data
    ? data.monthly.map((m) => ({
        month: m.month,
        disputas: m.count,
      }))
    : []

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-neon border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Nao foi possivel carregar os dados de analise.</p>
      </div>
    )
  }

  // ─── Empty state ──────────────────────────────────────────────────────────

  if (data.savedTotal === 0) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-8 text-center">
          <Layers size={40} className="text-neon mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Sem dados de analise</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Salve licitacoes na aba Oportunidades ou Negocios para comecar a ver suas analises aqui.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.iconBg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {stat.trend === 'up' ? (
                <TrendingUp size={13} className="text-green-400" />
              ) : stat.trend === 'down' ? (
                <TrendingDown size={13} className="text-red-400" />
              ) : null}
              <span
                className={`text-xs ${
                  stat.trend === 'up'
                    ? 'text-green-400'
                    : stat.trend === 'down'
                    ? 'text-red-400'
                    : 'text-slate-500'
                }`}
              >
                {stat.sub}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Area chart + Pie chart row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart — Disputas por mês */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h3 className="text-white font-bold text-base">Disputas por Mes</h3>
            <p className="text-slate-500 text-xs mt-1">Licitacoes salvas nos ultimos 6 meses</p>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDisputas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="disputas"
                  name="Disputas"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  fill="url(#colorDisputas)"
                  dot={{ r: 4, fill: '#00E5FF', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00E5FF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">Sem dados mensais</p>
          )}
        </GlassCard>

        {/* Pie chart — Status */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-white font-bold text-base">Status das Disputas</h3>
            <p className="text-slate-500 text-xs mt-1">Distribuicao por estagio</p>
          </div>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-400 text-xs">{d.name}</span>
                    </div>
                    <span className="font-bold text-xs text-white">{d.value}% ({d.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">Sem dados de status</p>
          )}
        </GlassCard>
      </div>

      {/* Bar chart — Valor por Portal */}
      {portalData.length > 0 && (
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-white font-bold text-base">Licitacoes por Portal</h3>
            <p className="text-slate-500 text-xs mt-1">Quantidade de licitacoes salvas por portal de origem</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={portalData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#7B61FF" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="portal"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Licitacoes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  )
}
