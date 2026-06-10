'use client'

import { useEffect, useState, useCallback } from 'react'

interface SourceStatus {
  source: {
    id: string
    code: string
    name: string
    isEnabled: boolean
    supportsIncremental: boolean
  }
  lastRun: {
    id: string
    status: string
    totalFetched: number
    totalUpserted: number
    totalErrors: number
    startedAt: string | null
    finishedAt: string | null
    createdAt: string
  } | null
  cursor: string | null
  dlqCount: number
  health: { ok: boolean; latencyMs: number; message?: string }
}

interface Run {
  id: string
  status: string
  totalFetched: number
  totalUpserted: number
  totalErrors: number
  createdAt: string
  finishedAt: string | null
  source: { code: string; name: string }
}

const ALL_SOURCES = [
  'pncp',
]

function statusColor(status: string) {
  if (status === 'SUCCESS') return 'text-green-400'
  if (status === 'PARTIAL') return 'text-yellow-400'
  if (status === 'FAILED') return 'text-red-400'
  if (status === 'RUNNING') return 'text-cyan-400'
  return 'text-gray-400'
}

function healthDot(ok: boolean) {
  return ok
    ? <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2" />
    : <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />
}

export default function IntegracoesPainel() {
  const [statuses, setStatuses] = useState<Record<string, SourceStatus>>({})
  const [runs, setRuns] = useState<Run[]>([])
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [tab, setTab] = useState<'sources' | 'runs' | 'dlq'>('sources')
  const [dlq, setDlq] = useState<{ items: { id: string; externalId: string; errorMessage: string; createdAt: string; source: { code: string } }[] }>({ items: [] })

  const loadStatus = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/internal/integrations/${code}/status`)
      if (res.ok) {
        const data = await res.json()
        setStatuses((prev) => ({ ...prev, [code]: data }))
      }
    } catch {}
  }, [])

  const loadRuns = useCallback(async () => {
    const res = await fetch('/api/internal/integrations/runs?limit=30')
    if (res.ok) {
      const data = await res.json()
      setRuns(data.runs ?? [])
    }
  }, [])

  const loadDlq = useCallback(async () => {
    const res = await fetch('/api/internal/integrations/dlq?limit=50')
    if (res.ok) {
      const data = await res.json()
      setDlq(data)
    }
  }, [])

  useEffect(() => {
    ALL_SOURCES.forEach(loadStatus)
    loadRuns()
    loadDlq()
  }, [loadStatus, loadRuns, loadDlq])

  async function handleSync(code: string) {
    setSyncing((prev) => ({ ...prev, [code]: true }))
    try {
      const res = await fetch(`/api/internal/integrations/${code}/sync`, { method: 'POST' })
      const data = await res.json()
      alert(`Sync ${code}: ${data.status} | Coletados: ${data.totalFetched} | Inseridos: ${data.totalUpserted} | Erros: ${data.totalErrors}`)
    } catch (e) {
      alert(`Erro ao sincronizar ${code}: ${e}`)
    } finally {
      setSyncing((prev) => ({ ...prev, [code]: false }))
      loadStatus(code)
      loadRuns()
    }
  }

  async function handleReprocess(runId: string) {
    await fetch(`/api/internal/integrations/runs/${runId}/reprocess`, { method: 'POST' })
    loadRuns()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Integrações de Dados</h1>

      <div className="flex gap-4 mb-6">
        {(['sources', 'runs', 'dlq'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {t === 'sources' ? 'Plataformas' : t === 'runs' ? 'Execuções' : 'DLQ / Erros'}
          </button>
        ))}
      </div>

      {tab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ALL_SOURCES.map((code) => {
            const s = statuses[code]
            const loading = syncing[code]
            return (
              <div key={code} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {s ? healthDot(s.health.ok) : <span className="inline-block w-2 h-2 rounded-full bg-gray-600 mr-2" />}
                    <span className="font-semibold text-sm">{s?.source.name ?? code}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s?.source.isEnabled ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {s?.source.isEnabled ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {s?.lastRun && (
                  <div className="text-xs text-gray-400 mb-2 space-y-0.5">
                    <div>
                      Status: <span className={statusColor(s.lastRun.status)}>{s.lastRun.status}</span>
                    </div>
                    <div>Coletados: {s.lastRun.totalFetched} | Inseridos: {s.lastRun.totalUpserted} | Erros: {s.lastRun.totalErrors}</div>
                    {s.cursor && <div>Cursor: {new Date(s.cursor).toLocaleString('pt-BR')}</div>}
                    {s.dlqCount > 0 && <div className="text-red-400">DLQ: {s.dlqCount} itens</div>}
                  </div>
                )}
                {!s?.lastRun && <p className="text-xs text-gray-600 mb-2">Nenhuma execução ainda</p>}

                <button
                  onClick={() => handleSync(code)}
                  disabled={loading}
                  className="w-full mt-1 py-1.5 text-xs rounded-lg bg-cyan-600/20 border border-cyan-600/40 text-cyan-400 hover:bg-cyan-600/30 disabled:opacity-50 transition"
                >
                  {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'runs' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 text-left">
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Coletados</th>
                <th className="pb-2 pr-4">Inseridos</th>
                <th className="pb-2 pr-4">Erros</th>
                <th className="pb-2 pr-4">Data</th>
                <th className="pb-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-4 text-cyan-400">{r.source.code}</td>
                  <td className={`py-2 pr-4 ${statusColor(r.status)}`}>{r.status}</td>
                  <td className="py-2 pr-4">{r.totalFetched}</td>
                  <td className="py-2 pr-4">{r.totalUpserted}</td>
                  <td className={`py-2 pr-4 ${r.totalErrors > 0 ? 'text-red-400' : ''}`}>{r.totalErrors}</td>
                  <td className="py-2 pr-4 text-gray-400">{new Date(r.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="py-2">
                    {r.totalErrors > 0 && (
                      <button
                        onClick={() => handleReprocess(r.id)}
                        className="text-xs px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50"
                      >
                        Reprocessar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-600">Nenhuma execução registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'dlq' && (
        <div className="space-y-3">
          {dlq.items.map((item) => (
            <div key={item.id} className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-400 font-medium">{item.source.code}</span>
                <span className="text-gray-500">{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="text-xs text-gray-400">ID: {item.externalId}</div>
              <div className="text-xs text-red-300 mt-1">{item.errorMessage}</div>
            </div>
          ))}
          {dlq.items.length === 0 && (
            <p className="text-center text-gray-600 py-12">Nenhum erro fatal registrado</p>
          )}
        </div>
      )}
    </div>
  )
}
