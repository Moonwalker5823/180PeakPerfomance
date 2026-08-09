import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /** 'wide' for full-bleed-ish display type, 'prose' for reading measure. */
  width?: 'default' | 'wide' | 'prose'
}

const widths = {
  default: 'max-w-6xl',
  wide: 'max-w-[110rem]',
  prose: 'max-w-2xl',
}

export function Container({ children, className, width = 'default' }: Props) {
  return <div className={cn('mx-auto w-full px-5 sm:px-8', widths[width], className)}>{children}</div>
}
