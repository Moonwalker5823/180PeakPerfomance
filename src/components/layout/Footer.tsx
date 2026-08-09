import { Logo } from '@/components/media/Logo'
import { Container } from '@/components/ui/Container'
import { site } from '@/config/site'

export function Footer() {
  const { contact } = site
  const links = [
    contact.email && { label: 'Email', href: `mailto:${contact.email}`, text: contact.email },
    contact.phone && { label: 'Phone', href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, text: contact.phone },
    contact.instagram && { label: 'Instagram', href: contact.instagram, text: '@180peakperformance' },
  ].filter(Boolean) as { label: string; href: string; text: string }[]

  return (
    // Extra bottom padding on mobile so the last row clears StickyBookBar,
    // which is fixed to the viewport bottom and otherwise covers it.
    <footer className="rule-t pt-16 pb-32 sm:pt-20 sm:pb-20">
      <Container width="wide">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-sm">
            <Logo className="w-44 text-paper sm:w-56" />
            <p className="mt-6 text-sm leading-relaxed text-muted">
              Training, nutrition and mindset coaching with {site.founder}.
            </p>
          </div>

          {links.length > 0 && (
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.label} className="flex items-baseline gap-4">
                  <span className="w-20 shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
                    {link.label}
                  </span>
                  <a href={link.href} className="text-sm text-paper transition-colors hover:text-muted">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rule-t mt-12 flex flex-col gap-3 pt-6 text-[0.68rem] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · All rights reserved
          </p>

          <a
            href={site.credit.url}
            target="_blank"
            rel="noreferrer noopener"
            // The crown carries no meaning to a screen reader, so the link
            // states who it credits rather than leaving it as a bare glyph.
            aria-label={`${site.credit.prefix} ${site.credit.name}`}
            className="group inline-flex items-center gap-2 transition-colors hover:text-paper"
          >
            {site.credit.prefix}
            <span
              aria-hidden
              style={{ color: site.credit.markColor }}
              className="text-sm leading-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
            >
              {site.credit.mark}
            </span>
          </a>
        </div>
      </Container>
    </footer>
  )
}
