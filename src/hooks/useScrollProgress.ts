import { useEffect, useRef, useState } from 'react'

/**
 * How far a tall section has been scrolled through, 0 → 1.
 *
 * 0 when the element's top edge reaches the top of the viewport, 1 when its
 * bottom edge reaches the bottom. Equivalent to motion's
 * `offset: ['start start', 'end end']`, but measured directly from the element
 * on every frame.
 *
 * Rolled by hand on purpose: motion's useScroll caches the target's geometry,
 * and when the section contains a `position: sticky` child that cache goes
 * stale — the progress it reports stops being monotonic and the scrub jumps
 * backwards mid-scroll. Reading the rect each frame is a couple of lines and
 * cannot drift.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight

      // Shorter than the viewport: nothing to scrub through.
      if (travel <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0)
        return
      }

      setProgress(Math.min(1, Math.max(0, -rect.top / travel)))
    }

    // Coalesce to one measurement per frame — scroll fires far more often.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { ref, progress }
}

/** Map `value` from [inMin, inMax] onto [outMin, outMax], clamped at both ends. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)))
  return outMin + t * (outMax - outMin)
}
