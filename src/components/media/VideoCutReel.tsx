import { useEffect, useRef, useState } from 'react'
import { clips as allClips, heroPoster, lightestClip, type Clip } from '@/config/clips'
import { useReducedMotion, prefersLightMedia } from '@/hooks/useReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'

type Props = {
  clips?: Clip[]
  className?: string
  /** Notified on every cut, so the hero can drive its slate readout. */
  onCut?: (index: number) => void
}

type Mode = 'still' | 'single' | 'reel'

/**
 * How long each clip holds, in play order.
 *
 * Not a constant: a metronome reads as a slideshow. The short holds are
 * deliberate accents — a quick pair against longer shots is what makes a cut
 * sequence feel edited rather than timed.
 */
const HOLDS_MS = [2600, 2000, 900, 2300, 900, 2400, 3000]

/**
 * The hero background: short silent clips joined by hard cuts.
 *
 * Deliberately not a crossfade — the outgoing frame is gone before the incoming
 * one lands, and a black flash covers the swap so the join reads as an edit.
 * Each shot also drifts forward slightly across its hold, because a locked-off
 * still frame is the fastest way to make video look like a background image.
 *
 * Three modes, chosen from what the device tells us:
 *   still   reduced-motion or save-data — one poster image, no video at all
 *   single  narrow screens — the smallest clip on a loop, no cutting
 *   reel    the full sequence
 *
 * Clips mount progressively: only the first two are in the DOM on load, and
 * each cut admits the next. Mounting all seven up front would put several
 * megabytes in front of first paint for a background element.
 */
export function VideoCutReel({ clips = allClips, className, onCut }: Props) {
  const reduced = useReducedMotion()
  const isNarrow = useMediaQuery('(max-width: 768px)')
  const [lightMedia] = useState(prefersLightMedia)
  const { ref: stageRef, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0 })

  const mode: Mode = reduced || lightMedia ? 'still' : isNarrow ? 'single' : 'reel'

  const [index, setIndex] = useState(0)
  // Highest clip index allowed in the DOM. Starts at 1 so the second clip is
  // buffering while the first plays, and never rewinds.
  const [mountedUpTo, setMountedUpTo] = useState(1)
  const [cutCount, setCutCount] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const innerRef = useRef<HTMLDivElement | null>(null)

  const [documentVisible, setDocumentVisible] = useState(true)
  useEffect(() => {
    const onChange = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const running = mode === 'reel' && inView && documentVisible
  const hold = HOLDS_MS[index % HOLDS_MS.length]

  // Advance the reel. Re-armed per cut rather than an interval, so a pause
  // (scrolled away, tab hidden) resumes with a full beat instead of a stub.
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % clips.length)
      setCutCount((c) => c + 1)
    }, hold)
    return () => window.clearTimeout(timer)
  }, [running, index, hold, clips.length])

  useEffect(() => {
    onCut?.(index)
  }, [index, onCut])

  useEffect(() => {
    setMountedUpTo((m) => Math.min(clips.length - 1, Math.max(m, index + 1)))
  }, [index, clips.length])

  // Only the visible clip plays; the rest stay paused so a phone isn't decoding
  // seven streams at once. The active one also gets a fresh push-in.
  useEffect(() => {
    if (mode === 'still') return

    videoRefs.current.forEach((video, i) => {
      if (!video) return

      const isActive = i === (mode === 'single' ? 0 : index)
      if (isActive && (running || mode === 'single')) {
        video.currentTime = 0
        void video.play().catch(() => {
          /* autoplay refused — the poster stands in */
        })
        if (mode === 'reel' && !reduced) {
          // Restart the drift for this shot. Assigning 'none' and forcing a
          // reflow is what makes the same animation replay on the same element.
          video.style.animation = 'none'
          void video.offsetWidth
          video.style.animation = `push-in ${hold + 400}ms linear forwards`
        }
      } else {
        video.pause()
      }
    })
  }, [index, mode, running, mountedUpTo, hold, reduced])

  // Restart the settle on each cut. The class has to be removed and re-added
  // with a reflow between; keying the element would remount the <video>
  // children and throw away their buffers.
  useEffect(() => {
    const el = innerRef.current
    if (!el || cutCount === 0) return
    el.classList.remove('cut-jolt')
    void el.offsetWidth
    el.classList.add('cut-jolt')
  }, [cutCount])

  if (mode === 'still') {
    return (
      <div ref={stageRef} className={cn('absolute inset-0 overflow-hidden bg-ink', className)}>
        <img
          src={heroPoster}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    )
  }

  const visible = mode === 'single' ? [lightestClip] : clips.slice(0, mountedUpTo + 1)
  const activeIndex = mode === 'single' ? 0 : index

  return (
    <div ref={stageRef} className={cn('absolute inset-0 overflow-hidden bg-ink', className)}>
      <div ref={innerRef} className="absolute inset-0 will-change-transform">
        {visible.map((clip, i) => (
          <video
            key={clip.id}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            // No transition — the swap must be instantaneous to read as a cut.
            className={cn(
              'absolute inset-0 h-full w-full object-cover will-change-transform',
              i === activeIndex ? 'opacity-100' : 'opacity-0',
            )}
            poster={clip.poster}
            muted
            loop
            playsInline
            preload={i <= 1 ? 'auto' : 'metadata'}
            aria-hidden
            tabIndex={-1}
          >
            <source src={clip.webm} type="video/webm" />
            <source src={clip.mp4} type="video/mp4" />
          </video>
        ))}
      </div>

      {cutCount > 0 && mode === 'reel' && (
        <>
          <div key={`flash-${cutCount}`} className="cut-flash pointer-events-none absolute inset-0 bg-ink" />
          <div key={`split-${cutCount}`} className="cut-split pointer-events-none absolute inset-0" />
        </>
      )}

      {/* Static, not per-clip: re-announcing on every cut would make the reel
          shout over whatever a screen reader user is actually doing. */}
      <p className="sr-only">Background footage of Nate Campbell training and coaching.</p>
    </div>
  )
}

export { HOLDS_MS }
