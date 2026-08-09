import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /**
   * Render as a heading where this label is the section's actual title.
   * Several sections lead with display type that isn't a heading — a quote, a
   * scrubbed word swap — which left them invisible to heading navigation. The
   * eyebrow is the honest title in those cases, so it can carry the tag.
   */
  as?: 'p' | 'h2'
}

/** Small uppercase label with the tick mark that precedes every section head. */
export function Eyebrow({ children, className, as: Tag = 'p' }: Props) {
  return (
    <Tag
      className={cn(
        'flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted',
        className,
      )}
    >
      <span aria-hidden className="h-px w-8 bg-line-bright" />
      {children}
    </Tag>
  )
}
