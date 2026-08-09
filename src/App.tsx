import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StickyBookBar } from '@/components/layout/StickyBookBar'
import { Hero } from '@/sections/Hero'
import { OneEighty } from '@/sections/OneEighty'
import { MeetNate } from '@/sections/MeetNate'
import { Services } from '@/sections/Services'
import { Proof } from '@/sections/Proof'
import { Booking } from '@/sections/Booking'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">
        <Hero />
        <OneEighty />
        <MeetNate />
        {/* Both render null until their config arrays are populated. */}
        <Services />
        <Proof />
        <Booking />
      </main>

      <Footer />
      <StickyBookBar />
    </>
  )
}
