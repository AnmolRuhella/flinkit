import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm',
        variant === 'primary' &&
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)]',
        variant === 'secondary' &&
          'border border-[var(--color-border)] bg-white hover:bg-slate-50',
        variant === 'danger' && 'bg-[var(--color-danger)] text-white hover:bg-red-700',
        variant === 'ghost' && 'hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}
