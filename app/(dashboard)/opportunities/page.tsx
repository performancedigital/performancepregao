'use client'

import { useState, useCallback } from 'react'
import { BiddingCard } from '@/components/bidding/BiddingCard'
import { SkeletonCard } from '@/components/ui/SkeletonRow'
import { NeonButton } from '@/components/ui/NeonButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, X } from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BIDDINGS = [
  {
    id: '1',
    title: 'Pregão Eletrônico para Aquisição de Equipamentos de Tecnologia da Informação — 480 itens',
    organ: 'Prefeitura Municipal de São Paulo',
    state: 'SP',
    city: 'São Paulo',
    modality: 'Pregão Eletrônico',
    estimatedValue: 234500,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days
    portal: 'PNCP',
    status: 'OPEN',
  },
  {
    id: '2',
    title: 'Contratação de Empresa Especializada em Serviços de Limpeza e Conservação Predial',
    organ: 'Tribunal Regional Federal — 3ª Região',
    state: 'SP',
    city: 'São Paulo',
    modality: 'Pregão Eletrônico',
    estimatedValue: 890000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hours — urgent
    portal: 'Compras.gov',
    status: 'OPEN',
  },
  {
    id: '3',
    title: 'Aquisição de Mobiliário Ergonômico para Secretaria Municipal de Educação',
    organ: 'Secretaria de Educação — Belo Horizonte',
    state: 'MG',
    city: 'Belo Horizonte',
    modality: 'Pregão Eletrônico',
    estimatedValue: 145200,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days
    portal: 'BLL',
    status: 'OPEN',
  },
  {
    id: '4',
    title: 'Fornecimento de Materiais de Escritório e Papelaria para o Exercício de 2025',
    organ: 'Câmara Municipal de Curitiba',
    state: 'PR',
    city: 'Curitiba',
    modality: 'Dispensa Eletrônica',
    estimatedValue: 28500,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    portal: 'PNCP',
    status: 'OPEN',
  },
  {
    id: '5',
    title: 'Registro de Preços para Aquisição de Medicamentos e Insumos Hospitalares',
    organ: 'Secretaria Estadual de Saúde do Rio Grande do Sul',
    state: 'RS',
    city: 'Porto Alegre',
    modality: 'Pregão Eletrônico',
    estimatedValue: 4250000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    portal: 'Compras.gov',
    status: 'OPEN',
  },
  {
    id: '6',
    title: 'Contratação de Serviços de Desenvolvimento de Software e Sustentação de Sistemas',
    organ: 'DETRAN-GO — Departamento de Trânsito de Goiás',
    state: 'GO',
    city: 'Goiânia',
    modality: 'Pregão Eletrônico',
    estimatedValue: 1850000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours — urgent
    portal: 'PNCP',
    status: 'OPEN',
  },
  {
    id: '7',
    title: 'Aquisição de Veículos Utilitários e Passeio para Frota Municipal',
    organ: 'Prefeitura de Florianópolis',
    state: 'SC',
    city: 'Florianópolis',
    modality: 'Pregão Eletrônico',
    estimatedValue: 680000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    portal: 'BLL',
    status: 'OPEN',
  },
  {
    id: '8',
    title: 'Contratação de Empresa para Fornecimento de Energia Solar em Prédios Públicos',
    organ: 'Governo do Estado de Pernambuco — SEFAZ',
    state: 'PE',
    city: 'Recife',
    modality: 'Concorrência',
    estimatedValue: 12500000,
    openingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    portal: 'Compras.gov',
    status: 'OPEN',
  },
]

const PORTALS = ['Todos', 'PNCP', 'Compras.gov', 'BLL', 'Municipal']
const STATES = ['Todos', 'SP', 'MG', 'RJ', 'RS', 'PR', 'SC', 'GO', 'PE', 'BA', 'DF']
const MODALITIES = ['Todas', 'Pregão Eletrônico', 'Dispensa Eletrônica', 'Concorrência', 'Tomada de Preços']

const PAGE_SIZE = 6

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpportunitiesPage() {
  const [search, setSearch] = useState('')
  const [portal, setPortal] = useState('Todos')
  const [state, setState] = useState('Todos')
  const [modality, setModality] = useState('Todas')
  const [minValue, setMinValue] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [activeSearch, setActiveSearch] = useState('')

  // Filter biddings
  const filtered = MOCK_BIDDINGS.filter((b) => {
    const q = activeSearch.toLowerCase()
    const matchText =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.organ.toLowerCase().includes(q)
    const matchPortal = portal === 'Todos' || b.portal === portal
    const matchState = state === 'Todos' || b.state === state
    const matchModality = modality === 'Todas' || b.modality === modality
    const matchValue = !minValue || (b.estimatedValue ?? 0) >= Number(minValue)
    return matchText && matchPortal && matchState && matchModality && matchValue
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch() {
    setLoading(true)
    setActiveSearch(search)
    setPage(1)
    setTimeout(() => setLoading(false), 600) // simulate async
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function clearFilters() {
    setSearch('')
    setActiveSearch('')
    setPortal('Todos')
    setState('Todos')
    setModality('Todas')
    setMinValue('')
    setPage(1)
  }

  const hasActiveFilters =
    activeSearch || portal !== 'Todos' || state !== 'Todos' || modality !== 'Todas' || minValue

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Pesquisar por título, órgão, palavras-chave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-neon w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'border-neon/40 text-neon bg-neon/10'
                  : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-neon text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  !
                </span>
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
            {/* Portal */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Portal</label>
              <select
                value={portal}
                onChange={(e) => setPortal(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer"
              >
                {PORTALS.map((p) => (
                  <option key={p} value={p} className="bg-dark-700">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Estado</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer"
              >
                {STATES.map((s) => (
                  <option key={s} value={s} className="bg-dark-700">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Modality */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Modalidade</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm appearance-none cursor-pointer"
              >
                {MODALITIES.map((m) => (
                  <option key={m} value={m} className="bg-dark-700">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Min value */}
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Valor mínimo (R$)</label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="input-neon w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          {loading ? (
            'Buscando editais...'
          ) : (
            <>
              <span className="text-white font-semibold">{filtered.length}</span> edital
              {filtered.length !== 1 ? 'is' : ''} encontrado
              {filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters && (
                <span className="text-neon ml-1">(filtrado{filtered.length !== 1 ? 's' : ''})</span>
              )}
            </>
          )}
        </p>
        <p className="text-slate-600 text-xs">
          Atualizado há 3 min &bull; PNCP, Compras.gov, BLL
        </p>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-slate-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Nenhum edital encontrado</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Tente ajustar os filtros ou usar termos de busca diferentes.
          </p>
          <button
            onClick={clearFilters}
            className="text-neon text-sm hover:text-neon/80 transition-colors"
          >
            Limpar todos os filtros
          </button>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map((b) => (
            <BiddingCard
              key={b.id}
              {...b}
              onView={(id) => console.log('View:', id)}
              onSave={(id) => console.log('Save:', id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-slate-500 text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                    page === i + 1
                      ? 'bg-neon text-black'
                      : 'border border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
