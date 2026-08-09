import { useEffect, useState } from 'react'
import { Logo } from '@/components/media/Logo'
import { BookButton } from '@/components/ui/BookButton'
import { MobileMenu } from './MobileMenu'
import { navItems } from '@/config/site'
import { cn } from '@/lib/cn'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-line bg-ink/85 backdrop-blur-md'
          : // Unscrolled, the nav sits directly on the footage — which can cut
            // to a blown-out sky or a yellow plate and swallow it. A soft scrim
            // keeps it legible against every shot without reading as a bar.
            'border-b border-transparent bg-gradient-to-b from-ink/85 via-ink/45 to-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[110rem] items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
        <a href="#top" aria-label="180 Peak Performance — back to top" className="shrink-0">
          <Logo className="w-28 text-paper sm:w-32" title={null} />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.72rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-paper"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <BookButton size="sm" className="hidden sm:inline-flex" />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
