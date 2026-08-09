import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { site } from '@/config/site'
import { clips } from '@/config/clips'

const portrait = clips.find((c) => c.id === 'sweat') ?? clips[0]

export function MeetNate() {
  return (
    <Section id="nate">
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line">
              <img
                src={portrait.poster}
                alt={portrait.alt}
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

            <blockquote className="font-display mt-8 text-[clamp(1.9rem,4.6vw,3.6rem)] text-paper">
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
