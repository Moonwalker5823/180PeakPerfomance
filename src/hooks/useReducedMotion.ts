import { useMediaQuery } from './useMediaQuery'

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

type ConnectionLike = { saveData?: boolean; effectiveType?: string }

/**
 * True when the browser signals a metered or slow connection. Not supported
 * everywhere — absence is treated as "fine to load video", which is the same
 * assumption we would make without the API at all.
 */
export function prefersLightMedia(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as Navigator & { connection?: ConnectionLike }).connection
  if (!conn) return false
  if (conn.saveData) return true
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'
}
