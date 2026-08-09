/**
 * Vectorises the supplied logo JPEG.
 *
 * The source (assets-source/logo-source.jpg) is a 602x311 JPEG of pure black
 * artwork on a white field — no alpha, and too small to scale cleanly. Because
 * it's bitonal it traces to vector losslessly, which is what we actually want:
 * one SVG that's crisp at any size and inherits colour from CSS.
 *
 * Outputs to src/assets/:
 *   logo.svg        full wordmark, fill="currentColor"
 *   logo-mark.svg   the peak glyph alone, traced separately so it stays small
 *   favicon.svg     the mark knocked out on the brand black
 * plus public/favicon.svg and public/apple-touch-icon.png.
 *
 * Idempotent — output is committed, so the app build never depends on this.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import potrace from 'potrace'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'assets-source', 'logo-source.jpg')
const OUT_DIR = join(root, 'src', 'assets')
const PUBLIC_DIR = join(root, 'public')

/**
 * Where the peak glyph (the "A" of PEAK) sits inside the trimmed wordmark,
 * as fractions of the trimmed bounds. Measured off the traced output by
 * scanning for ink columns on the PEAK cap line — not eyeballed.
 */
const PEAK = { x0: 0.7042, x1: 0.8842, y0: 0.0446, y1: 0.7165 }

/** Upscale before tracing — it visibly smooths curves on a 602px source. */
const TRACE_WIDTH = 1806

const TRACE_OPTS = {
  threshold: 128,
  turdSize: 4,
  optCurve: true,
  optTolerance: 0.2,
  alphaMax: 1,
}

/** potrace is callback-based; wrap the one call we need. */
function trace(buffer, options) {
  return new Promise((resolve, reject) => {
    potrace.trace(buffer, options, (err, svg) => (err ? reject(err) : resolve(svg)))
  })
}

/**
 * potrace emits `<path fill="#000">` over a white background rect. Drop the
 * rect and swap the fill for currentColor, so one file serves both the
 * black-on-white and the white-knockout placements.
 */
/**
 * potrace emits `<path fill="black" …/>` over a white background rect, and it
 * uses a *named* colour — so matching only hex would silently leave the fill
 * hard-coded and break every knockout placement. Drop the rect, rewrite any
 * real fill to currentColor (leaving `none` and `fill-rule` alone), and round
 * coordinates to 1dp, which costs nothing at display size and cuts the file
 * by roughly a third.
 */
function makeThemeable(svg) {
  return svg
    .replace(/<rect[^>]*\/>/g, '')
    .replace(/fill="(?!none")[^"]*"/g, 'fill="currentColor"')
    .replace(/(\d+\.\d+)/g, (m) => String(Math.round(Number(m) * 10) / 10))
}

function pathOf(svg) {
  return /<path[^>]*\/>/.exec(svg)?.[0] ?? ''
}

function sizeOf(svg) {
  return {
    w: Number(/width="([\d.]+)"/.exec(svg)?.[1]),
    h: Number(/height="([\d.]+)"/.exec(svg)?.[1]),
  }
}

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)}kb`

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(PUBLIC_DIR, { recursive: true })

  // Trim the white margin, upscale, then threshold hard so potrace sees clean edges.
  const prepared = sharp(await readFile(SOURCE))
    .flatten({ background: '#ffffff' })
    .greyscale()
    .trim({ threshold: 40 })
    .resize({ width: TRACE_WIDTH, kernel: 'lanczos3' })
    .threshold(140)

  const wordmarkPng = await prepared.clone().png().toBuffer()
  const { width: pw, height: ph } = await sharp(wordmarkPng).metadata()

  const wordmark = makeThemeable(await trace(wordmarkPng, TRACE_OPTS))
  await writeFile(join(OUT_DIR, 'logo.svg'), wordmark)

  // Trace the peak glyph from its own crop rather than re-using the wordmark
  // path with a tight viewBox — that would carry every other letter's geometry
  // along for the ride, which matters when this is inlined as a favicon.
  const markPng = await sharp(wordmarkPng)
    .extract({
      left: Math.round(pw * PEAK.x0),
      top: Math.round(ph * PEAK.y0),
      width: Math.round(pw * (PEAK.x1 - PEAK.x0)),
      height: Math.round(ph * (PEAK.y1 - PEAK.y0)),
    })
    .png()
    .toBuffer()

  const mark = makeThemeable(await trace(markPng, TRACE_OPTS))
  await writeFile(join(OUT_DIR, 'logo-mark.svg'), mark)

  // Favicon: the mark centred on the brand black, padded into a square.
  // The knockout colour is set on the <path>'s own fill — a favicon has no
  // CSS context for currentColor to resolve against.
  const { w: mw, h: mh } = sizeOf(mark)
  const favicon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="#0A0A0A"/>` +
    `<svg x="12" y="12" width="40" height="40" viewBox="0 0 ${mw} ${mh}" preserveAspectRatio="xMidYMid meet">` +
    pathOf(mark).replace('fill="currentColor"', 'fill="#FFFFFF"') +
    `</svg></svg>`

  await writeFile(join(OUT_DIR, 'favicon.svg'), favicon)
  await writeFile(join(PUBLIC_DIR, 'favicon.svg'), favicon)
  await sharp(Buffer.from(favicon), { density: 384 })
    .resize(180, 180)
    .png()
    .toFile(join(PUBLIC_DIR, 'apple-touch-icon.png'))

  const { w, h } = sizeOf(wordmark)
  console.log(`logo.svg       ${kb(wordmark)}  ${w}x${h}`)
  console.log(`logo-mark.svg  ${kb(mark)}  ${mw}x${mh}`)
  console.log(`favicon.svg    ${kb(favicon)}`)
  console.log(`apple-touch-icon.png  180x180`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
