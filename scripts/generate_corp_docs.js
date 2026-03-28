#!/usr/bin/env node
/**
 * Corporate Document Generator
 *
 * Generates incorporation package documents from an approved Supabase snapshot.
 * Produces the same documents as templates 01–03, populated with real data:
 *   - 01: Name Clearance and Incorporation Package
 *   - 02: Initial Organizational Resolutions
 *   - 03: Founder Share Subscription Agreement
 *
 * Usage:
 *   node generate_corp_docs.js --snapshot <snapshot_id> [--output <dir>] [--register]
 *   node generate_corp_docs.js --json <data.json> [--output <dir>]
 *
 * Requires:
 *   npm install docx @supabase/supabase-js
 *   SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables (for --snapshot)
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
} = require('docx')

// ─── CLI args ─────────────────────────────────────────────────

const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(name)
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null
}
const snapshotId = getArg('--snapshot')
const jsonFile = getArg('--json')
const outputDir = getArg('--output') || '.'
const doRegister = args.includes('--register')

if (!snapshotId && !jsonFile) {
  console.error('Usage: node generate_corp_docs.js --snapshot <id> | --json <file>')
  process.exit(1)
}

// ─── Shared styles ────────────────────────────────────────────

const PAGE = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
}

const STYLES = {
  default: { document: { run: { font: 'Arial', size: 22 } } },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 32, bold: true, font: 'Arial' },
      paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 26, bold: true, font: 'Arial' },
      paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
  ],
}

const NUMBERING = {
  config: [
    { reference: 'numbers', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
    { reference: 'alpha', levels: [
      { level: 0, format: LevelFormat.LOWER_LETTER, text: '(%1)', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
    ]},
  ],
}

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 }

function makeHeader(title, corpName) {
  return new Header({
    children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },
      spacing: { after: 120 },
      children: [new TextRun({ text: title, font: 'Arial', size: 18, color: '666666' })],
    })],
  })
}

function makeFooter(corpName) {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [
        new TextRun({ text: `CONFIDENTIAL \u2014 ${corpName} \u2014 Page `, size: 16, color: '999999' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '999999' }),
      ],
    })],
  })
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0 },
    heading: opts.heading,
    alignment: opts.align,
    numbering: opts.numbering,
    children: [new TextRun({
      text, bold: opts.bold, italics: opts.italics, size: opts.size,
      font: opts.font || 'Arial', color: opts.color,
    })],
  })
}

function tableRow(cells) {
  return new TableRow({
    children: cells.map(([text, opts = {}]) => new TableCell({
      borders,
      margins: cellMargins,
      width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
      shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
      children: [new Paragraph({
        children: [new TextRun({ text, bold: opts.bold, size: opts.size || 22, font: 'Arial' })],
      })],
    })),
  })
}

// ─── Document builders ────────────────────────────────────────

function buildDoc01(d) {
  const corpName = `${d.proposed_name} ${d.legal_element}`
  const today = new Date().toISOString().split('T')[0]
  const agent = d.agent || {}
  const dirs = d.directors || []
  const dec = d.declarant || {}

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('01 \u2014 Name Clearance and Incorporation Package', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('NAME CLEARANCE AND INCORPORATION PACKAGE', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p(corpName, { heading: HeadingLevel.HEADING_2, align: AlignmentType.CENTER, color: '2E75B6' }),
        p(`Prepared: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),
        p('1. CORPORATE SUMMARY', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Proposed Name', { bold: true, width: 3600, shading: 'F2F2F2' }], [corpName, {}]]),
          tableRow([['Alternate Name 1', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.alt_name_1 || 'N/A', {}]]),
          tableRow([['Alternate Name 2', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.alt_name_2 || 'N/A', {}]]),
          tableRow([['Jurisdiction', { bold: true, width: 3600, shading: 'F2F2F2' }], ['Alberta (ABCA)', {}]]),
          tableRow([['Fiscal Year End', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.fiscal_year_end || 'December 31', {}]]),
        ]}),
        p(''),
        p('2. REGISTERED OFFICE', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Street', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.reg_street, {}]]),
          tableRow([['City', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.reg_city, {}]]),
          tableRow([['Province', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.reg_province || 'Alberta', {}]]),
          tableRow([['Postal Code', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.reg_postal_code, {}]]),
        ]}),
        p(''),
        p('3. AGENT FOR SERVICE', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Name', { bold: true, width: 3600, shading: 'F2F2F2' }], [`${agent.first_name || ''} ${agent.last_name || ''}`.trim(), {}]]),
          tableRow([['Firm', { bold: true, width: 3600, shading: 'F2F2F2' }], [agent.firm || 'N/A', {}]]),
          tableRow([['Address', { bold: true, width: 3600, shading: 'F2F2F2' }], [`${agent.street}, ${agent.city}, ${agent.province} ${agent.postal_code}`, {}]]),
          tableRow([['Email', { bold: true, width: 3600, shading: 'F2F2F2' }], [agent.email || '', {}]]),
        ]}),
        p(''),
        p('4. DIRECTORS', { heading: HeadingLevel.HEADING_2 }),
        p(`Structure: ${d.director_structure === 'fixed' ? `Fixed (${d.director_fixed_number})` : `Range (${d.director_min}\u2013${d.director_max})`}`),
        ...dirs.flatMap((dir, i) => [
          p(`Director ${i + 1}: ${dir.first_name} ${dir.middle_name || ''} ${dir.last_name}`.trim(), { bold: true }),
          p(`Address: ${dir.street}, ${dir.city}, ${dir.province} ${dir.postal_code}`),
        ]),
        p(''),
        p('5. ARTICLES OF INCORPORATION', { heading: HeadingLevel.HEADING_2 }),
        p(`Choice: ${d.articles_choice === 'default' ? 'Standard default articles (registry agent)' : d.articles_choice === 'provided_own' ? 'Client providing own articles' : 'Custom articles (specified below)'}`),
        ...(d.articles_choice === 'custom' && d.custom_articles ? [
          p(`Share Classes: ${d.custom_articles.share_classes || 'Not specified'}`),
          d.custom_articles.transfer_restrictions ? p(`Transfer Restrictions: ${d.custom_articles.transfer_restrictions}`) : p(''),
          d.custom_articles.business_restrictions ? p(`Business Restrictions: ${d.custom_articles.business_restrictions}`) : p(''),
        ] : []),
        p(''),
        p('6. CONTACT / DECLARANT', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Name', { bold: true, width: 3600, shading: 'F2F2F2' }], [dec.full_name || '', {}]]),
          tableRow([['Phone', { bold: true, width: 3600, shading: 'F2F2F2' }], [dec.phone || '', {}]]),
          tableRow([['Email', { bold: true, width: 3600, shading: 'F2F2F2' }], [dec.email || '', {}]]),
          tableRow([['ID Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [dec.id_type || '', {}]]),
        ]}),
      ],
    }],
  })
}

function buildDoc02(d) {
  const corpName = `${d.proposed_name} ${d.legal_element}`
  const today = new Date().toISOString().split('T')[0]
  const dirs = d.directors || []
  const shareClass = d.articles_choice === 'custom' && d.custom_articles?.share_classes
    ? d.custom_articles.share_classes
    : 'Class A Common Shares'

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('02 \u2014 Initial Organizational Resolutions', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('INITIAL ORGANIZATIONAL RESOLUTIONS', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p(`OF THE SOLE DIRECTOR${dirs.length > 1 ? 'S' : ''} OF`, { align: AlignmentType.CENTER, bold: true }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`(the "Corporation")`, { align: AlignmentType.CENTER, italics: true }),
        p(`Effective Date: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),
        p(`The undersigned, being ${dirs.length > 1 ? 'all of the directors' : 'the sole director'} of the Corporation, hereby ${dirs.length > 1 ? 'consent' : 'consents'} to and ${dirs.length > 1 ? 'adopt' : 'adopts'} the following resolutions:`),
        p(''),
        p('1. ORGANIZATION', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the Corporation has been duly incorporated under the Business Corporations Act (Alberta) and that the articles of incorporation are hereby confirmed and ratified.`),
        p(''),
        p('2. FISCAL YEAR', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the fiscal year of the Corporation shall end on ${d.fiscal_year_end || 'December 31'} of each year.`),
        p(''),
        p('3. REGISTERED OFFICE', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the registered office of the Corporation shall be located at:`),
        p(`${d.reg_street}, ${d.reg_city}, ${d.reg_province || 'Alberta'} ${d.reg_postal_code}`, { bold: true }),
        p(''),
        p('4. BANKING', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the Corporation is authorized to open bank accounts at a Canadian chartered bank as determined by the directors, and that any director is authorized as a signing officer on such accounts.`),
        p(''),
        p('5. INITIAL SHARE ISSUANCE', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the Corporation is authorized to issue shares of ${shareClass} to the founder(s) upon receipt of valid consideration, as set out in the Founder Share Subscription Agreement.`),
        p(''),
        p('6. GENERAL AUTHORITY', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that any director or officer of the Corporation is authorized to execute and deliver all documents and take all actions necessary or desirable to give effect to the foregoing resolutions.`),
        p(''),
        p(''),
        ...dirs.flatMap((dir, i) => [
          p('_________________________________________'),
          p(`${dir.first_name} ${dir.last_name}, Director`, { bold: true }),
          p(`Date: ${today}`),
          p(''),
        ]),
      ],
    }],
  })
}

function buildDoc03(d) {
  const corpName = `${d.proposed_name} ${d.legal_element}`
  const today = new Date().toISOString().split('T')[0]
  const dec = d.declarant || {}
  const shareClass = d.articles_choice === 'custom' && d.custom_articles?.share_classes
    ? d.custom_articles.share_classes.split('\n')[0] // first line as class name
    : 'Class A Common Shares'

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('03 \u2014 Founder Share Subscription Agreement', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('FOUNDER SHARE SUBSCRIPTION AGREEMENT', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`Effective Date: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),
        p('1. PARTIES', { heading: HeadingLevel.HEADING_2 }),
        p(`This Founder Share Subscription Agreement (this "Agreement") is entered into between:`),
        p(`(a) ${corpName} (the "Corporation"), an Alberta corporation; and`, { numbering: { reference: 'alpha', level: 0 } }),
        p(`(b) ${dec.full_name || '[Founder Name]'} (the "Subscriber").`, { numbering: { reference: 'alpha', level: 0 } }),
        p(''),
        p('2. SUBSCRIPTION', { heading: HeadingLevel.HEADING_2 }),
        p(`The Subscriber hereby irrevocably subscribes for and agrees to purchase from the Corporation 100 shares of ${shareClass} (the "Shares") at a price of $0.01 per share, for a total subscription price of $1.00 (the "Subscription Price").`),
        p(''),
        p('3. PAYMENT', { heading: HeadingLevel.HEADING_2 }),
        p(`The Subscription Price shall be paid in full upon execution of this Agreement by way of cash, cheque, or wire transfer payable to the Corporation.`),
        p(''),
        p('4. REPRESENTATIONS AND WARRANTIES', { heading: HeadingLevel.HEADING_2 }),
        p(`The Subscriber represents and warrants that:`),
        p(`The Subscriber is resident in the Province of Alberta and is subscribing for the Shares as principal.`, { numbering: { reference: 'alpha', level: 0 } }),
        p(`The Subscriber has been afforded the opportunity to ask questions of the Corporation regarding this investment.`, { numbering: { reference: 'alpha', level: 0 } }),
        p(`The Shares are being acquired for investment purposes and not with a view to distribution.`, { numbering: { reference: 'alpha', level: 0 } }),
        p(''),
        p('5. RESTRICTIVE LEGEND', { heading: HeadingLevel.HEADING_2 }),
        p(`The certificates representing the Shares, if any, shall bear a legend indicating that the Shares have not been registered under any securities legislation and are subject to restrictions on transfer.`),
        p(''),
        p('6. GOVERNING LAW', { heading: HeadingLevel.HEADING_2 }),
        p(`This Agreement shall be governed by and construed in accordance with the laws of the Province of Alberta and the federal laws of Canada applicable therein.`),
        p(''),
        p(''),
        p('THE CORPORATION:', { bold: true }),
        p(corpName),
        p(''),
        p('_________________________________________'),
        p('Authorized Signing Officer'),
        p(`Date: ${today}`),
        p(''),
        p(''),
        p('THE SUBSCRIBER:', { bold: true }),
        p(''),
        p('_________________________________________'),
        p(`${dec.full_name || '[Founder Name]'}`, { bold: true }),
        p(`Email: ${dec.email || ''}`),
        p(`Phone: ${dec.phone || ''}`),
        p(`Date: ${today}`),
      ],
    }],
  })
}

// ─── Data loading ─────────────────────────────────────────────

async function loadFromSnapshot(sid) {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) { console.error('ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY'); process.exit(1) }

  const sb = createClient(url, key)
  const { data: snap, error } = await sb.from('approved_snapshots').select('*').eq('id', sid).single()
  if (error || !snap) { console.error(`ERROR: Snapshot ${sid} not found`); process.exit(1) }

  // Verify hash (recursive key sort to match Python json.dumps(sort_keys=True))
  if (snap.payload_hash) {
    function sortKeysDeep(obj) {
      if (obj === null || obj === undefined) return obj
      if (Array.isArray(obj)) return obj.map(sortKeysDeep)
      if (typeof obj === 'object') {
        const sorted = {}
        for (const k of Object.keys(obj).sort()) sorted[k] = sortKeysDeep(obj[k])
        return sorted
      }
      return obj
    }
    const json = JSON.stringify(sortKeysDeep(snap.payload))
    const computed = crypto.createHash('sha256').update(json).digest('hex')
    if (computed !== snap.payload_hash) {
      console.error('ERROR: Snapshot payload hash mismatch!')
      process.exit(1)
    }
    console.log(`Snapshot integrity verified (hash: ${snap.payload_hash.slice(0, 12)}...)`)
  }

  return { data: snap.payload, meta: snap }
}

async function loadFromJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return { data, meta: { id: 'local-dev', version: 0, intake_id: 'local', matter_id: 'local' } }
}

async function registerArtifacts(meta, filePaths) {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  const sb = createClient(url, key)
  const generatedBy = meta.approved_by || '00000000-0000-0000-0000-000000000000'

  for (const { path: fp, type } of filePaths) {
    // Get next version
    const { data: existing } = await sb.from('generated_artifacts').select('version')
      .eq('snapshot_id', meta.id).eq('artifact_type', type)
      .order('version', { ascending: false }).limit(1)
    const nextVersion = existing?.length > 0 ? existing[0].version + 1 : 1

    // Supersede previous
    await sb.from('generated_artifacts').update({ status: 'superseded' })
      .eq('intake_id', meta.intake_id).eq('artifact_type', type).eq('status', 'generated')

    // Insert
    const { data: artifact } = await sb.from('generated_artifacts').insert({
      matter_id: meta.matter_id,
      intake_id: meta.intake_id,
      snapshot_id: meta.id,
      artifact_type: type,
      version: nextVersion,
      file_path: fp,
      snapshot_hash: meta.payload_hash || null,
      generated_by: generatedBy,
      status: 'generated',
    }).select('id').single()

    console.log(`Registered ${type} v${nextVersion} (${artifact?.id})`)
  }

  // Log audit event
  await sb.from('matter_status_events').insert({
    matter_id: meta.matter_id,
    intake_id: meta.intake_id,
    from_status: 'approved_for_generation',
    to_status: 'generated',
    changed_by: generatedBy,
    note: `Corp docs generated (01/02/03) from snapshot v${meta.version}`,
  })
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const { data, meta } = snapshotId
    ? await loadFromSnapshot(snapshotId)
    : await loadFromJson(jsonFile)

  const corpName = `${data.proposed_name || 'unnamed'}_${data.legal_element || 'Ltd'}`.replace(/\s/g, '_').replace(/\./g, '')
  fs.mkdirSync(outputDir, { recursive: true })

  const docs = [
    { builder: buildDoc01, name: `01_Incorporation_Package_${corpName}.docx`, type: 'incorporation_package_docx' },
    { builder: buildDoc02, name: `02_Organizational_Resolutions_${corpName}.docx`, type: 'organizational_resolutions_docx' },
    { builder: buildDoc03, name: `03_Founder_Subscription_${corpName}.docx`, type: 'founder_subscription_docx' },
  ]

  const generated = []
  for (const { builder, name, type } of docs) {
    const doc = builder(data)
    const buf = await Packer.toBuffer(doc)
    const outPath = path.join(outputDir, name)
    fs.writeFileSync(outPath, buf)
    console.log(`Generated: ${outPath}`)
    generated.push({ path: outPath, type })
  }

  if (doRegister && meta.id && meta.id !== 'local-dev') {
    await registerArtifacts(meta, generated)
    console.log('All artifacts registered.')
  } else if (doRegister) {
    console.log('Skipping registration (local/dev mode)')
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message || err)
  process.exit(1)
})
