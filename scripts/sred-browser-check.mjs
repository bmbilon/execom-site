// Mobile and desktop verification for /sred.
//
// Drives the real page in Chromium at every width the QA spec names, walks the
// whole assessor to a preliminary result and on to the contact step, and fails
// loudly on horizontal overflow, undersized inputs (which make iOS zoom), small
// tap targets, or a console error.
//
//   node scripts/sred-browser-check.mjs [baseUrl] [outDir]

import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://localhost:3100'
const OUT = process.argv[3] ?? 'artifacts/sred'

const VIEWPORTS = [
  { name: '320-iphone-se-1', width: 320, height: 568, mobile: true },
  { name: '375-iphone-se-3', width: 375, height: 667, mobile: true },
  { name: '390-iphone-14', width: 390, height: 844, mobile: true },
  { name: '430-iphone-15-pro-max', width: 430, height: 932, mobile: true },
  { name: '768-tablet', width: 768, height: 1024, mobile: false },
  { name: '1440-desktop', width: 1440, height: 900, mobile: false },
]

const results = []
let failures = 0

function record(viewport, check, ok, detail = '') {
  results.push({ viewport, check, ok, detail })
  if (!ok) failures++
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${viewport.padEnd(24)} ${check}${detail ? ` — ${detail}` : ''}`)
}

async function noOverflow(page, viewport, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return { scrollW: doc.scrollWidth, clientW: doc.clientWidth }
  })
  // One pixel of slack for sub-pixel layout rounding.
  record(
    viewport,
    `no horizontal overflow (${label})`,
    overflow.scrollW <= overflow.clientW + 1,
    `scrollWidth ${overflow.scrollW} vs clientWidth ${overflow.clientW}`
  )
}

async function inputsAreBigEnough(page, viewport) {
  const bad = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('input, select, textarea')) {
      const style = getComputedStyle(el)
      if (style.display === 'none' || el.closest('[aria-hidden="true"]')) continue
      // iOS only zooms on text entry. Checkboxes and radios are sized by their
      // own box, not by font-size.
      if (el.type === 'checkbox' || el.type === 'radio') continue
      const size = parseFloat(style.fontSize)
      if (size < 16) out.push(`${el.id || el.tagName}:${size}px`)
    }
    return out
  })
  record(
    viewport,
    'inputs at 16px or larger (no iOS zoom)',
    bad.length === 0,
    bad.length ? bad.join(', ') : ''
  )
}

async function tapTargetsAreBigEnough(page, viewport) {
  const bad = await page.evaluate(() => {
    const out = []
    // Scoped to the page's own content: the shared site header and footer are
    // not part of this build and are reported separately.
    const root = document.querySelector('main') ?? document
    for (const el of root.querySelectorAll(
      'button, a[href], [role="radio"], [role="checkbox"]'
    )) {
      if (el.closest('footer') || el.closest('header')) continue
      if (el.closest('[aria-hidden="true"]')) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (r.height < 40) out.push(`${(el.textContent || el.tagName).trim().slice(0, 28)}:${Math.round(r.height)}px`)
    }
    return out
  })
  record(
    viewport,
    'tap targets at least 40px tall',
    bad.length === 0,
    bad.length ? bad.slice(0, 4).join(', ') : ''
  )
}

async function fillAssessor(page, viewport, shot) {
  // Step 1 — company
  await page.getByRole('button', { name: /start my free estimate/i }).click()
  await page.getByLabel('Company name').fill('Northfield Systems Inc.')
  await page.getByRole('radio', { name: /Canadian-controlled private corporation/ }).click()
  await page.getByLabel(/Province where the work was done/i).selectOption('AB')
  await shot('02-step1-company')
  await noOverflow(page, viewport, 'step 1')
  await inputsAreBigEnough(page, viewport)
  await tapTargetsAreBigEnough(page, viewport)
  await page.getByRole('button', { name: /^Continue$/ }).click()

  // Step 2 — the claim
  await page.getByRole('radio', { name: /Filed and assessed/ }).click()
  await page.getByLabel(/Fiscal year end/i).fill('2025-06-30')
  await page.getByLabel(/Expected net SR&ED cash/i).fill('200000')
  await shot('03-step2-claim')
  await noOverflow(page, viewport, 'step 2')
  await page.getByRole('button', { name: /^Continue$/ }).click()

  // Step 3 — technical work
  await page.getByRole('radio', { name: /Software or data systems/ }).click()
  await page
    .getByLabel(/What technical problem/i)
    .fill(
      'We could not hold p99 latency under 40ms while re-sharding a live cluster, and no published approach covered our write pattern.'
    )
  await page
    .getByRole('group', { name: /standard practice could not solve/i })
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await page
    .getByRole('group', { name: /planned sequence of experiments/i })
    .getByRole('radio', { name: 'Yes', exact: true })
    .click()
  await shot('04-step3-work')
  await noOverflow(page, viewport, 'step 3')
  await page.getByRole('button', { name: /^Continue$/ }).click()

  // Step 4 — money
  await page.getByLabel(/Technical salaries and wages/i).fill('600000')
  await page.getByLabel(/Canadian contractors/i).fill('100000')
  await page.getByLabel(/Materials consumed/i).fill('0')
  await page.getByLabel(/Government grants/i).fill('0')
  await page.getByRole('radio', { name: /75% to 100%/ }).click()
  await shot('05-step4-money')
  await noOverflow(page, viewport, 'step 4')
  await page.getByRole('button', { name: /^Continue$/ }).click()

  // Step 5 — records and history
  for (const label of [
    /Payroll records for the technical staff/,
    /Project or engineering records/,
    /Time allocation across projects/,
    /Contractor agreements and invoices/,
  ]) {
    await page.getByRole('checkbox', { name: label }).click()
  }
  await page.getByRole('radio', { name: /Two or more accepted claims/ }).click()
  await page
    .getByRole('group', { name: /pre-claim approval/i })
    .getByRole('radio', { name: 'No', exact: true })
    .click()
  await page.getByRole('radio', { name: /Cash now, if execom buys/ }).click()
  await shot('06-step5-records')
  await noOverflow(page, viewport, 'step 5')
  await page.getByRole('button', { name: /See my estimate/i }).click()

  // Step 6 — conditional underwriting screen
  await page.getByRole('heading', { name: /Three questions about collectability/i }).waitFor()
  record(viewport, 'underwriting screen appears for a purchase candidate', true)
  await page
    .getByRole('group', { name: /unresolved CRA balances/i })
    .getByRole('radio', { name: /No, the account is clear/ })
    .click()
  await page
    .getByRole('group', { name: /already assigned, pledged or financed/i })
    .getByRole('radio', { name: /^No$/ })
    .click()
  await page.getByRole('radio', { name: /Within about 30 days/ }).click()
  await shot('07-step6-underwriting')
  await noOverflow(page, viewport, 'step 6')
  await page.getByRole('button', { name: /See my estimate/i }).click()

  // Result — must appear BEFORE any contact field exists on the page.
  await page.getByRole('heading', { name: /Your preliminary result/i }).waitFor()
  const contactVisibleAtResult = await page
    .getByLabel('Business email')
    .isVisible()
    .catch(() => false)
  record(
    viewport,
    'result is shown before contact capture',
    contactVisibleAtResult === false,
    contactVisibleAtResult ? 'email field visible on the result screen' : ''
  )

  const laneHeading = await page
    .getByRole('heading', { name: /worth a purchase review/i })
    .isVisible()
    .catch(() => false)
  record(viewport, 'purchase-review lane rendered', laneHeading === true)

  await shot('08-result')
  await noOverflow(page, viewport, 'result')
  await tapTargetsAreBigEnough(page, viewport)

  // Contact step
  await page.getByRole('button', { name: /Request my review/i }).click()
  await page.getByRole('heading', { name: /Where should we send your review/i }).waitFor()

  const marketingChecked = await page
    .getByRole('checkbox', { name: /occasional execom updates/i })
    .isChecked()
  record(viewport, 'marketing consent unchecked by default', marketingChecked === false)

  const serviceChecked = await page
    .getByRole('checkbox', { name: /asking execom to contact me/i })
    .isChecked()
  record(viewport, 'service consent unchecked by default', serviceChecked === false)

  await shot('09-contact')
  await noOverflow(page, viewport, 'contact')
  await inputsAreBigEnough(page, viewport)
}

async function run() {
  await mkdir(OUT, { recursive: true })
  // The sandbox ships a pinned Chromium; use it rather than downloading one.
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] })

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      userAgent: vp.mobile ? devices['iPhone 13'].userAgent : undefined,
    })
    const page = await context.newPage()

    const consoleErrors = []
    const badResponses = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })
    page.on('pageerror', (e) => consoleErrors.push(String(e)))
    page.on('response', (r) => {
      if (r.status() >= 400) badResponses.push(`${r.status()} ${new URL(r.url()).pathname}`)
    })

    const shot = async (name) => {
      // Each phase change smooth-scrolls the card to the top of the viewport;
      // let that settle so the artifact shows what a user actually sees.
      await page.waitForTimeout(700)
      return page.screenshot({ path: `${OUT}/${vp.name}-${name}.png`, fullPage: false })
    }

    await page.goto(`${BASE}/sred`, { waitUntil: 'domcontentloaded' })
    // Wait for hydration rather than for the network to go quiet: web fonts in
    // this sandbox never settle, and the assessor is what we actually need.
    await page.getByRole('button', { name: /start my free estimate/i }).waitFor({ timeout: 20000 })
    await shot('01-landing')
    await noOverflow(page, vp.name, 'landing')

    // The first assessor question has to be reachable without a long scroll.
    const firstField = await page.evaluate(() => {
      const el = document.querySelector('#assessor input')
      if (!el) return null
      return Math.round(el.getBoundingClientRect().top + window.scrollY)
    })
    record(
      vp.name,
      'first assessor input within one short scroll',
      firstField !== null && firstField < vp.height * 2,
      `field top at ${firstField}px, viewport ${vp.height}px`
    )

    await fillAssessor(page, vp.name, shot)

    // A /portal request needs Supabase credentials the middleware reads at
    // request time. In an environment without .env.local those 500, which is an
    // environment fact about the whole site, not a defect in this page.
    const portalOnly = badResponses.filter((r) => r.includes('/portal'))
    const ownFailures = badResponses.filter((r) => !r.includes('/portal'))
    record(
      vp.name,
      'no failed requests from /sred itself',
      ownFailures.length === 0,
      ownFailures.slice(0, 3).join(' | ')
    )
    if (portalOnly.length) {
      console.log(
        `[note] ${vp.name.padEnd(24)} ${portalOnly.length} /portal request(s) failed — Supabase env not set in this environment`
      )
    }
    const ownConsoleErrors = consoleErrors.filter(
      (e) => !/portal|Supabase/i.test(e) && !/status of 500/.test(e)
    )
    record(
      vp.name,
      'no console errors',
      ownConsoleErrors.length === 0,
      ownConsoleErrors.slice(0, 2).join(' | ')
    )

    await context.close()
  }

  // ?start=1 deep link, checked once.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const page = await context.newPage()
  await page.goto(
    `${BASE}/sred?start=1&utm_source=linkedin&utm_medium=paid_social&utm_campaign=sred_pilot`,
    { waitUntil: 'domcontentloaded' }
  )
  await page
    .getByRole('heading', { name: /^Your company$/ })
    .waitFor({ timeout: 20000 })
    .catch(() => {})
  const onStep1 = await page
    .getByRole('heading', { name: /^Your company$/ })
    .isVisible()
    .catch(() => false)
  record('390-deeplink', '?start=1 opens question one directly', onStep1)

  const attribution = await page.evaluate(() =>
    JSON.parse(window.sessionStorage.getItem('sred.attribution.v1') ?? '{}')
  )
  record(
    '390-deeplink',
    'campaign attribution captured first-party',
    attribution.utm_source === 'linkedin' && attribution.utm_campaign === 'sred_pilot',
    JSON.stringify(attribution)
  )

  const dataLayer = await page.evaluate(() => window.dataLayer ?? [])
  const landing = dataLayer.find((e) => e.event === 'sred_landing_view')
  record('390-deeplink', 'landing event emitted with campaign only', !!landing)
  record(
    '390-deeplink',
    'analytics payload carries no business data',
    landing && !JSON.stringify(landing).match(/salary|refund|estimate|email|company_name/i),
    JSON.stringify(landing)
  )

  await page.screenshot({ path: `${OUT}/390-deeplink-start.png` })
  await context.close()
  await browser.close()

  console.log(`\n${results.length - failures}/${results.length} checks passed`)
  if (failures > 0) {
    console.log(`${failures} FAILED`)
    process.exit(1)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
