import { chromium } from '@playwright/test'
const url = process.argv[2] || 'http://localhost:3000/'
const width = parseInt(process.argv[3] || '390', 10)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: width < 800, hasTouch: width < 800 })
await page.goto(url, { waitUntil: 'networkidle' })
const r = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth
  const out = { vw, scrollWidth: document.documentElement.scrollWidth, bodyScroll: document.body.scrollWidth, viewportMeta: document.querySelector('meta[name=viewport]')?.getAttribute('content') || null, wide: [] }
  document.querySelectorAll('body *').forEach((el) => {
    const b = el.getBoundingClientRect()
    if (b.right > vw + 2 && b.width > 0 && getComputedStyle(el).position !== 'fixed') {
      out.wide.push({ tag: el.tagName.toLowerCase(), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 60), right: Math.round(b.right), width: Math.round(b.width) })
    }
  })
  out.wide = out.wide.slice(0, 25)
  out.menuVisible = (() => { const m = document.querySelector('.nav-toggle'); if (!m) return 'missing'; const cs = getComputedStyle(m); return cs.display })()
  return out
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
