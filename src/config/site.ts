/**
 * Every piece of content on the site lives here.
 *
 * This is the file to edit when Nate sends his info — not the JSX. Sections
 * driven by an array (services, testimonials) render only when that array has
 * entries, so anything still empty is simply absent from the page rather than
 * showing a placeholder.
 *
 * Lines marked TODO are unconfirmed and must be checked with Nate before this
 * goes anywhere public.
 */

export type Service = {
  /** Displayed as the row number — '01', '02', … */
  number: string
  title: string
  blurb: string
  /** Optional. Omit entirely rather than writing "contact for pricing". */
  price?: string
  /** Optional per-service Calendly event; falls back to booking.calendlyUrl. */
  bookingUrl?: string
}

export type Testimonial = {
  quote: string
  name: string
  /** e.g. 'Lost 40lb in 6 months' — optional. */
  detail?: string
}

export type NavItem = { label: string; href: string }

export const site = {
  name: '180 Peak Performance',
  founder: 'Nate Campbell',
  founderRole: 'Founder & Coach',

  /**
   * The About Me video, produced by AboutMeVideo+ (Oct 2023).
   * TODO confirm Nate holds usage rights to the footage before launch.
   */
  video: {
    youtubeId: '4flKcYR3ZYg',
    duration: '2:15',
    label: 'Watch his story',
  },

  /**
   * Optional music bed for the hero. Set `track` to null to remove the control
   * entirely — the button hides itself rather than sitting there doing nothing.
   *
   * Never plays on load. Browsers block autoplay with sound without a gesture,
   * and a page that starts making noise by itself is the fastest way to lose a
   * visitor. It's a toggle the visitor chooses.
   *
   * TODO the current file is lifted from the video's own score, which is
   * licensed to AboutMeVideo+ for that video — that almost certainly does not
   * cover looping it on a website. Replace with a track Nate has web rights to.
   */
  audio: {
    track: '/audio/bed.mp3' as string | null,
    /** Ceiling for the bed. It sits under the page, it doesn't lead it. */
    volume: 0.32,
  },

  /**
   * The point of the whole page. Until this is set, every book CTA falls back
   * to `contact.email`, and if that's null too, the CTA hides itself.
   *
   * Supplied via VITE_CALENDLY_URL — `.env.local` locally, and a Railway
   * variable in production — so wiring up the real link is a deploy, not a
   * code change. Hardcode it here instead if you'd rather it live in git.
   * TODO get the Calendly link from Nate.
   */
  booking: {
    calendlyUrl: (import.meta.env.VITE_CALENDLY_URL as string | undefined) ?? null,
    heading: "Stop DM'ing.\nPick a time.",
    body: 'Book a consult and tell him where you are right now. He will tell you what the plan actually looks like.',
    cta: 'Book a consult',
  },

  /** TODO all unconfirmed — awaiting Nate. */
  contact: {
    email: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? null,
    phone: null as string | null,
    instagram: null as string | null,
    /** The end card of his video reads 180PEAKPERFORMANCE.COM — currently not resolving. */
    website: null as string | null,
  },

  hero: {
    eyebrow: 'Training · Nutrition · Mindset',
    /** Split across lines deliberately; the renderer respects the break. */
    headline: 'Make\nyour 180',
    /** Close to his own words in the video — deliberately not marketing-speak. */
    body: 'Consistent with the workouts. Disciplined with the nutrition. That is how you get to the highest level.',
  },

  /**
   * The brand thesis, verbatim. See assets-source/TRANSCRIPT.md.
   *
   * `lead` is at 1:15 and `quote` at 1:36. YouTube's auto-captions dropped the
   * lead entirely — it only surfaced on a second pass with whisper. It's the
   * brand defined in his own words, so it opens the section.
   */
  oneEighty: {
    lead: '180 mindset is a turnaround.',
    from: 'Weak mind',
    to: 'Positive mind',
    quote:
      "You're making a 180, you're turning it around, 'cause you're going from weak mind to a positive mind.",
    attribution: 'Nate Campbell',
  },

  about: {
    eyebrow: 'Meet Nate',
    /** Verbatim, video at 0:31. See assets-source/TRANSCRIPT.md. */
    quote:
      'Since I was a kid, seven years old, playing basketball. Picking up a ball, watching my older brothers. That’s all I knew.',
    /** Paraphrased from 0:40–0:58. Kept close to what he actually said. */
    body: [
      'He never stopped moving. Being active as a kid was all he had seen, and it stuck — so when he got older the question was a simple one: how do I stay in this?',
      'The answer was training first, then nutrition, and then the part that ties the two together — changing how someone thinks about what they are capable of.',
    ],
    closing: 'My name is Nate Campbell. I am the founder of 180 Peak Performance.',
  },

  /**
   * Empty until Nate sends the list. The section is built and styled — adding
   * entries here is all that is needed to make it appear.
   *
   * A cached snippet of the old 180peakperformance.com mentioned personal
   * training, nutrition guidance, mental coaching, a vegan meal-prep service
   * and post-op rehab. That domain no longer resolves and none of it is
   * verified, so it is NOT listed here. Confirm with Nate first.
   */
  services: [] as Service[],
  servicesIntro: {
    eyebrow: 'What he does',
    heading: 'The work',
  },

  /**
   * Build credit in the footer. The crown is Eric's mark from
   * ea-portfolio-p6wr.vercel.app — U+265B, gold #F5C518, kept in his colour
   * rather than the site's monochrome because a signature should read as
   * someone else's brand, not this one's.
   */
  credit: {
    prefix: 'Built and designed by',
    mark: '♛',
    markColor: '#F5C518',
    name: 'Eric Askew',
    url: 'https://ea-portfolio-p6wr.vercel.app/',
  },

  /** Empty until Nate sends testimonials or transformations. */
  testimonials: [] as Testimonial[],
  testimonialsIntro: {
    eyebrow: 'Proof',
    heading: 'The turnaround',
  },
}

/** Nav is derived, so dormant sections never produce a dead anchor. */
export const navItems: NavItem[] = [
  { label: 'The 180', href: '#the-180' },
  { label: 'Nate', href: '#nate' },
  ...(site.services.length ? [{ label: 'Work', href: '#work' }] : []),
  ...(site.testimonials.length ? [{ label: 'Proof', href: '#proof' }] : []),
  { label: 'Book', href: '#book' },
]

/**
 * Where a book CTA should send someone, given what we currently know.
 * `null` means we have no way to take a booking yet and the CTA should hide.
 */
export function bookingTarget(): { kind: 'calendly'; url: string } | { kind: 'email'; url: string } | null {
  if (site.booking.calendlyUrl) return { kind: 'calendly', url: site.booking.calendlyUrl }
  if (site.contact.email) {
    const subject = encodeURIComponent('Coaching enquiry')
    return { kind: 'email', url: `mailto:${site.contact.email}?subject=${subject}` }
  }
  return null
}
