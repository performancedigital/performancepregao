import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  neon?: boolean
  purple?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, neon, purple, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'backdrop-blur-md bg-white/5 border border-white/10 rounded-xl',
        neon && 'border-neon/30 shadow-neon',
        purple && 'border-neon-purple/30 shadow-neon-purple',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
