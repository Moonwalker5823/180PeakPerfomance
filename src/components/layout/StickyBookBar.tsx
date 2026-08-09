import { useEffect, useState } from 'react'
import { BookButton } from '@/components/ui/BookButton'
import { bookingTarget } from '@/config/site'
import { cn } from '@/lib/cn'

/**
 * Mobile-only booking bar, pinned once the hero is behind you.
 *
 * The page exists to turn DMs into bookings, and on a phone the header CTA
 * scrolls away — this keeps one within thumb reach for the whole page. Hidden
 * on desktop, where the header stays put.
 */
export function StickyBookBar() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!bookingTarget()) return null

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 pt-3 backdrop-blur-md sm:hidden',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        shown ? 'translate-y-0' : 'translate-y-full',
      )}
      // Keep it out of the tab order while it's translated off-screen.
      // React 19 takes `inert` as a real boolean — an empty string here is
      // silently treated as false, which leaves the button focusable.
      aria-hidden={!shown}
      inert={!shown}
    >
      <BookButton size="lg" className="w-full" />
    </div>
  )
}
