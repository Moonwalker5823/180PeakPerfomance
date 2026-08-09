# 180 Peak Performance

Intro site for Nate Campbell's training, nutrition and mindset coaching.

The page has one job: **turn DMs into bookings.** Everything on it exists to earn
a click on Calendly.

```bash
npm install
npm run dev          # http://localhost:5180
```

---

## The one thing to configure

Book buttons appear in four places — header, hero, booking slab, mobile sticky
bar — and all four are driven by a single value. Until it's set, they hide
themselves rather than render a link that goes nowhere.

```bash
cp .env.example .env.local
# then set VITE_CALENDLY_URL to Nate's real scheduling link
```

On Railway, set the same key as a **build variable** (not a runtime one — Vite
inlines `VITE_*` at build time; see the `ARG`s in the [Dockerfile](Dockerfile)).

`VITE_CONTACT_EMAIL` is the fallback: with no Calendly link the buttons become a
`mailto:` instead.

### Env files

| File | Committed | Purpose |
|---|---|---|
| `.env` | yes | Public build-time defaults. Currently `VITE_SITE_URL`, which builds the absolute Open Graph URLs in `index.html` — relative `og:image` paths are silently dropped by every link-preview scraper. |
| `.env.local` | no | Your local overrides and anything sensitive. |

`.env` is deliberately **not** in `.dockerignore`: exclude it and
`%VITE_SITE_URL%` ships unsubstituted into the meta tags.

---

## Adding Nate's content

Everything the page says lives in [`src/config/site.ts`](src/config/site.ts) —
headlines, quotes, contact details, services, testimonials. Edit that file, not
the JSX.

**Services and Proof are already built and styled, and render nothing while
their arrays are empty.** Filling the array is the whole job:

```ts
services: [
  {
    number: '01',
    title: '1-on-1 Training',
    blurb: 'What it is, in a sentence or two.',
    price: '$X / session',      // optional — omit rather than writing "enquire"
    bookingUrl: 'https://…',    // optional — its own Calendly event type
  },
],
```

Anything marked `TODO confirm with Nate` is unverified and shouldn't go public
as-is.

---

## Assets

Both scripts commit their output, so a normal build never runs them.

```bash
npm run assets:logo     # assets-source/logo-source.jpg -> traced SVGs
npm run assets:clips    # YouTube source -> hero clips + manifest
```

**Logo.** The supplied file is a 602×311 JPEG of black artwork on white. Because
it's bitonal it traces losslessly to vector, giving a wordmark that's crisp at
any size and takes its colour from CSS (`fill="currentColor"`), so one file
serves both the white knockout and any dark-on-light use.

**Clips.** [`scripts/build-clips.mjs`](scripts/build-clips.mjs) pulls the About
Me video, cuts seven silent clips, and writes
[`src/config/clips.ts`](src/config/clips.ts). Two details worth knowing:

- Every clip sits wholly **inside one continuous shot**, using boundaries from
  ffmpeg scene detection. A clip that straddles the editor's cut makes our own
  hard cut read as a glitch.
- The source is exported with **letterbox bars baked in** — the real picture is
  1280×604 at y=58. The encoder crops them; without that the full-bleed hero
  shows black bands.

To swap in the videographer's master file: drop it at `.cache/source.mp4` and
re-run `npm run assets:clips`. Timestamps may need adjusting, but no component
changes — the reel reads the manifest.

```bash
npm run assets:clips -- --survey   # contact sheets, for choosing new cut points
npm run assets:clips -- --audio    # just the music bed, skip re-encoding clips
```

**Music bed.** `public/audio/bed.mp3` is 26.5s lifted from a stretch of the
video with no speech over it (the transcript pins the three spoken blocks, so
the music-only windows are known exactly).

> ⚠️ **Placeholder.** That track is licensed to AboutMeVideo+ for use in that
> video. That almost certainly does not cover looping it on a website. Replace
> it with something Nate holds web rights to — drop the file in and point
> `site.audio.track` at it, or set the value to `null` to remove the control
> and the audio entirely.

On autoplay: browsers refuse audible playback until the page has a real click,
tap or keypress — a hard policy, not a setting, so `play()` on load simply
rejects on a first visit. [`SoundToggle`](src/components/media/SoundToggle.tsx)
attempts playback immediately (which succeeds for repeat visitors, where the
browser has built up engagement for the origin) and otherwise starts on the
visitor's first interaction. Both paths are tested. An explicit toggle-off is
remembered and never overridden, and the control is always present so audio can
be stopped — which WCAG 1.4.2 requires for anything playing over three seconds.

---

## Checking your work

```bash
npm run shots                 # filmstrip at mobile / tablet / desktop
npm run shots -- --hero       # first screenful only
npm run shots -- --only desktop --url http://localhost:4173
```

Writes to `.cache/shots`. Uses the Chrome already on the machine, so there's no
second browser to download. It captures a scrolling filmstrip rather than a
full-page shot on purpose — full-page mode stretches the viewport to the
document height, which makes every `vh` unit resolve against that new height and
balloons the `260vh` section past 15,000px.

Verified on the production build: **~1.6 MB initial transfer**, 2 of 7 clips
touched on load, and **zero YouTube requests** until someone opens the lightbox.

### QA notes

Things worth knowing if you touch the layout, each of which was a real bug here:

- **Never put the reveal transform on the element carrying a section `id`.**
  Browsers scroll an anchor into view using its *transformed* box, so animating
  the target means a nav click lands against the pre-reveal position and the
  content then slides up under the fixed header. [`Section`](src/components/ui/Section.tsx)
  keeps the transform on an inner element for exactly this reason.
- **Anchor targets need `scroll-mt-16 sm:scroll-mt-20`** to clear the fixed
  header (64px / 80px).
- **Sections whose display type is a quote or a scrubbed word swap need an
  explicit `<h2>`.** Two sections had no heading at all, so heading navigation
  skipped straight past them. `Eyebrow` takes an `as="h2"` prop for this.
- **Full-page screenshots lie about `vh` layouts** — see the filmstrip note
  above.

---

## Deploy — Railway

Dockerfile → Caddy. `railway.json` pins the Dockerfile builder so Nixpacks
doesn't guess.

The [Caddyfile](Caddyfile) binds `:{$PORT:80}` — Railway injects `$PORT`, and
hardcoding a port is the usual reason a first deploy comes back "no healthy
upstream". SPA fallback, zstd/gzip, immutable caching on hashed assets, and
`no-cache` on the shell.

Exercise the real serving config locally before pushing:

```bash
npm run build && PORT=8099 SITE_ROOT=./dist caddy run --config Caddyfile
```

---

## Still needed from Nate

1. **Calendly URL** — without it the page has no conversion path.
2. **Services and prices** — both sections are built and waiting on the array.
3. **Original logo vector** (AI/EPS/SVG) — the trace is clean, but the real file
   is better.
4. **Master video file** — we're re-encoding a 720p YouTube rip.
5. **Domain** — `180peakperformance.com` is on his own end card but no longer
   resolves. Does he still own it?
6. **Rights on the footage and the music** — both produced by / licensed to
   AboutMeVideo+. Worth one line of confirmation before they headline his site,
   and the music bed in particular should be replaced with a web-licensed track.
7. Contact details, socials, service area, testimonials.

---

## Credits

Copy is drawn from Nate's own words — see
[assets-source/TRANSCRIPT.md](assets-source/TRANSCRIPT.md), reconciled from
YouTube's auto-captions and a whisper.cpp pass, because each one missed
something the other caught.

Built and designed by [Eric Askew](https://ea-portfolio-p6wr.vercel.app/) ♛
