'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Globe, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Portal {
  id: string
  name: string
  url: string
  type: string
  isActive: boolean
}

export default function AdminPortalsPage() {
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const [pinging, setPinging] = useState<string | null>(null)
  const [pingResults, setPingResults] = useState<Record<string, 'ok' | 'error' | 'pending'>>({})

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/portals')
    if (res.ok) {
      const json = await res.json()
      setPortals(json.data)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function pingPortal(portal: Portal) {
    setPinging(portal.id)
    setPingResults(p => ({ ...p, [portal.id]: 'pending' }))
    try {
      const res = await fetch(`/api/admin/portals/${portal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ping: true }) })
      setPingResults(p => ({ ...p, [portal.id]: res.ok ? 'ok' : 'error' }))
    } catch {
      setPingResults(p => ({ ...p, [portal.id]: 'error' }))
    }
    setPinging(null)
  }

  async function togglePortal(portal: Portal) {
    await fetch(`/api/admin/portals/${portal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !portal.isActive }),
    })
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Portais Monitorados</h1>
        <p className="text-slate-500 text-sm mt-1">Status dos scrapers e saúde dos endpoints de coleta</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/3" />
            </GlassCard>
          ))
        ) : portals.map(portal => {
          const pingStatus = pingResults[portal.id]
          return (
            <GlassCard key={portal.id} className={`p-5 transition-all ${portal.isActive ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${portal.isActive ? 'bg-green-400/10 border-green-400/20' : 'bg-red-400/10 border-red-400/20'}`}>
                    <Globe size={18} className={portal.isActive ? 'text-green-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{portal.name}</p>
                    <p className="text-slate-500 text-xs">{portal.type}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${portal.isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              </div>

              <p className="text-slate-500 text-xs mb-4 truncate">{portal.url}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {pingStatus === 'ok' && <CheckCircle2 size={13} className="text-green-400" />}
                  {pingStatus === 'error' && <XCircle size={13} className="text-red-400" />}
                  {pingStatus === 'pending' && <Clock size={13} className="text-yellow-400 animate-spin" />}
                  <span className={`text-xs ${pingStatus === 'ok' ? 'text-green-400' : pingStatus === 'error' ? 'text-red-400' : pingStatus === 'pending' ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {pingStatus === 'ok' ? 'Online' : pingStatus === 'error' ? 'Offline' : pingStatus === 'pending' ? 'Pingando...' : 'Status desconhecido'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => pingPortal(portal)} disabled={pinging === portal.id}
                    className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-neon hover:border-neon/30 transition-all disabled:opacity-40">
                    <RefreshCw size={13} className={pinging === portal.id ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={() => togglePortal(portal)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium ${portal.isActive ? 'border-red-400/30 text-red-400 hover:bg-red-400/10' : 'border-green-400/30 text-green-400 hover:bg-green-400/10'}`}>
                    {portal.isActive ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
