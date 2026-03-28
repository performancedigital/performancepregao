'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard/opportunities': 'Oportunidades',
  '/dashboard/negocios': 'Quadro de Disputas',
  '/dashboard/analise': 'Análise & Relatórios',
  '/dashboard/juridico': 'Módulo Jurídico',
  '/admin': 'Painel Admin',
  '/admin/users': 'Gestão de Usuários',
  '/admin/portals': 'Portais Monitorados',
}

interface HeaderProps {
  onMobileMenuClick: () => void
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const pageTitle = pageTitles[pathname] ?? 'Dashboard'
  const userName = session?.user?.name ?? 'Usuário'
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const mockNotifications = [
    {
      id: 1,
      text: '12 novos editais encontrados para "TI"',
      time: 'há 5 min',
      read: false,
    },
    {
      id: 2,
      text: 'Edital PNCP-2024-001 abre em 2 horas',
      time: 'há 1h',
      read: false,
    },
    {
      id: 3,
      text: 'Resumo IA disponível para 3 editais',
      time: 'há 3h',
      read: true,
    },
  ]

  const unreadCount = mockNotifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-dark-800/80 backdrop-blur-md border-b border-white/10">
      {/* Left: Hamburger + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">{pageTitle}</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen)
              setDropdownOpen(false)
            }}
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-neon text-black text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 glass rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white font-semibold text-sm">Notificações</span>
                <button className="text-neon text-xs hover:text-neon/80 transition-colors">
                  Marcar tudo como lido
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer',
                      !notif.read && 'bg-neon/5'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 bg-neon rounded-full flex-shrink-0 mt-1.5" />
                      )}
                      <div className={!notif.read ? '' : 'ml-3.5'}>
                        <p className="text-white text-xs leading-snug">{notif.text}</p>
                        <p className="text-slate-500 text-[10px] mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon to-neon-purple flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-xs">{initials}</span>
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">{userName}</span>
            <ChevronDown
              size={14}
              className={cn(
                'text-slate-500 transition-transform',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* User dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 glass rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-white font-semibold text-sm">{userName}</p>
                <p className="text-slate-500 text-xs">{session?.user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
                  <User size={15} />
                  Meu perfil
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
                  <Settings size={15} />
                  Configurações
                </button>
              </div>
              <div className="border-t border-white/10 py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-400/10 transition-all text-sm"
                >
                  <LogOut size={15} />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
