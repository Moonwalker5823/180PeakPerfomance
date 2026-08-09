import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView } from '@/hooks/useInView'

type Props = {
  id?: string
  children: ReactNode
  className?: string
  /** Draws the hairline that separates every section. */
  divided?: boolean
}

/**
 * Section wrapper with the shared vertical rhythm and a one-shot reveal.
 *
 * The reveal transform lives on an inner element, never on the <section> that
 * carries the id. Browsers scroll an anchor into view using its *transformed*
 * box, so animating the target itself means a nav click lands against the
 * pre-reveal position and the content then slides up out from under the
 * header — off by exactly the reveal distance. Keeping the anchor's geometry
 * static decouples the two.
 *
 * The reveal is a plain CSS transition rather than a motion component; it runs
 * on every section, and this keeps it off the main thread.
 */
export function Section({ id, children, className, divided = true }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section
      id={id}
      className={cn(
        'relative py-24 sm:py-32 lg:py-40',
        // Anchor links land under the fixed header without this — it's 64px
        // tall on mobile and 80px from `sm` up.
        'scroll-mt-16 sm:scroll-mt-20',
        divided && 'rule-t',
        className,
      )}
    >
      <div
        ref={ref}
        className={cn(
          'transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          inView
            ? 'translate-y-0 opacity-100'
            : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        )}
      >
        {children}
      </div>
    </section>
  )
}
