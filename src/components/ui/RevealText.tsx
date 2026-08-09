import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  /** Delay in ms before this line starts moving. */
  delay?: number
  className?: string
  active?: boolean
}

/**
 * Title-card line reveal: the line rises into a fixed mask rather than fading.
 *
 * The mask is a separate element from the moving one because `overflow: hidden`
 * has to be on a box that itself never transforms — animating the clip and the
 * content together makes the crop drift.
 */
export function RevealLine({ children, delay = 0, className, active = true }: Props) {
  return (
    <span className={cn('block overflow-hidden', className)}>
      <span
        className={cn(
          'block will-change-transform',
          'transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          'motion-reduce:transition-none motion-reduce:translate-y-0',
          active ? 'translate-y-0' : 'translate-y-[110%]',
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  )
}
