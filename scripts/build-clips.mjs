/**
 * Cuts the hero reel clips out of Nate's About Me video.
 *
 *   node scripts/build-clips.mjs --survey   contact sheet every 4s, to pick cuts
 *   node scripts/build-clips.mjs            cut + encode the CLIPS below
 *
 * Clips are silent, short, and encoded twice (H.264 + VP9) so the browser takes
 * whichever is cheaper. Output lands in public/clips with a generated manifest
 * at src/config/clips.ts — VideoCutReel reads that, never the files directly,
 * so swapping in the videographer's master later is a re-run of this script and
 * nothing else.
 *
 * Requires ffmpeg on PATH. yt-dlp is fetched to .cache/ on first run.
 */
import { mkdir, writeFile, readdir, stat, chmod, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const run = promisify(execFile)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const VIDEO_URL = 'https://www.youtube.com/watch?v=4flKcYR3ZYg'
const CACHE = join(root, '.cache')
const SOURCE = join(CACHE, 'source.mp4')
const SURVEY = join(CACHE, 'survey')
const OUT = join(root, 'public', 'clips')
const MANIFEST = join(root, 'src', 'config', 'clips.ts')

/**
 * Hero reel, in play order.
 *
 * Every window sits wholly inside one continuous shot of the source. Shot
 * boundaries came from ffmpeg scene detection (`select='gt(scene,0.25)'`) —
 * a clip that straddles the editor's cut makes our own hard cut read as a
 * glitch rather than a beat. The bracketed range is the containing shot.
 *
 * The order is an arc: dark gym → heavy lift → coaching → nutrition → grit →
 * turnaround → calm.
 */
const CLIPS = [
  { id: 'gym-stand',  start: 46.8,  duration: 2.2, alt: 'Nate standing in the brick gym' },              // [46.4–49.6]
  { id: 'back-squat', start: 21.6,  duration: 2.0, alt: 'Nate under a loaded barbell mid-squat' },       // [21.3–24.0]
  { id: 'coaching',   start: 68.7,  duration: 2.0, alt: 'Nate coaching a client through battle ropes' }, // [68.4–71.1]
  { id: 'playa-wall', start: 39.4,  duration: 2.2, alt: 'Nate outside the juice bar' },                  // [39.1–42.5]
  { id: 'sweat',      start: 71.5,  duration: 2.2, alt: 'Close on Nate mid-set, catching his breath' },  // [71.1–74.7]
  { id: 'arms-up',    start: 85.7,  duration: 2.2, alt: 'Nate with arms raised against open sky' },      // [85.3–88.9]
  { id: 'beach',      start: 124.8, duration: 2.2, alt: 'Nate on the beach at the water line' },         // [124.4–128.0]
]

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

/** Grab the standalone yt-dlp binary once; keep it out of node_modules. */
async function ensureYtDlp() {
  const bin = join(CACHE, 'yt-dlp')
  if (await exists(bin)) return bin

  const asset =
    process.platform === 'darwin'
      ? 'yt-dlp_macos'
      : process.platform === 'win32'
        ? 'yt-dlp.exe'
        : 'yt-dlp_linux'
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`

  console.log(`fetching yt-dlp (${asset})…`)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`yt-dlp download failed: ${res.status} ${res.statusText}`)
  await writeFile(bin, Buffer.from(await res.arrayBuffer()))
  await chmod(bin, 0o755)
  return bin
}

async function ensureSource() {
  if (await exists(SOURCE)) {
    console.log('source.mp4 already cached')
    return
  }
  const ytdlp = await ensureYtDlp()
  console.log('downloading source video…')
  await run(
    ytdlp,
    [
      // YouTube extraction now needs a JS runtime to solve player challenges.
      // yt-dlp only enables deno by default; point it at the node we already have.
      '--js-runtimes', 'node',
      // Video-only: every clip is silent, so audio is dead weight.
      '-f', 'bv*[height<=720][ext=mp4]/bv*[height<=720]/b',
      '-o', SOURCE,
      VIDEO_URL,
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  )
}

/**
 * Contact sheet: one frame every SURVEY_STEP seconds, tiled, so cut points get
 * picked from what's actually in the video. Frame N of the sheet (1-indexed,
 * left to right, top to bottom) is at (N-1) * SURVEY_STEP seconds.
 */
const SURVEY_STEP = 3
const SURVEY_COLS = 6
const SURVEY_ROWS = 5

async function survey() {
  await mkdir(SURVEY, { recursive: true })
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', SOURCE,
    '-vf', `fps=1/${SURVEY_STEP},scale=400:-2`,
    join(SURVEY, 'f-%03d.jpg'),
  ])
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', join(SURVEY, 'f-%03d.jpg'),
    '-vf', `tile=${SURVEY_COLS}x${SURVEY_ROWS}:padding=4:margin=4:color=0x111111`,
    join(SURVEY, 'sheet-%d.jpg'),
  ])
  const perSheet = SURVEY_COLS * SURVEY_ROWS
  console.log(`survey → ${SURVEY}`)
  console.log(`${SURVEY_STEP}s per frame, ${SURVEY_COLS}x${SURVEY_ROWS} per sheet`)
  console.log(`sheet S, cell N (1-indexed) = ((S-1)*${perSheet} + N - 1) * ${SURVEY_STEP}s`)
}

/**
 * The source is exported 1280x720 with hard black letterbox bars baked in —
 * the real picture is 1280x604 starting at y=58 (2.12:1). Verified with
 * `cropdetect`, which reports the same box across every scene.
 *
 * These have to come off: the hero is full-bleed, so bars in the footage read
 * as a broken layout rather than a cinematic choice.
 */
const CROP = 'crop=1280:604:0:58'

/**
 * Upscaled past the 1280 source width on purpose. After the crop, a
 * full-viewport hero on a laptop stretches 604px of height to ~900 — doing
 * that here with lanczos looks materially better than leaving it to the
 * browser's filter, and costs a few hundred KB.
 */
const OUT_WIDTH = 1600

async function encodeClip({ id, start, duration }) {
  const base = join(OUT, id)
  const common = ['-ss', String(start), '-i', SOURCE, '-t', String(duration), '-an']
  const filter = `${CROP},scale=${OUT_WIDTH}:-2:flags=lanczos,fps=30`

  // H.264 — the universal baseline.
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    ...common,
    '-vf', filter,
    '-c:v', 'libx264', '-crf', '27', '-preset', 'slow',
    '-profile:v', 'main', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    `${base}.mp4`,
  ])

  // VP9 — typically 30-40% smaller where it's supported.
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    ...common,
    '-vf', filter,
    '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
    `${base}.webm`,
  ])

  // Poster: the reduced-motion fallback and the <video poster> for every clip.
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(start + 0.1), '-i', SOURCE,
    '-frames:v', '1', '-vf', `${CROP},scale=${OUT_WIDTH}:-2:flags=lanczos`,
    '-q:v', '4',
    `${base}.jpg`,
  ])
}

async function sizeOf(p) {
  return (await stat(p)).size
}

/**
 * Pulls the music bed out of the source video for the hero's optional audio.
 *
 * The window is one of the stretches with no speech over it — confirmed
 * against the transcript in assets-source/TRANSCRIPT.md, which lists the three
 * spoken blocks and marks everything else as score. 0:02–0:30 is the longest.
 *
 * PLACEHOLDER. The track in the video is licensed to AboutMeVideo+ for that
 * video; that licence almost certainly does not extend to looping it on a
 * website. Swap in a track Nate has web rights to before launch — it's one
 * file and one config line.
 */
const AUDIO_BED = { start: 3.0, duration: 26.5 }

async function buildAudioBed() {
  const dir = join(root, 'public', 'audio')
  await mkdir(dir, { recursive: true })
  const out = join(dir, 'bed.mp3')

  const ytdlp = await ensureYtDlp()
  const raw = join(CACHE, 'audio-source.m4a')
  if (!(await exists(raw))) {
    await run(ytdlp, ['--js-runtimes', 'node', '-f', 'ba/b', '-x', '--audio-format', 'm4a', '-o', raw, VIDEO_URL], {
      maxBuffer: 1024 * 1024 * 32,
    })
  }

  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(AUDIO_BED.start), '-i', raw, '-t', String(AUDIO_BED.duration),
    // Short fades so the loop seam is a dip rather than a click, and a level
    // ceiling so the bed never fights whatever else is on the page.
    '-af', `afade=t=in:st=0:d=0.6,afade=t=out:st=${AUDIO_BED.duration - 0.8}:d=0.8,loudnorm=I=-20:TP=-2`,
    '-c:a', 'libmp3lame', '-b:a', '128k', '-ac', '2',
    out,
  ])

  console.log(`audio bed  ${((await sizeOf(out)) / 1024).toFixed(0)}kb  →  public/audio/bed.mp3`)
}

async function build() {
  await mkdir(OUT, { recursive: true })

  const rows = []
  for (const clip of CLIPS) {
    process.stdout.write(`  ${clip.id}… `)
    await encodeClip(clip)
    const mp4 = await sizeOf(join(OUT, `${clip.id}.mp4`))
    const webm = await sizeOf(join(OUT, `${clip.id}.webm`))
    const jpg = await sizeOf(join(OUT, `${clip.id}.jpg`))
    console.log(`mp4 ${(mp4 / 1024).toFixed(0)}kb · webm ${(webm / 1024).toFixed(0)}kb · jpg ${(jpg / 1024).toFixed(0)}kb`)
    rows.push({ ...clip, bytes: Math.min(mp4, webm) })
  }

  const total = rows.reduce((n, r) => n + r.bytes, 0)
  console.log(`\ntotal (lighter codec per clip): ${(total / 1024 / 1024).toFixed(2)}MB`)

  // Lightest clip first is what the mobile/save-data path falls back to.
  const lightest = rows.reduce((a, b) => (a.bytes <= b.bytes ? a : b)).id

  const body = `// GENERATED by scripts/build-clips.mjs — do not edit by hand.
// Re-run \`npm run assets:clips\` after changing the CLIPS array in that script.

export type Clip = {
  id: string
  /** Public paths; the browser picks whichever source it can play. */
  webm: string
  mp4: string
  poster: string
  alt: string
}

export const clips: Clip[] = [
${rows
  .map(
    (r) => `  {
    id: '${r.id}',
    webm: '/clips/${r.id}.webm',
    mp4: '/clips/${r.id}.mp4',
    poster: '/clips/${r.id}.jpg',
    alt: ${JSON.stringify(r.alt)},
  },`,
  )
  .join('\n')}
]

/** Smallest clip — used alone on mobile and under save-data. */
export const lightestClip: Clip = clips.find((c) => c.id === '${lightest}') ?? clips[0]

/** Shown before any clip can play, and as the reduced-motion still. */
export const heroPoster = clips[0].poster
`
  await writeFile(MANIFEST, body)
  console.log(`manifest → ${MANIFEST}`)

  await buildAudioBed()
}

async function main() {
  await mkdir(CACHE, { recursive: true })
  await ensureSource()
  if (process.argv.includes('--audio')) {
    await buildAudioBed()
    return
  }
  if (process.argv.includes('--survey')) {
    await survey()
    const files = await readdir(SURVEY)
    console.log(`\n${files.filter((f) => f.startsWith('sheet')).length} contact sheets ready — pick cut points, then edit CLIPS.`)
    return
  }
  await build()
}

main().catch((err) => {
  console.error(err.stderr?.toString?.() ?? err)
  process.exit(1)
})
