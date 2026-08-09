import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ButtonLink } from '@/components/ui/Button'
import { site, bookingTarget } from '@/config/site'

/**
 * Dormant until `site.services` has entries — the layout is finished, so
 * adding Nate's list to the config is the only step left. Renders nothing at
 * all while the array is empty rather than showing placeholder rows.
 */
export function Services() {
  if (site.services.length === 0) return null

  const fallback = bookingTarget()

  return (
    <Section id="work">
      <Container width="wide">
        <Eyebrow>{site.servicesIntro.eyebrow}</Eyebrow>
        <h2 className="font-display mt-7 text-[clamp(2.4rem,7vw,5.5rem)] text-paper">
          {site.servicesIntro.heading}
        </h2>

        <ul className="mt-14">
          {site.services.map((service, i) => {
            const href = service.bookingUrl ?? (fallback?.kind === 'calendly' ? fallback.url : undefined)

            return (
              <li key={service.title} className="rule-t last:rule-b group">
                <div className="grid gap-4 py-8 sm:grid-cols-12 sm:items-baseline sm:gap-8 sm:py-10">
                  <span className="font-display text-2xl text-muted transition-colors group-hover:text-paper sm:col-span-1">
                    {service.number || String(i + 1).padStart(2, '0')}
                  </span>

                  <h3 className="font-display text-3xl text-paper sm:col-span-4 sm:text-4xl">
                    {service.title}
                  </h3>

                  <p className="text-base leading-relaxed text-paper/70 sm:col-span-5">{service.blurb}</p>

                  <div className="flex items-baseline gap-6 sm:col-span-2 sm:justify-end">
                    {service.price && (
                      <span className="text-base text-paper sm:text-lg">{service.price}</span>
                    )}
                    {href && (
                      <ButtonLink
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        variant="ghost"
                        size="sm"
                        className="px-0"
                      >
                        Book
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
