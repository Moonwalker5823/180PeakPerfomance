import { useCallback, useEffect, useRef, useState } from 'react'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'

const FADE_MS = 900

/**
 * Music bed for the hero, with a visible on/off control.
 *
 * On autostart: browsers refuse to play audible media until the page has
 * "sticky activation" — a real click, tap or keypress. That's a hard policy,
 * not a setting, so calling play() on load simply rejects on a first visit.
 *
 * So this does both: it attempts playback immediately (which succeeds on
 * repeat visits, where the browser has built up engagement for the origin),
 * and if that's refused it arms a one-shot listener and starts on the visitor's
 * very first interaction with the page. In practice anyone who clicks or
 * scrolls-then-clicks gets the music without ever seeing a dead control.
 *
 * Only gestures that actually grant activation are listened for — `wheel` and
 * `scroll` do not count, so arming those would just fail again.
 *
 * An explicit toggle-off is remembered for the session and never overridden,
 * and the control is always present so audio can be stopped (WCAG 1.4.2).
 */
export function SoundToggle({ className }: { className?: string }) {
  const { track, volume } = site.audio
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRef = useRef<number>(0)
  const optedOutRef = useRef(false)
  const [on, setOn] = useState(false)
  /** Autoplay was refused, so the control has to ask for the gesture it needs. */
  const [needsGesture, setNeedsGesture] = useState(false)

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const el = audioRef.current
    if (!el) return

    cancelAnimationFrame(fadeRef.current)
    const from = el.volume
    const start = performance.now()

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS)
      el.volume = from + (target - from) * t
      if (t < 1) fadeRef.current = requestAnimationFrame(step)
      else onDone?.()
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [])

  const start = useCallback(() => {
    const el = audioRef.current
    if (!el || optedOutRef.current || !el.paused) return Promise.reject()

    el.volume = 0
    return el.play().then(() => {
      setOn(true)
      fadeTo(volume)
    })
  }, [fadeTo, volume])

  const stop = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    fadeTo(0, () => el.pause())
    setOn(false)
  }, [fadeTo])

  const toggle = useCallback(() => {
    if (on) {
      optedOutRef.current = true
      stop()
    } else {
      optedOutRef.current = false
      void start().catch(() => setOn(false))
    }
  }, [on, start, stop])

  // Autostart: try now, otherwise on the first gesture that grants activation.
  useEffect(() => {
    if (!track) return

    let cleanedUp = false
    const events = ['pointerdown', 'touchend', 'keydown', 'click'] as const

    const onFirstGesture = () => {
      void start()
        .then(() => setNeedsGesture(false))
        .catch(() => {})
      teardown()
    }

    const teardown = () => {
      if (cleanedUp) return
      cleanedUp = true
      events.forEach((e) => window.removeEventListener(e, onFirstGesture))
    }

    void start()
      .then(teardown)
      .catch(() => {
        // Blocked — wait for the visitor to touch the page, and say so on the
        // control. "Sound off" reads as a state they chose; this is not that.
        setNeedsGesture(true)
        events.forEach((e) => window.addEventListener(e, onFirstGesture, { passive: true }))
      })

    return teardown
  }, [track, start])

  // Don't keep playing into a tab the visitor has switched away from.
  useEffect(() => {
    const onVisibility = () => {
      const el = audioRef.current
      if (!el || !on) return
      if (document.hidden) el.pause()
      else void el.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [on])

  useEffect(() => () => cancelAnimationFrame(fadeRef.current), [])

  if (!track) return null

  return (
    <>
      {/* `preload="auto"` so the bed is ready the instant a gesture unlocks it —
          a delay between the click and the music reads as jank. */}
      <audio ref={audioRef} src={track} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className={cn(
          // Sits over moving footage, so it needs more contrast than the
          // decorative slate beside it — this one is an actual control, and a
          // shot can cut to a blown-out sky at any moment.
          'group flex items-center gap-2.5 px-1 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-paper/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition-colors hover:text-paper',
          className,
        )}
      >
        <span aria-hidden className="flex h-3.5 w-4 items-end justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn('w-[2px] bg-current', on ? 'eq-bar' : 'h-[3px] transition-[height] duration-300')}
              style={on ? { animationDelay: `${i * 140}ms` } : undefined}
            />
          ))}
        </span>
        {/* "Sound off" reads as a choice the visitor made. When the browser
            refused autoplay it isn't — so the control asks for the gesture it
            needs instead of misreporting its own state. */}
        {on ? 'Sound on' : needsGesture ? 'Turn on sound' : 'Sound off'}
      </button>
    </>
  )
}
