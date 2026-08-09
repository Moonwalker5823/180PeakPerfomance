import { Container } from '@/components/ui/Container'
import { site } from '@/config/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrollProgress, mapRange } from '@/hooks/useScrollProgress'

/**
 * The thesis. "180" is not a number, it's the turnaround — so the section
 * performs one: the numeral rotates a half turn as you scroll while WEAK MIND
 * is replaced by POSITIVE MIND.
 *
 * The swap is a mask, not a crossfade. Both lines sit in one clipped box and
 * travel together, so exactly one is legible at any point in the scroll —
 * fading them past each other leaves a stretch where the two overlap and
 * neither can be read.
 *
 * Tall section, sticky viewport inside it: that's what gives the scrub room.
 */
export function OneEighty() {
  const reduced = useReducedMotion()
  const { ref, progress } = useScrollProgress<HTMLElement>()

  if (reduced) {
    return (
      <section id="the-180" className="rule-t scroll-mt-16 py-24 sm:scroll-mt-20 sm:py-32">
        <Container width="wide">
          <h2 className="font-display mb-6 text-[clamp(1.15rem,2.6vw,2.1rem)] text-muted">
            {site.oneEighty.lead}
          </h2>
          <p className="font-display text-[clamp(2.5rem,9vw,7rem)] text-muted">{site.oneEighty.from}</p>
          <p className="font-display text-[clamp(2.5rem,9vw,7rem)] text-paper">{site.oneEighty.to}</p>
          <blockquote className="mt-10 max-w-2xl text-lg leading-relaxed text-paper/80">
            “{site.oneEighty.quote}”
            <footer className="mt-4 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {site.oneEighty.attribution}
            </footer>
          </blockquote>
        </Container>
      </section>
    )
  }

  const leadOpacity = mapRange(progress, 0.03, 0.15, 0, 1)
  const leadY = mapRange(progress, 0.03, 0.15, 18, 0)

  // One shared travel value drives both lines, so they can never desync.
  const swap = mapRange(progress, 0.22, 0.58, 0, 1)
  const rotate = mapRange(progress, 0, 1, 0, 180)
  const numeralOpacity = mapRange(progress, 0, 0.25, 0.03, 0.09)
  const quoteOpacity = mapRange(progress, 0.66, 0.86, 0, 1)
  const quoteY = mapRange(progress, 0.66, 0.86, 24, 0)

  return (
    // Shorter on small screens. The sticky child is a full viewport tall, so
    // once the scrub finishes there's always a screen-height tail while it
    // scrolls away — on a phone that tail is a lot of thumb-work through an
    // increasingly empty frame. Less runway there, full runway on desktop.
    <section
      id="the-180"
      ref={ref}
      className="rule-t relative h-[190vh] scroll-mt-16 sm:h-[230vh] sm:scroll-mt-20 lg:h-[260vh]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* The numeral, doing the turnaround. */}
        <span
          aria-hidden
          style={{ transform: `translate(-50%, -50%) rotate(${rotate}deg)`, opacity: numeralOpacity }}
          className="font-display pointer-events-none absolute left-1/2 top-1/2 text-[42vw] leading-none text-paper will-change-transform"
        >
          180
        </span>

        <Container width="wide" className="relative">
          {/* His own definition of the brand — arrives just ahead of the swap
              it describes, and is the section's heading. The word swap below
              is scrubbed display type, not something that can carry the tag. */}
          <h2
            style={{ opacity: leadOpacity, transform: `translate3d(0, ${leadY}px, 0)` }}
            className="font-display mb-5 text-[clamp(1.15rem,2.6vw,2.1rem)] text-muted will-change-transform sm:mb-7"
          >
            {site.oneEighty.lead}
          </h2>

          {/* Clipped box, exactly one line tall.
              Each line fills the box (`inset-0`), so translating by 100% moves
              it by precisely one box height and the two can never be in frame
              together. Sizing the box larger than the line — or translating by
              a percentage of the text's own height instead of the box's —
              leaves a window where both are visible and the swap reads as a
              layout bug rather than a roll. */}
          <div className="relative h-[0.92em] overflow-hidden font-display text-[clamp(2.5rem,11vw,9rem)]">
            <p
              style={{ transform: `translate3d(0, ${swap * -100}%, 0)` }}
              className="absolute inset-0 flex items-center text-muted will-change-transform"
            >
              {site.oneEighty.from}
            </p>
            <p
              style={{ transform: `translate3d(0, ${100 - swap * 100}%, 0)` }}
              className="absolute inset-0 flex items-center text-paper will-change-transform"
            >
              {site.oneEighty.to}
            </p>
          </div>

          <blockquote
            style={{ opacity: quoteOpacity, transform: `translate3d(0, ${quoteY}px, 0)` }}
            className="mt-12 max-w-2xl text-balance text-lg leading-relaxed text-paper/80 will-change-transform sm:text-xl"
          >
            “{site.oneEighty.quote}”
            <footer className="mt-5 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {site.oneEighty.attribution}
            </footer>
          </blockquote>
        </Container>
      </div>
    </section>
  )
}
