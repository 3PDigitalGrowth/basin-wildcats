import { chromium } from '@playwright/test'
const [url = 'http://localhost:3000/', w = '390', out = 'shot.png'] = process.argv.slice(2)
const width = parseInt(w, 10)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, isMobile: width < 800, hasTouch: width < 800 })
await page.goto(url, { waitUntil: 'networkidle' })
// force reveal animations to finish and counters to settle
await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in')); document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = el.dataset.count }) })
// scroll through the page so lazy images load before the capture
await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) })
await page.waitForTimeout(800)
await page.screenshot({ path: out, fullPage: true })
console.log('saved', out)
await browser.close()
