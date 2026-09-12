import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800',
        className,
      )}
    >
      {children}
    </span>
  )
}
