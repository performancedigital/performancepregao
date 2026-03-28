import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'filled' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function NeonButton({
  children,
  variant = 'filled',
  size = 'md',
  loading,
  className,
  disabled,
  ...props
}: NeonButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-4 py-2 text-xs',
        size === 'md' && 'px-6 py-3 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        variant === 'filled' &&
          'bg-neon text-black hover:shadow-neon-lg hover:scale-105',
        variant === 'outline' &&
          'border border-neon text-neon hover:bg-neon/10 hover:shadow-neon',
        variant === 'ghost' &&
          'text-neon hover:bg-neon/10',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Aguarde...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
