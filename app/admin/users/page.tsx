'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { SkeletonRow } from '@/components/ui/SkeletonRow'
import { Search, Filter, ChevronLeft, ChevronRight, Shield, Ban, CheckCircle, Crown } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = { FREE: 'Free', PRO: 'Pro', INFINITY_PLUS: 'Infinity+' }
const PLAN_COLORS: Record<string, string> = {
  FREE: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  PRO: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  INFINITY_PLUS: 'text-neon bg-neon/10 border-neon/20',
}
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400',
  INACTIVE: 'text-slate-500',
  SUSPENDED: 'text-red-400',
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  status: string
  planType: string
  planExpiresAt: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (planFilter) params.set('planType', planFilter)
    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) {
      const json = await res.json()
      setUsers(json.data)
      setTotalPages(json.totalPages)
      setTotal(json.total)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [page, statusFilter, planFilter])

  async function updateUser(id: string, patch: Record<string, string>) {
    setUpdating(id)
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await load()
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Gestão de Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">{total} usuários cadastrados</p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input-neon w-full pl-9 pr-4 py-2 text-sm rounded-xl"
              placeholder="Buscar por email ou nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); load() } }}
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-neon px-3 py-2 text-sm rounded-xl appearance-none cursor-pointer">
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
            <option value="SUSPENDED">Suspenso</option>
          </select>
          <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}
            className="input-neon px-3 py-2 text-sm rounded-xl appearance-none cursor-pointer">
            <option value="">Todos os planos</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="INFINITY_PLUS">Infinity+</option>
          </select>
          <NeonButton size="sm" onClick={() => { setPage(1); load() }}>
            <Filter size={13} className="mr-1.5" /> Filtrar
          </NeonButton>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Usuário', 'Plano', 'Status', 'Cargo', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>)
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-white font-medium">{user.name ?? '—'}</p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${PLAN_COLORS[user.planType]}`}>
                      {user.planType === 'INFINITY_PLUS' && <Crown size={10} />}
                      {PLAN_LABELS[user.planType]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${STATUS_COLORS[user.status]}`}>
                      {user.status === 'ACTIVE' ? 'Ativo' : user.status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-400">{user.role}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {user.status !== 'ACTIVE' ? (
                        <button onClick={() => updateUser(user.id, { status: 'ACTIVE' })}
                          disabled={updating === user.id}
                          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-green-400/10 transition-all">
                          <CheckCircle size={12} /> Ativar
                        </button>
                      ) : (
                        <button onClick={() => updateUser(user.id, { status: 'SUSPENDED' })}
                          disabled={updating === user.id}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-red-400/10 transition-all">
                          <Ban size={12} /> Suspender
                        </button>
                      )}
                      <select
                        value={user.planType}
                        disabled={updating === user.id}
                        onChange={e => updateUser(user.id, { planType: e.target.value })}
                        className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-400 cursor-pointer hover:border-white/20 transition-all appearance-none disabled:opacity-50">
                        <option value="FREE" className="bg-dark-700">Free</option>
                        <option value="PRO" className="bg-dark-700">Pro</option>
                        <option value="INFINITY_PLUS" className="bg-dark-700">Infinity+</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
            <span className="text-xs text-slate-500">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
