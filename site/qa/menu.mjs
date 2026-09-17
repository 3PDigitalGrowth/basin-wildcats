import { chromium } from '@playwright/test'
const [url = 'http://localhost:3000/', label = 'Play', out = 'menu.png', w = '1440'] = process.argv.slice(2)
const width = parseInt(w, 10)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, isMobile: width < 800, hasTouch: width < 800 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => { document.querySelectorAll('.reveal,.rise').forEach((el) => { el.classList.add('is-in'); el.style.animation = 'none'; el.style.opacity = '1'; el.style.transform = 'none' }) })
if (width < 800) {
  await page.click('.nav-toggle')
  await page.click(`.mobile-group-btn:has-text("${label}")`)
} else {
  await page.hover(`.nav-pill button:has-text("${label}")`)
}
await page.waitForTimeout(700)
await page.screenshot({ path: out, fullPage: false })
console.log('saved', out)
await browser.close()
