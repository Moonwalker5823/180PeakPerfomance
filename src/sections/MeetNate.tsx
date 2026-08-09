import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { site } from '@/config/site'
import { natePortrait } from '@/config/clips'

export function MeetNate() {
  return (
    <Section id="nate">
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line">
              {/* A still cut for this box specifically, not a frame borrowed
                  from a hero clip — those are chosen for motion, so they're
                  usually mid-movement and blurred, and a 2.12:1 plate loses
                  most of its width to a 4:5 crop. */}
              <img
                src={natePortrait}
                alt={`${site.founder}, founder of ${site.name}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover grayscale"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* The section leads with a pull quote, which is not a heading —
                so the eyebrow carries the tag. */}
            <Eyebrow as="h2">{site.about.eyebrow}</Eyebrow>

            {/* `.font-display` sets line-height 0.86, which is right for a
                one or two line headline and collides on a block this long —
                ascenders run into the line above. Overridden here. */}
            <blockquote className="font-display mt-8 text-[clamp(1.7rem,3.6vw,2.9rem)] leading-[1.04] text-paper">
              “{site.about.quote}”
            </blockquote>

            <div className="mt-10 max-w-xl space-y-5 text-base leading-relaxed text-paper/70 sm:text-lg">
              {site.about.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <p className="rule-t mt-10 pt-8 text-base text-paper sm:text-lg">{site.about.closing}</p>
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {site.founder} — {site.founderRole}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
