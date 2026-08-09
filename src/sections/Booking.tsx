import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { BookButton } from '@/components/ui/BookButton'
import { site, bookingTarget } from '@/config/site'

export function Booking() {
  const target = bookingTarget()

  return (
    <Section id="book">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.6rem,9vw,7rem)] text-paper">
              {site.booking.heading.split('\n').map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-balance text-paper/70 sm:text-lg">
              {site.booking.body}
            </p>

            <div className="mt-8">
              <BookButton size="lg" className="w-full sm:w-auto" />
            </div>

            {/* Dev-only. In production an unset link simply means no button —
                never a placeholder that goes nowhere. */}
            {!target && import.meta.env.DEV && (
              <p className="mt-6 border border-line-bright px-4 py-3 text-xs leading-relaxed text-muted">
                No booking link configured. Set <code className="text-paper">VITE_CALENDLY_URL</code> in{' '}
                <code className="text-paper">.env.local</code> (or{' '}
                <code className="text-paper">VITE_CONTACT_EMAIL</code> as a fallback) to switch every
                book button on. This notice is hidden in production builds.
              </p>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}
