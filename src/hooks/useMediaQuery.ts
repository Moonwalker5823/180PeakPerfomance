import { useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query. useSyncExternalStore rather than an effect so
 * the first render already has the right answer — an effect-based version
 * renders the desktop branch once on mobile, which for the hero means briefly
 * mounting seven videos on a phone.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    // Server/prerender fallback. Desktop is the safe default for layout.
    () => false,
  )
}
