import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { extname, join, relative as relativePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { foundersOrigin, foundersPages, foundersPrivateOrigin, foundersPrivatePages } from '../lib/site/founders-routes.mjs'

const origin = process.argv[2]
if (!origin) throw new Error('Usage: node scripts/verify-founders.mjs https://origin-to-test')
async function request(path) {
  return fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(30000) })
}
for (const page of foundersPages) {
  const response = await request(page.path)
  assert.equal(response.status, 200, page.path)
  assert.match(response.headers.get('content-type'), /text\/html/)
  const html = await response.text()
  assert.ok(html.includes(`href="${foundersOrigin}${page.path}"`), `Canonical: ${page.path}`)
  assert.ok(html.includes('/founders/assets/app.js'), `Script: ${page.path}`)
}
const assets = await readdir(new URL('../public/founders/assets/', import.meta.url), { recursive: true, withFileTypes: true })
const assetRoot = fileURLToPath(new URL('../public/founders/assets/', import.meta.url))
const types = { '.js': /(?:javascript|ecmascript)/, '.css': /text\/css/, '.png': /image\/png/, '.jpg': /image\/jpeg/, '.webp': /image\/webp/, '.svg': /image\/svg/, '.woff2': /(?:font\/woff2|application\/(?:font-woff|octet-stream))/ }
let assetCount = 0
for (const asset of assets.filter(entry => entry.isFile())) {
  const relative = relativePath(assetRoot, join(asset.parentPath, asset.name)).split('\\').join('/')
  const response = await request(`/founders/assets/${relative}`)
  assert.equal(response.status, 200, relative)
  assert.match(response.headers.get('content-type'), types[extname(relative)], relative)
  await response.arrayBuffer()
  assetCount++
}
const query = '?chair=backer&number=3200&invite=routing-test&plain=a%20b&utm_source=google&utm_campaign=business_profile'
for (const page of foundersPrivatePages) {
  const response = await request(`/founders/${page}${query}`)
  assert.equal(response.status, 307, `Private handoff: ${page}`)
  const destination = new URL(response.headers.get('location'))
  assert.equal(destination.origin + destination.pathname, `${foundersPrivateOrigin}/founders/${page}`)
  assert.deepEqual([...destination.searchParams], [...new URLSearchParams(query)])
}
assert.equal((await request('/founders/not-a-real-page')).status, 404)
assert.equal((await request('/founders/assets/missing-image.webp')).status, 404)
for (const path of ['/', '/contact', '/fanbrush']) assert.equal((await request(path)).status, 200, path)
const trailingSlash = await request('/founders/')
assert.equal(trailingSlash.status, 308)
assert.equal(new URL(trailingSlash.headers.get('location'), origin).pathname, '/founders')
console.log(`PASS ${origin}: ${foundersPages.length} public pages, ${assetCount} assets, 4 private redirects with query preservation, 2 real 404s, trailing slash, home, contact and fanbrush`)
