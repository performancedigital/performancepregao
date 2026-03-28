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

// ─── Mock data ────────────────────────────────────────────────────────────────

const monthlyData = [
  { month: 'Ago', disputas: 8, ganhos: 2 },
  { month: 'Set', disputas: 12, ganhos: 4 },
  { month: 'Out', disputas: 15, ganhos: 5 },
  { month: 'Nov', disputas: 11, ganhos: 3 },
  { month: 'Dez', disputas: 18, ganhos: 7 },
  { month: 'Jan', disputas: 23, ganhos: 8 },
]

const statusData = [
  { name: 'Avaliando', value: 40, color: '#00E5FF' },
  { name: 'Encaminhado', value: 35, color: '#7B61FF' },
  { name: 'Vencido', value: 25, color: '#4ADE80' },
]

const portalData = [
  { portal: 'PNCP', value: 4250000 },
  { portal: 'Compras.gov', value: 3100000 },
  { portal: 'BLL', value: 1850000 },
  { portal: 'Municipal', value: 620000 },
]

const stats = [
  {
    label: 'Disputas Ativas',
    value: '23',
    sub: '+5 esta semana',
    trend: 'up',
    icon: Layers,
    color: 'text-neon',
    iconBg: 'bg-neon/10 border-neon/20',
  },
  {
    label: 'Taxa de Vitória',
    value: '34%',
    sub: '+2% vs mês ant.',
    trend: 'up',
    icon: Award,
    color: 'text-green-400',
    iconBg: 'bg-green-400/10 border-green-400/20',
  },
  {
    label: 'Valor em Jogo',
    value: 'R$ 9.8M',
    sub: 'em 23 editais',
    trend: 'neutral',
    icon: DollarSign,
    color: 'text-neon-purple',
    iconBg: 'bg-neon-purple/10 border-neon-purple/20',
  },
  {
    label: 'Contratos Ganhos',
    value: 'R$ 2.4M',
    sub: 'este mês',
    trend: 'up',
    icon: BarChart2,
    color: 'text-yellow-400',
    iconBg: 'bg-yellow-400/10 border-yellow-400/20',
  },
]

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalisePage() {
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
            <h3 className="text-white font-bold text-base">Disputas por Mês</h3>
            <p className="text-slate-500 text-xs mt-1">Comparativo de disputas iniciadas vs. contratos ganhos</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDisputas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
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
              <Area
                type="monotone"
                dataKey="ganhos"
                name="Contratos Ganhos"
                stroke="#4ADE80"
                strokeWidth={2}
                fill="url(#colorGanhos)"
                dot={{ r: 4, fill: '#4ADE80', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#4ADE80' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pie chart — Status */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-white font-bold text-base">Status das Disputas</h3>
            <p className="text-slate-500 text-xs mt-1">Distribuição por estágio</p>
          </div>
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
          {/* Legend */}
          <div className="space-y-2 mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400 text-xs">{d.name}</span>
                </div>
                <span className="font-bold text-xs text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bar chart — Valor por Portal */}
      <GlassCard className="p-6">
        <div className="mb-6">
          <h3 className="text-white font-bold text-base">Valor Total por Portal</h3>
          <p className="text-slate-500 text-xs mt-1">Soma dos valores estimados de editais em disputa por portal de origem</p>
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
              tickFormatter={(v) => `R$ ${(v / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Valor em Disputa" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  )
}
