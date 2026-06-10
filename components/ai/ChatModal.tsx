'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const STARTER_SUGGESTIONS = [
  'Quais são os requisitos de habilitação?',
  'Qual é o prazo para envio de propostas?',
  'Há exigência de atestado técnico?',
  'A empresa precisa de alvará específico?',
]

/**
 * Faz parse do protocolo de data-stream do Vercel AI SDK (toDataStreamResponse).
 * Linhas de texto vem no formato: 0:"trecho de texto"
 */
function extractTextDelta(line: string): string | null {
  if (!line.startsWith('0:')) return null
  try {
    return JSON.parse(line.slice(2))
  } catch {
    return null
  }
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  biddingId: string
  biddingTitle?: string
}

export function ChatModal({ isOpen, onClose, biddingId, biddingTitle }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Olá! Sou sua IA especialista em licitações. Carregado o edital **"${biddingTitle ?? 'Edital selecionado'}"**. Pode me perguntar sobre requisitos de habilitação, prazos, itens, cláusulas ou qualquer dúvida sobre este processo licitatório.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    // Historico enviado para a IA (apenas role/content), incluindo a nova mensagem
    const history = [...messages, userMsg]
      .filter((m) => m.id !== '0') // remove a saudacao inicial
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const aiId = (Date.now() + 1).toString()

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biddingId, messages: history }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao consultar a IA')
      }

      // Cria a mensagem do assistente vazia e vai preenchendo conforme o stream chega
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: 'assistant', content: '', timestamp: new Date() },
      ])
      setIsTyping(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const delta = extractTextDelta(line)
          if (delta) {
            setMessages((prev) =>
              prev.map((m) => (m.id === aiId ? { ...m, content: m.content + delta } : m))
            )
          }
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro inesperado'
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: 'assistant',
          content: `⚠️ ${message}`,
          timestamp: new Date(),
        },
      ])
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 animate-slide-in-right flex flex-col bg-dark-800 border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-dark-800/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
              <Bot size={18} className="text-neon" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Converse com o Edital IA</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <p className="text-slate-500 text-[11px]">Assistente do edital — Pronto</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Edital context */}
        {biddingTitle && (
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl bg-neon/5 border border-neon/15">
            <p className="text-[10px] text-neon font-semibold uppercase tracking-wider mb-0.5">
              Edital ativo
            </p>
            <p className="text-white text-xs font-medium line-clamp-1">{biddingTitle}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-neon" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-neon text-black font-medium rounded-tr-sm'
                    : 'glass border border-white/10 text-slate-200 rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-neon animate-pulse" />
              </div>
              <div className="glass border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-neon rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-neon rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-neon rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-2">Sugestões</p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-neon/20 text-neon hover:bg-neon/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-5 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 glass rounded-xl border border-white/10 focus-within:border-neon/40 focus-within:shadow-neon transition-all px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre o edital..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 focus:outline-none"
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center flex-shrink-0 hover:shadow-neon transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} className="text-black" />
            </button>
          </div>
          <p className="text-slate-700 text-[10px] text-center mt-2">
            Respostas baseadas no conteúdo do edital via IA generativa
          </p>
        </div>
      </div>
    </>
  )
}
