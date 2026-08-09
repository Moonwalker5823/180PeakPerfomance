import { cn } from '@/lib/cn'

/**
 * Film grain.
 *
 * A single tiled fractal-noise texture, jittered between eight positions on a
 * stepped loop so it reads as moving emulsion rather than a static dither.
 * The SVG is inlined as a data URI — one paint, no request, and it stays sharp
 * at any DPR because it's generated, not sampled.
 */
const NOISE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="220" height="220" filter="url(#n)" opacity="0.55"/>
  </svg>`.replace(/\s+/g, ' '),
)

export function FilmGrain({ className, opacity = 0.055 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn('film-grain pointer-events-none absolute inset-0 z-20', className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${NOISE}")`,
      }}
    />
  )
}
