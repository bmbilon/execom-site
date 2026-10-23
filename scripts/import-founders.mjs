// Import only the existing public frontend. Private data and server code stay on Sites.
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { foundersOrigin, foundersPages, foundersPrivateOrigin, foundersPrivatePages } from '../lib/site/founders-routes.mjs'

const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/import-founders.mjs /path/to/founders-home')
const sourceRoot = resolve(source)
execFileSync(process.execPath, ['scripts/build-vercel.mjs'], { cwd: sourceRoot, stdio: 'inherit' })
const sourceBuild = join(sourceRoot, 'dist/vercel')
const output = fileURLToPath(new URL('../public/founders/', import.meta.url))
const assetPrefix = '/founders/assets'
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function namespaceAssets(text) {
  return text
    .replace(/(["'`(])\/(brand|fonts|img)\//g, `$1${assetPrefix}/$2/`)
    .replace(/(["'`(])\/(app\.js|local-services\.js|brand\.css|style\.css|people\.css|local-services\.css)(?=["'`)])/g, `$1${assetPrefix}/$2`)
}

const appSource = await readFile(join(sourceBuild, 'app.js'), 'utf8')
for (const page of foundersPrivatePages) {
  if (!appSource.includes(`'/founders/${page}'`)) throw new Error(`Missing private redirect: ${page}`)
}
if (!appSource.includes(`location.assign(${JSON.stringify(foundersPrivateOrigin)}+p+location.search)`)) {
  throw new Error('The public export must keep authenticated routes on the private host')
}
const titleMarker = 'const anchor=document.getElementById(location.hash.slice(1));'
if (!appSource.includes(titleMarker)) throw new Error('Review the upstream router before updating the export')

await rm(output, { recursive: true, force: true })
await mkdir(join(output, 'assets'), { recursive: true })
await mkdir(join(output, 'pages'), { recursive: true })
let assetCount = 0
async function copyAssets(directory, relative = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(relative, entry.name)
    if (entry.isDirectory()) { await copyAssets(join(directory, entry.name), path); continue }
    if (path === 'index.html') continue
    const destination = join(output, 'assets', path)
    await mkdir(resolve(destination, '..'), { recursive: true })
    if (['.js', '.css', '.html', '.svg'].includes(extname(path))) {
      let text = await readFile(join(directory, entry.name), 'utf8')
      if (path === 'app.js') {
        text = text.replace(titleMarker, `const publicPage=${JSON.stringify(foundersPages)}.find(page=>page.path===p);if(publicPage){document.title=publicPage.title;document.querySelector('link[rel="canonical"]').href=${JSON.stringify(foundersOrigin)}+p;document.querySelector('meta[name="robots"]').content=publicPage.noindex?'noindex, follow':'index, follow';}${titleMarker}`)
      }
      await writeFile(destination, namespaceAssets(text))
    } else await cp(join(directory, entry.name), destination)
    assetCount++
  }
}
await copyAssets(sourceBuild)
const template = namespaceAssets(await readFile(join(sourceBuild, 'index.html'), 'utf8'))
for (const page of foundersPages) {
  const html = template.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace('</head>', `<link rel="canonical" href="${foundersOrigin}${page.path}"><meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow'}"></head>`)
  await writeFile(join(output, 'pages', `${page.file}.html`), html)
}
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim()
await writeFile(new URL('../docs/founders-source.json', import.meta.url), JSON.stringify({ sourceCommit, assetCount, pages: foundersPages.map(page => page.path) }, null, 2) + '\n')
console.log(`Imported ${assetCount} public assets and ${foundersPages.length} pages from ${sourceCommit}`)
