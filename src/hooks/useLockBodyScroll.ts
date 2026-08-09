import { useEffect } from 'react'

/**
 * Freezes background scroll while a modal is open. Compensates for the
 * scrollbar's width so the page behind doesn't jump sideways as it locks.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const { body, documentElement } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gutter = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [locked])
}
