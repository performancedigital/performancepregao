'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot } from 'lucide-react'
import { ChatModal } from '@/components/ai/ChatModal'

interface Bidding {
  id: string
  externalId: string
  title: string
  organ: string
  state: string | null
  city: string | null
  modality: string
  estimatedValue: number | null
  openingDate: string | null
  status: string
  pdfUrl: string | null
  aiSummary: string | null
  portal: { name: string; type: string }
}

export default function BiddingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [bidding, setBidding] = useState<Bidding | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    fetch(`/api/biddings/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setBidding(d?.bidding ?? null)
        setSaved(Boolean(d?.isSaved))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>
  }

  if (!bidding) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Edital nao encontrado.
        <Link href="/dashboard/opportunities" className="text-cyan-400 ml-2">Voltar</Link>
      </div>
    )
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
      >
        Voltar
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-white flex-1">{bidding.title}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 shrink-0">
            {bidding.status === 'OPEN' ? 'Aberto' : bidding.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Numero do edital</p>
            <p className="text-white text-sm font-medium break-all">{bidding.externalId || 'Nao informado'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Orgao</p>
            <p className="text-white text-sm font-medium">{bidding.organ}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Estado / Cidade</p>
            <p className="text-white text-sm font-medium">
              {bidding.state || '-'}
              {bidding.city ? ` / ${bidding.city}` : ''}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Modalidade</p>
            <p className="text-white text-sm font-medium">{bidding.modality}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Valor Estimado</p>
            <p className="text-cyan-400 text-sm font-bold">{bidding.estimatedValue ? fmt(bidding.estimatedValue) : 'Nao informado'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Abertura de Propostas</p>
            <p className="text-white text-sm font-medium">
              {bidding.openingDate ? new Date(bidding.openingDate).toLocaleString('pt-BR') : 'Nao informado'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Portal</p>
            <p className="text-white text-sm font-medium">{bidding.portal?.name || '-'}</p>
          </div>
        </div>

        {bidding.aiSummary && (
          <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-4 mb-6">
            <h3 className="text-cyan-400 font-semibold mb-2">Resumo IA</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{bidding.aiSummary}</p>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {bidding.pdfUrl && (
            <a
              href={bidding.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Ver Edital Original
            </a>
          )}

          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-neon/90 hover:bg-neon text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
          >
            <Bot size={16} /> Conversar com IA
          </button>

          <button
            disabled={saved}
            onClick={async () => {
              await fetch(`/api/biddings/${id}/save`, { method: 'POST' })
              setSaved(true)
            }}
            className="bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {saved ? 'Salvo no Kanban' : 'Salvar na Disputa'}
          </button>
        </div>
      </div>

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} biddingTitle={bidding.title} />
    </div>
  )
}


