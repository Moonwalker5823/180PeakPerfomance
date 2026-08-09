import { lazy, Suspense, useState } from 'react'
import { Button, ButtonLink } from './Button'
import { site, bookingTarget } from '@/config/site'

// react-calendly pulls in the widget script the moment it renders, so keep it
// out of the initial chunk entirely — nobody who doesn't click should pay for it.
const CalendlyPopup = lazy(() =>
  import('react-calendly').then((m) => ({ default: m.PopupModal })),
)

type Props = {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

/**
 * The single conversion path, used in the header, hero, booking slab and the
 * mobile sticky bar.
 *
 * Degrades on its own: Calendly if we have a URL, a mailto if we only have an
 * address, and nothing at all if we have neither — better an absent button
 * than one that goes nowhere.
 */
export function BookButton({ variant = 'solid', size = 'md', className, children }: Props) {
  const [open, setOpen] = useState(false)
  const target = bookingTarget()

  if (!target) return null

  const label = children ?? site.booking.cta

  if (target.kind === 'email') {
    return (
      <ButtonLink href={target.url} variant={variant} size={size} className={className}>
        {label}
      </ButtonLink>
    )
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <Suspense fallback={null}>
          <CalendlyPopup
            url={target.url}
            open
            onModalClose={() => setOpen(false)}
            rootElement={document.getElementById('root') as HTMLElement}
            pageSettings={{
              backgroundColor: 'ffffff',
              primaryColor: '0a0a0a',
              textColor: '0a0a0a',
              hideEventTypeDetails: false,
              hideLandingPageDetails: false,
            }}
          />
        </Suspense>
      )}
    </>
  )
}
