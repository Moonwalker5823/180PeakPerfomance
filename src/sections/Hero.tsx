import { useCallback, useEffect, useState } from 'react'
import { VideoCutReel } from '@/components/media/VideoCutReel'
import { VideoLightbox } from '@/components/media/VideoLightbox'
import { FilmGrain } from '@/components/media/FilmGrain'
import { SoundToggle } from '@/components/media/SoundToggle'
import { BookButton } from '@/components/ui/BookButton'
import { Button } from '@/components/ui/Button'
import { RevealLine } from '@/components/ui/RevealText'
import { site } from '@/config/site'
import { clips } from '@/config/clips'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function Hero() {
  const [playing, setPlaying] = useState(false)
  const [shot, setShot] = useState(0)
  const reduced = useReducedMotion()

  // Hold the title cards back until the letterbox is most of the way open, so
  // the sequence lands in order: bars retract, then type rises into frame.
  const [titlesIn, setTitlesIn] = useState(reduced)
  useEffect(() => {
    if (reduced) {
      setTitlesIn(true)
      return
    }
    const t = window.setTimeout(() => setTitlesIn(true), 620)
    return () => window.clearTimeout(t)
  }, [reduced])

  const onCut = useCallback((i: number) => setShot(i), [])

  const headlineLines = site.hero.headline.split('\n')

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-ink">
      <VideoCutReel onCut={onCut} />

      {/* --- grade ------------------------------------------------------- */}
      {/* Cools the shadows and warms the highlights the way a colourist would,
          without putting a filter on the video element itself — filtering a
          playing <video> repaints the whole texture every frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
        style={{
          background:
            'linear-gradient(150deg, rgba(0,84,120,0.55) 0%, rgba(0,0,0,0) 45%, rgba(255,168,84,0.35) 100%)',
        }}
      />

      {/* Legibility. A corner-weighted wash rather than a full-width curtain,
          so the right side of the frame still reads as footage.

          It runs deliberately heavy at the bottom-left: that's where the
          headline sits, and it's also where the source footage carries its
          burned-in watermark, which object-cover clips mid-word on wide
          viewports. Sinking it into the shadow is cleaner than showing half. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(135% 110% at 4% 92%, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.88) 26%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.14) 72%, rgba(10,10,10,0) 88%)',
        }}
      />

      {/* Vignette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(78% 78% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      <FilmGrain />

      {/* --- letterbox --------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-30">
        <div className="letterbox-bar absolute inset-x-0 top-0 bg-ink" style={{ height: '12vh' }} />
        <div className="letterbox-bar absolute inset-x-0 bottom-0 bg-ink" style={{ height: '12vh' }} />
      </div>

      {/* --- content ----------------------------------------------------- */}
      <div className="relative z-30 flex min-h-[100svh] w-full flex-col justify-end">
        <div className="mx-auto w-full max-w-[110rem] px-5 pb-28 pt-32 sm:px-8 sm:pb-32">
          <RevealLine active={titlesIn} delay={0}>
            <span className="flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-paper/60">
              <span aria-hidden className="h-px w-8 bg-paper/40" />
              {site.hero.eyebrow}
            </span>
          </RevealLine>

          <h1 className="font-display mt-7 text-[clamp(3.5rem,13vw,11rem)] text-paper drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)]">
            {headlineLines.map((line, i) => (
              <RevealLine key={line} active={titlesIn} delay={120 + i * 110}>
                {line}
              </RevealLine>
            ))}
          </h1>

          <RevealLine active={titlesIn} delay={120 + headlineLines.length * 110}>
            <span className="mt-8 block max-w-xl text-base leading-relaxed text-balance text-paper/75 sm:text-lg">
              {site.hero.body}
            </span>
          </RevealLine>

          <div
            className="mt-10 flex flex-wrap items-center gap-3 transition-opacity duration-700 ease-out motion-reduce:transition-none sm:gap-4"
            style={{
              opacity: titlesIn ? 1 : 0,
              transitionDelay: `${320 + headlineLines.length * 110}ms`,
            }}
          >
            <BookButton size="lg" />
            <Button variant="outline" size="lg" onClick={() => setPlaying(true)}>
              {site.video.label}
              <span className="text-muted">{site.video.duration}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* --- controls + slate -------------------------------------------- */}
      {/* Bottom-right: the source footage carries a burned-in 180 Peak
          Performance watermark in the bottom-left of every frame. */}
      <div className="absolute bottom-6 right-5 z-30 flex items-center gap-4 sm:right-8">
        <SoundToggle />

        <span aria-hidden className="hidden h-3 w-px bg-paper/20 md:block" />

        <div
          aria-hidden
          className="hidden items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper/45 md:flex"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500/80" />
          <span>
            Shot {String(shot + 1).padStart(2, '0')} / {String(clips.length).padStart(2, '0')}
          </span>
          <span className="h-3 w-px bg-paper/20" />
          <span>{clips[shot]?.id.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center"
      >
        <span className="flex flex-col items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-paper/40">
          Scroll
          <span className="block h-10 w-px bg-gradient-to-b from-paper/40 to-transparent" />
        </span>
      </div>

      <VideoLightbox
        open={playing}
        onClose={() => setPlaying(false)}
        youtubeId={site.video.youtubeId}
        title={`${site.founder} — ${site.name}`}
      />
    </section>
  )
}
