'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BiddingCard } from '@/components/bidding/BiddingCard'
import { SkeletonCard } from '@/components/ui/SkeletonRow'
import { NeonButton } from '@/components/ui/NeonButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, X } from 'lucide-react'

const PORTALS = [
  { label: 'Todos', value: '' },
  { label: 'PNCP', value: 'PNCP' },
]

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// Valores reais presentes no banco (PNCP)
const MODALITIES = [
  { label: 'Todas', value: '' },
  { label: 'Dispensa', value: 'Dispensa' },
  { label: 'Pregao Eletronico', value: 'Pregao' },
  { label: 'Concorrencia', value: 'Concorrencia' },
  { label: 'Credenciamento', value: 'Credenciamento' },
  { label: 'Tomada de Precos', value: 'Tomada' },
]

const PAGE_SIZE = 12

interface Bidding {
  id: string
  title: string
  organ: string
  state: string | null
  city: string | null
  modality: string
  estimatedValue: number | null
  openingDate: string | null
  closingDate: string | null
  status: string
  portal: { name: string; type: string }
}

export default function OpportunitiesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [portal, setPortal] = useState('')
  const [state, setState] = useState('')
  const [modality, setModality] = useState('')
  const [minValue, setMinValue] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [biddings, setBiddings] = useState<Bidding[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchBiddings = useCallback(async (p: number, overrides?: {
    search?: string; portal?: string; state?: string; modality?: string; minValue?: string
  }) => {
    setLoading(true)
    const s = overrides?.search ?? search
    const po = overrides?.portal ?? portal
    const st = overrides?.state ?? state
    const mo = overrides?.modality ?? modality
    const mv = overrides?.minValue ?? minValue

    const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE), onlyActive: 'true' })
    if (s) params.set('search', s)
    if (po) params.set('portal', po)
    if (st) params.set('state', st)
    if (mo) params.set('modality', mo)
    if (mv) params.set('minValue', mv)

    try {
      const res = await fetch(`/api/biddings?${params}`)
      const json = await res.json()
      setBiddings(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch {
      setBiddings([])
      setTotal(0)
    }
    setLoading(false)
  }, [search, portal, state, modality, minValue])

  useEffect(() => {
    fetchBiddings(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    fetchBiddings(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch() {
    setPage(1)
    fetchBiddings(1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function clearFilters() {
    setSearch('')
    setPortal('')
    setState('')
    setModality('')
    setMinValue('')
    setPage(1)
    fetchBiddings(1, { search: '', portal: '', state: '', modality: '', minValue: '' })
  }

  async function handleSave(id: string) {
    setSavingId(id)
    try {
      await fetch(`/api/biddings/${id}/save`, { method: 'POST' })
    } catch {}
    setSavingId(null)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    fetchBiddings(newPage)
  }

  const hasActiveFilters = search || portal || state || modality || minValue

  function portalDisplay(b: Bidding) {
    return b.portal?.name ?? b.portal?.type ?? '-'
  }

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por titulo, orgao, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-neon w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || hasActiveFilters ? 'border-neon/40 text-neon bg-neon/10' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-neon text-black text-[10px] font-black rounded-full flex items-center justify-center">!</span>
              )}
            </button>
            <NeonButton onClick={handleSearch} loading={loading}>
              <Filter size={15} />
              <span className="ml-1.5">Buscar</span>
            </NeonButton>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Portal</label>
              <select value={portal} onChange={(e) => setPortal(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer">
                {PORTALS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Estado</label>
              <select value={state} onChange={(e) => setState(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer">
                <option value="" className="bg-gray-900">Todos</option>
                {STATES.map((s) => (
                  <option key={s} value={s} className="bg-gray-900">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Modalidade</label>
              <select value={modality} onChange={(e) => setModality(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer">
                {MODALITIES.map((m) => (
                  <option key={m.value} value={m.value} className="bg-gray-900">{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Valor minimo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>
            {hasActiveFilters && (
              <div className="col-span-2 lg:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors">
                  <X size={13} /> Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {loading ? 'Buscando editais...' : (
            <>
              <span className="text-white font-semibold">{total}</span> edital{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}
              {hasActiveFilters && <span className="text-neon ml-1">(filtrado{total !== 1 ? 's' : ''})</span>}
            </>
          )}
        </p>
        <p className="text-slate-600 text-xs">Fonte: PNCP</p>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : biddings.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-slate-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Nenhum edital encontrado</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            {total === 0 && !hasActiveFilters
              ? 'Va em Admin > Integracoes e clique "Sincronizar Agora" no PNCP para carregar editais.'
              : 'Tente ajustar os filtros ou usar termos de busca diferentes.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-neon text-sm hover:text-neon/80 transition-colors">
              Limpar todos os filtros
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {biddings.map((b) => (
            <BiddingCard
              key={b.id}
              id={b.id}
              title={b.title}
              organ={b.organ}
              state={b.state ?? undefined}
              city={b.city ?? undefined}
              modality={b.modality}
              estimatedValue={b.estimatedValue ?? undefined}
              openingDate={b.openingDate ?? undefined}
              closingDate={b.closingDate ?? undefined}
              portal={portalDisplay(b)}
              status={b.status}
              onView={(id) => router.push(`/dashboard/bidding/${id}`)}
              onSave={(id) => handleSave(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-slate-500 text-sm">Pagina {page} de {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                      page === p ? 'bg-neon text-black' : 'border border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                    }`}>
                    {p}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Proxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
