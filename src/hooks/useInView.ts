import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Fire once and stop observing. Reveals shouldn't replay on scroll-back. */
  once?: boolean
  rootMargin?: string
  threshold?: number
}

/**
 * Reveal trigger. Returns a ref to attach and whether it has entered view.
 */
export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.15,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return { ref, inView }
}
