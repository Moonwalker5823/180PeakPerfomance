import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { site } from '@/config/site'

/** Dormant until `site.testimonials` has entries. See Services for the pattern. */
export function Proof() {
  if (site.testimonials.length === 0) return null

  return (
    <Section id="proof">
      <Container width="wide">
        <Eyebrow>{site.testimonialsIntro.eyebrow}</Eyebrow>
        <h2 className="font-display mt-7 text-[clamp(2.4rem,7vw,5.5rem)] text-paper">
          {site.testimonialsIntro.heading}
        </h2>

        <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {site.testimonials.map((t) => (
            <li key={t.name} className="flex flex-col justify-between gap-8 bg-ink p-8 sm:p-10">
              <blockquote className="text-lg leading-relaxed text-balance text-paper/85">
                “{t.quote}”
              </blockquote>
              <footer>
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-paper">{t.name}</p>
                {t.detail && <p className="mt-2 text-sm text-muted">{t.detail}</p>}
              </footer>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
