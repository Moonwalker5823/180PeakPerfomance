import { useCallback, useEffect, useRef } from 'react'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

type Props = {
  open: boolean
  onClose: () => void
  youtubeId: string
  title?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Plays the full video with sound, in a modal.
 *
 * The iframe is mounted only while open, so YouTube ships nothing — no script,
 * no cookie, no request — to a visitor who never opens it. Uses the -nocookie
 * host for the same reason.
 */
export function VideoLightbox({ open, onClose, youtubeId, title = 'Video' }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const restoreTo = useRef<HTMLElement | null>(null)

  useLockBodyScroll(open)

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    if (open) {
      restoreTo.current = document.activeElement as HTMLElement | null
      // Wait a frame so the button exists before focusing it.
      const raf = requestAnimationFrame(() => closeRef.current?.focus())
      return () => cancelAnimationFrame(raf)
    }
    restoreTo.current?.focus?.()
  }, [open])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const root = dialogRef.current
      if (!root) return
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Wrap at both ends so focus can't escape to the page behind.
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onKeyDown])

  if (!open) return null

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div ref={dialogRef} className="relative w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted">{title}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 items-center gap-2 px-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-paper"
          >
            Close
            <span aria-hidden className="text-base leading-none">
              ✕
            </span>
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden border border-line bg-black">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
