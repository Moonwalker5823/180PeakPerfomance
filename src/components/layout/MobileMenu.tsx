import { useEffect, useState } from 'react'
import { BookButton } from '@/components/ui/BookButton'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { navItems } from '@/config/site'
import { cn } from '@/lib/cn'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-10 w-10 items-center justify-center lg:hidden"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <span aria-hidden className="relative block h-3 w-6">
          <span
            className={cn(
              'absolute left-0 block h-px w-full bg-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              open ? 'top-1.5 rotate-45' : 'top-0',
            )}
          />
          <span
            className={cn(
              'absolute left-0 block h-px w-full bg-paper transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              open ? 'top-1.5 -rotate-45' : 'top-3',
            )}
          />
        </span>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 border-t border-line bg-ink px-5 pt-10 sm:top-20 lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display rule-b py-5 text-4xl text-paper transition-colors hover:text-muted"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <BookButton size="lg" className="mt-10 w-full" />
      </div>
    </>
  )
}
