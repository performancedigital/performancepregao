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

const MOCK_RESPONSES: Record<string, string> = {
  default:
    'Com base na análise do edital, posso identificar que trata-se de um pregão eletrônico do tipo menor preço. Os documentos de habilitação exigidos incluem: Certidão Negativa de Débitos Federais, FGTS em dia, Certidão de Regularidade Trabalhista (CNDT) e Certidão Negativa de Falência. O prazo para proposta é de 8 dias úteis a partir da publicação.',
  habilitacao:
    'Os requisitos de habilitação jurídica e fiscal exigem: (1) CNPJ ativo com no mínimo 2 anos, (2) Certidão Negativa de Débitos Federais e Estaduais, (3) CRF/FGTS em dia, (4) CNDT (Certidão Negativa de Débitos Trabalhistas), (5) Certidão Negativa de Falência emitida pela Comarca da sede. Para habilitação técnica, é exigido pelo menos 1 atestado de capacidade técnica compatível com o objeto.',
  prazo: 'O prazo para envio de propostas é de 8 (oito) dias úteis contados a partir da data de publicação. A sessão pública de abertura ocorrerá às 10h no horário de Brasília. Propostas enviadas após o prazo serão automaticamente desclassificadas pelo sistema.',
  atestado:
    'Sim, o edital exige atestado(s) de capacidade técnica fornecido(s) por pessoa jurídica de direito público ou privado, comprovando que a empresa licitante prestou ou está prestando serviços compatíveis com o objeto da licitação, em pelo menos 50% das quantidades cotadas. O atestado deve conter: CNPJ do emitente, nome do responsável, cargo e assinatura.',
  alvara:
    'O edital não menciona exigência de alvará específico além dos documentos usuais. Porém, é necessário apresentar Alvará de Funcionamento ou Licença Municipal em vigor, emitido pela Prefeitura do município sede da empresa.',
}

function getResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('habilita') || lower.includes('documento')) return MOCK_RESPONSES.habilitacao
  if (lower.includes('prazo') || lower.includes('proposta') || lower.includes('data')) return MOCK_RESPONSES.prazo
  if (lower.includes('atestado') || lower.includes('técnico') || lower.includes('capacidade')) return MOCK_RESPONSES.atestado
  if (lower.includes('alvará') || lower.includes('licença')) return MOCK_RESPONSES.alvara
  return MOCK_RESPONSES.default
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  biddingTitle?: string
}

export function ChatModal({ isOpen, onClose, biddingTitle }: ChatModalProps) {
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

  function sendMessage(text: string) {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(
      () => {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getResponse(text),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsTyping(false)
      },
      800 + Math.random() * 800
    )
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
                <p className="text-slate-500 text-[11px]">Gemini Pro — Pronto</p>
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
