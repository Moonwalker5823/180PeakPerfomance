/**
 * Screenshots the running site at every breakpoint.
 *
 *   npm run dev                       # in one terminal
 *   npm run shots                     # filmstrip: every screenful, each viewport
 *   npm run shots -- --hero           # just the first screenful
 *   npm run shots -- --only desktop
 *   npm run shots -- --url http://localhost:4173
 *
 * Captures a filmstrip — fixed viewport, scrolled one screen at a time —
 * rather than Puppeteer's fullPage mode. fullPage stretches the viewport to
 * the document height, which makes every `vh` unit resolve against that new
 * height: a `280vh` section balloons to ~15000px and the page below it is
 * pushed out of frame. The filmstrip is what a visitor actually sees.
 *
 * Drives the Chrome already installed on the machine via puppeteer-core, so
 * there's no second browser to download. Output lands in .cache/shots.
 */
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, '.cache', 'shots')

const CHROME =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
  { name: 'tablet', width: 834, height: 1112, dsf: 2 },
  { name: 'desktop', width: 1440, height: 900, dsf: 2 },
]

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  return i === -1 ? fallback : process.argv[i + 1]
}

const url = arg('--url', 'http://localhost:5180')
const heroOnly = process.argv.includes('--hero')
// Let the reel cut a few times before capturing, so the shot isn't always clip 1.
const settle = Number(arg('--settle', heroOnly ? '3200' : '1800'))

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'shell',
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio', '--hide-scrollbars'],
  })

  const only = arg('--only', null)

  for (const vp of VIEWPORTS) {
    if (only && vp.name !== only) continue

    const page = await browser.newPage()
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      isMobile: vp.width < 768,
      hasTouch: vp.width < 768,
    })

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 })
    await page.evaluate(() => document.fonts.ready)
    // Scrubbed animations need the instant setter, or every scroll step lands
    // mid-tween and the frame is a blur of two states.
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto'
    })
    await new Promise((r) => setTimeout(r, settle))

    if (heroOnly) {
      const file = join(OUT, `${vp.name}-hero.png`)
      await page.screenshot({ path: file })
      console.log(`${vp.name.padEnd(8)} ${vp.width}x${vp.height}  →  ${file}`)
      await page.close()
      continue
    }

    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    const steps = Math.ceil(total / vp.height)

    for (let i = 0; i < steps; i++) {
      const y = i * vp.height
      await page.evaluate((top) => {
        document.documentElement.scrollTop = top
      }, y)
      // Let scroll-linked transforms settle and any newly-mounted clip paint.
      await new Promise((r) => setTimeout(r, 650))

      const file = join(OUT, `${vp.name}-${String(i).padStart(2, '0')}.png`)
      await page.screenshot({ path: file })
      console.log(`${vp.name.padEnd(8)} frame ${i} @ y=${y}  →  ${file}`)
    }

    await page.close()
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
