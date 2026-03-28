'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BarChart2,
  LayoutDashboard,
  LogOut,
  Scale,
  Search,
  Zap,
  X,
} from 'lucide-react'
import { cn, getPlanColor, getPlanLabel } from '@/lib/utils'

const navItems = [
  {
    label: 'Oportunidades',
    href: '/dashboard/opportunities',
    icon: Search,
  },
  {
    label: 'Negócios',
    href: '/dashboard/negocios',
    icon: LayoutDashboard,
  },
  {
    label: 'Análise',
    href: '/dashboard/analise',
    icon: BarChart2,
  },
  {
    label: 'Jurídico',
    href: '/dashboard/juridico',
    icon: Scale,
  },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const planType = (session?.user as any)?.planType ?? 'FREE'
  const userName = session?.user?.name ?? 'Usuário'
  const userEmail = session?.user?.email ?? ''
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-60 bg-dark-800 border-r border-white/10 flex flex-col z-40 transition-transform duration-300',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center flex-shrink-0">
              <Zap size={16} className="text-black" />
            </div>
            <span className="font-bold text-white text-base leading-none">
              Performance<br />
              <span className="text-neon">Pregão</span>
            </span>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-neon/10 text-neon border border-neon/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {/* Active left border indicator */}
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-8 bg-neon rounded-r-full" />
                )}
                <item.icon
                  size={18}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-neon' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          {/* Plan badge */}
          <div className={cn('text-center py-1.5 px-3 rounded-lg border text-xs font-bold', getPlanColor(planType))}>
            Plano {getPlanLabel(planType)}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon to-neon-purple flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-xs">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName}</p>
              <p className="text-slate-500 text-xs truncate">{userEmail}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  )
}
