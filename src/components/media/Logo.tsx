import wordmarkRaw from '@/assets/logo.svg?raw'
import markRaw from '@/assets/logo-mark.svg?raw'
import { cn } from '@/lib/cn'

/**
 * Inline the traced SVG rather than pointing an <img> at it — the artwork is
 * filled with `currentColor`, which only resolves when the SVG is part of the
 * document. That's what lets one file serve both the white knockout on the
 * dark page and any dark-on-light placement later.
 *
 * Intrinsic width/height are stripped so the mark sizes from its container;
 * the viewBox is left intact to preserve the aspect ratio.
 */
function prepare(raw: string) {
  return raw
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/<svg /, '<svg preserveAspectRatio="xMidYMid meet" ')
}

const wordmark = prepare(wordmarkRaw)
const mark = prepare(markRaw)

type Props = {
  /** 'wordmark' is the full lockup; 'mark' is the peak glyph alone. */
  variant?: 'wordmark' | 'mark'
  className?: string
  /** Visible label for assistive tech. Set to null for decorative use. */
  title?: string | null
}

export function Logo({ variant = 'wordmark', className, title = '180 Peak Performance' }: Props) {
  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      className={cn('block [&>svg]:block [&>svg]:h-auto [&>svg]:w-full', className)}
      dangerouslySetInnerHTML={{ __html: variant === 'mark' ? mark : wordmark }}
    />
  )
}
