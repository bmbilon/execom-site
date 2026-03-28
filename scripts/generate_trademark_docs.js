#!/usr/bin/env node
/**
 * Trademark Document Generator
 *
 * Generates internal trademark documents from an approved Supabase snapshot.
 * Produces the following documents:
 *   - 01: Trademark Clearance Report
 *   - 02: Trademark Application Filing Record
 *   - 03: Filing Summary — Canada (if Canada or Both)
 *   - 04: Filing Summary — United States (if US or Both)
 *   - 05: Goods & Services Schedule
 *   - 06: Owner Information Sheet
 *
 * Usage:
 *   node generate_trademark_docs.js --snapshot <snapshot_id> [--output <dir>] [--register]
 *   node generate_trademark_docs.js --json <data.json> [--output <dir>]
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
  console.error('Usage: node generate_trademark_docs.js --snapshot <id> | --json <file>')
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

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 }

function makeHeader(title, markName) {
  return new Header({
    children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2E75B6', space: 1 } },
      spacing: { after: 120 },
      children: [new TextRun({ text: title, font: 'Arial', size: 18, color: '666666' })],
    })],
  })
}

function makeFooter(markName) {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 1 } },
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [
        new TextRun({ text: `CONFIDENTIAL \u2014 ${markName} \u2014 Page `, size: 16, color: '999999' }),
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
        children: [new TextRun({ text: String(text || ''), bold: opts.bold, size: opts.size || 22, font: 'Arial' })],
      })],
    })),
  })
}

function infoTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: rows.map(([label, value]) =>
      tableRow([
        [label, { bold: true, width: 3000, shading: 'F5F5F5' }],
        [value || '—', { width: 6360 }],
      ])
    ),
  })
}

// ─── Helpers ──────────────────────────────────────────────────

const MARK_TYPE_LABELS = {
  word: 'Word Mark',
  design: 'Design Mark',
  slogan: 'Slogan / Tagline',
  combined: 'Combined (Word + Design)',
  sound: 'Sound Mark',
  other: 'Other',
}

function parseGoodsServices(d) {
  if (Array.isArray(d.goods_services_items) && d.goods_services_items.length > 0) {
    return d.goods_services_items
  }
  if (typeof d.goods_services === 'string') {
    try { return JSON.parse(d.goods_services) } catch { return [] }
  }
  return []
}

function deriveFilingBasis(d) {
  const result = {}
  const j = d.jurisdiction || 'Canada'

  if (j === 'Canada' || j === 'Both') {
    if (d.priority_claim) result.ca = 'Priority'
    else if (d.already_in_use) result.ca = 'Use in Canada'
    else result.ca = 'Proposed Use'
  }

  if (j === 'United States' || j === 'Both') {
    if (d.already_in_use && d.first_use_commerce) result.us = 'Section 1(a) — Use in Commerce'
    else if (d.file_before_launch || !d.already_in_use) result.us = 'Section 1(b) — Intent to Use'
    else if (d.priority_claim) result.us = 'Section 44(d) — Foreign Priority'
    else result.us = 'Section 1(b) — Intent to Use'
  }

  return result
}

// ─── Document builders ────────────────────────────────────────

function buildClearanceReport(d) {
  const markName = d.mark_text || 'Untitled Mark'
  const items = parseGoodsServices(d)

  const children = [
    p(`Trademark Clearance Report`, { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(`Prepared: ${new Date().toLocaleDateString('en-CA')}`, { italics: true, color: '666666' }),
    p(''),

    p('1. Mark Summary', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Mark Text', markName],
      ['Mark Type', MARK_TYPE_LABELS[d.mark_type] || d.mark_type],
      ['Jurisdiction', d.jurisdiction || 'Canada'],
      ['Owner', d.owner_name],
    ]),
    p(''),

    p('2. Goods & Services', { heading: HeadingLevel.HEADING_2 }),
  ]

  if (items.length > 0) {
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        tableRow([
          ['#', { bold: true, shading: 'F5F5F5', width: 600 }],
          ['Description', { bold: true, shading: 'F5F5F5', width: 5000 }],
          ['Type', { bold: true, shading: 'F5F5F5', width: 1500 }],
          ['Nice Class', { bold: true, shading: 'F5F5F5', width: 1260 }],
        ]),
        ...items.map((item, i) =>
          tableRow([
            [String(i + 1), { width: 600 }],
            [item.description, { width: 5000 }],
            [item.category === 'goods' ? 'Goods' : 'Services', { width: 1500 }],
            [item.nice_class || 'TBD', { width: 1260 }],
          ])
        ),
      ],
    }))
  }

  children.push(
    p(''),
    p('3. Clearance Status', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Search Conducted', d.clearance_done ? 'Yes' : 'No'],
      ['Search Notes', d.clearance_notes || '—'],
      ['Known Competitors', d.known_competitors || '—'],
      ['Domain Available', d.domain_available || 'Unknown'],
      ['Social Handles Available', d.social_handles_available || 'Unknown'],
      ['Conflicts Found', d.conflicts_found ? 'YES — Review Required' : 'No known conflicts'],
    ]),
    p(''),
    p('4. Risk Assessment', { heading: HeadingLevel.HEADING_2 }),
    p(d.risk_notes || 'No additional risk notes provided.'),
    p(''),
    p('5. Recommendation', { heading: HeadingLevel.HEADING_2 }),
    p('[To be completed by examiner during review]', { italics: true, color: '999999' }),
  )

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Trademark Clearance Report', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

function buildFilingRecord(d) {
  const markName = d.mark_text || 'Untitled Mark'
  const basis = deriveFilingBasis(d)

  const children = [
    p('Trademark Application Filing Record', { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(`Date: ${new Date().toLocaleDateString('en-CA')}`, { italics: true, color: '666666' }),
    p(''),

    p('Application Details', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Mark Text', markName],
      ['Mark Type', MARK_TYPE_LABELS[d.mark_type] || d.mark_type],
      ['Design Description', d.mark_description || '—'],
      ['Jurisdiction', d.jurisdiction || 'Canada'],
    ]),
    p(''),

    p('Owner / Applicant', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Name', d.owner_name],
      ['Type', d.owner_type || 'Corporation'],
      ['Country', d.owner_country || 'Canada'],
      ['Address', d.owner_address || '—'],
      ['Corporation Number', d.owner_corp_number || '—'],
    ]),
    p(''),

    p('Filing Basis', { heading: HeadingLevel.HEADING_2 }),
  ]

  const basisRows = []
  if (basis.ca) basisRows.push(['Canada', basis.ca])
  if (basis.us) basisRows.push(['United States', basis.us])
  basisRows.push(['Already in Use', d.already_in_use ? 'Yes' : 'No'])
  if (d.already_in_use) {
    basisRows.push(['Use Territory', d.use_territory || '—'])
    basisRows.push(['First Use Date', d.first_use_date || '—'])
    if (d.first_use_commerce) basisRows.push(['First Use in Commerce (US)', d.first_use_commerce])
  }
  if (d.priority_claim) {
    basisRows.push(['Priority Country', d.priority_country || '—'])
    basisRows.push(['Priority Date', d.priority_date || '—'])
    basisRows.push(['Priority App #', d.priority_app_number || '—'])
  }
  children.push(infoTable(basisRows))

  children.push(
    p(''),
    p('Status Tracking', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Application Filed', '_______________'],
      ['Filing Number (CA)', '_______________'],
      ['Filing Number (US)', '_______________'],
      ['Examiner Assigned', '_______________'],
      ['Office Action Due', '_______________'],
      ['Registration Date', '_______________'],
    ]),
  )

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Filing Record', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

function buildFilingSummaryCA(d) {
  const markName = d.mark_text || 'Untitled Mark'
  const basis = deriveFilingBasis(d)
  const items = parseGoodsServices(d)

  // Group by Nice class
  const classes = {}
  for (const item of items) {
    const cls = item.nice_class || 'TBD'
    if (!classes[cls]) classes[cls] = []
    classes[cls].push(item)
  }
  const totalClasses = Object.keys(classes).length

  const children = [
    p('Internal Filing Summary — Canada (CIPO)', { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(''),

    p('Applicant', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Name', d.owner_name],
      ['Entity Type', d.owner_type || 'Corporation'],
      ['Country', d.owner_country || 'Canada'],
      ['Address', d.owner_address || '—'],
    ]),
    p(''),

    p('Mark', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Text', markName],
      ['Type', d.mark_type === 'word' || d.mark_type === 'slogan' ? 'Standard Character' : 'Design'],
      ['Description', d.mark_description || '—'],
    ]),
    p(''),

    p('Filing Basis', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Basis', basis.ca || 'Proposed Use'],
      ...(d.already_in_use ? [['Use in Canada Since', d.first_use_date || '—']] : []),
      ...(d.priority_claim ? [
        ['Priority Country', d.priority_country || '—'],
        ['Priority Date', d.priority_date || '—'],
        ['Priority App #', d.priority_app_number || '—'],
      ] : []),
    ]),
    p(''),

    p('Goods & Services by Class', { heading: HeadingLevel.HEADING_2 }),
  ]

  for (const [cls, classItems] of Object.entries(classes)) {
    children.push(p(`Class ${cls}`, { bold: true, size: 24 }))
    for (const item of classItems) {
      children.push(p(`\u2022 ${item.description} (${item.category})`))
    }
    children.push(p(''))
  }

  // Fee estimate
  const baseFee = 347.35
  const perClass = 105.26
  const addl = Math.max(0, totalClasses - 1)
  const total = (baseFee + addl * perClass).toFixed(2)

  children.push(
    p('Fee Estimate', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Total Classes', String(totalClasses)],
      ['Base Fee (1st class)', `$${baseFee.toFixed(2)} CAD`],
      ['Additional Classes', `${addl} × $${perClass.toFixed(2)} = $${(addl * perClass).toFixed(2)} CAD`],
      ['Estimated Total', `$${total} CAD`],
    ]),
  )

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('CIPO Filing Summary', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

function buildFilingSummaryUS(d) {
  const markName = d.mark_text || 'Untitled Mark'
  const basis = deriveFilingBasis(d)
  const items = parseGoodsServices(d)

  const classes = {}
  for (const item of items) {
    const cls = item.nice_class || 'TBD'
    if (!classes[cls]) classes[cls] = []
    classes[cls].push(item)
  }
  const totalClasses = Object.keys(classes).length

  // Determine filing basis code
  let basisCode = '1(b)'
  if (d.already_in_use && d.first_use_commerce) basisCode = '1(a)'
  else if (d.priority_claim) basisCode = '44(d)'

  const children = [
    p('Internal Filing Summary — United States (USPTO)', { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(''),

    p('Owner', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Name', d.owner_name],
      ['Entity Type', d.owner_type || 'Corporation'],
      ['Country of Incorporation', d.owner_country || 'Canada'],
      ['Address', d.owner_address || '—'],
    ]),
    p(''),

    p('Mark', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Text', markName],
      ['Type', d.mark_type === 'word' || d.mark_type === 'slogan' ? 'Standard Character' : 'Special Form'],
      ['Description', d.mark_description || '—'],
    ]),
    p(''),

    p('Filing Basis', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Basis', `${basisCode} — ${basis.us || 'Intent to Use'}`],
      ...(basisCode === '1(a)' ? [
        ['First Use Anywhere', d.first_use_date || '—'],
        ['First Use in Commerce', d.first_use_commerce || '—'],
        ['Specimen', 'To be provided'],
      ] : []),
      ...(basisCode === '44(d)' ? [
        ['Foreign Country', d.priority_country || '—'],
        ['Foreign Filing Date', d.priority_date || '—'],
        ['Foreign App #', d.priority_app_number || '—'],
      ] : []),
    ]),
    p(''),

    p('Identification of Goods/Services by Class', { heading: HeadingLevel.HEADING_2 }),
  ]

  for (const [cls, classItems] of Object.entries(classes)) {
    children.push(p(`Class ${cls}`, { bold: true, size: 24 }))
    for (const item of classItems) {
      children.push(p(`\u2022 ${item.description} (${item.category})`))
    }
    children.push(p(''))
  }

  // Fee estimate (TEAS Plus)
  const perClass = 250
  const total = perClass * totalClasses

  children.push(
    p('Fee Estimate (TEAS Plus)', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Form', 'TEAS Plus'],
      ['Total Classes', String(totalClasses)],
      ['Fee per Class', `$${perClass} USD`],
      ['Estimated Total', `$${total} USD`],
    ]),
    p(''),
    p('Note: TEAS Plus requires use of pre-approved ID descriptions from the ID Manual. '
      + 'If custom descriptions are needed, TEAS Standard ($350/class) applies.', { italics: true, size: 20, color: '666666' }),
  )

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('USPTO Filing Summary', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

function buildGoodsSchedule(d) {
  const markName = d.mark_text || 'Untitled Mark'
  const items = parseGoodsServices(d)

  const children = [
    p('Goods & Services Schedule', { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(''),
  ]

  if (items.length > 0) {
    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        tableRow([
          ['#', { bold: true, shading: '2E75B6', width: 500 }],
          ['Description', { bold: true, shading: '2E75B6', width: 4800 }],
          ['Category', { bold: true, shading: '2E75B6', width: 1300 }],
          ['Nice Class', { bold: true, shading: '2E75B6', width: 1200 }],
          ['CA Filing', { bold: true, shading: '2E75B6', width: 780 }],
          ['US Filing', { bold: true, shading: '2E75B6', width: 780 }],
        ]),
        ...items.map((item, i) => {
          const j = d.jurisdiction || 'Canada'
          return tableRow([
            [String(i + 1), { width: 500 }],
            [item.description, { width: 4800 }],
            [item.category === 'goods' ? 'Goods' : 'Services', { width: 1300 }],
            [item.nice_class || 'TBD', { width: 1200 }],
            [(j === 'Canada' || j === 'Both') ? 'Yes' : '—', { width: 780 }],
            [(j === 'United States' || j === 'Both') ? 'Yes' : '—', { width: 780 }],
          ])
        }),
      ],
    }))
  } else {
    children.push(p('No goods or services listed.', { italics: true, color: '999999' }))
  }

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Goods & Services Schedule', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

function buildOwnerSheet(d) {
  const markName = d.mark_text || 'Untitled Mark'

  const children = [
    p('Owner Information Sheet', { heading: HeadingLevel.HEADING_1 }),
    p(`Mark: ${markName}`, { bold: true, size: 26 }),
    p(''),

    p('Owner Details', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Owner Name', d.owner_name],
      ['Entity Type', d.owner_type || 'Corporation'],
      ['Country', d.owner_country || 'Canada'],
      ['Full Address', d.owner_address || '—'],
      ['Corporation Number', d.owner_corp_number || '—'],
    ]),
    p(''),

    p('Linked Records', { heading: HeadingLevel.HEADING_2 }),
    infoTable([
      ['Linked Incorporation Matter', d.linked_incorporation_matter_id || '—'],
      ['Source Matter', d.source_matter_id || '—'],
    ]),
  ]

  return new Document({
    styles: STYLES,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Owner Information', markName) },
      footers: { default: makeFooter(markName) },
      children,
    }],
  })
}

// ─── Main ─────────────────────────────────────────────────────

;(async () => {
  let data, snapshotHash, snapshotMeta

  if (snapshotId) {
    // Load from Supabase
    const { createClient } = require('@supabase/supabase-js')
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY'); process.exit(1) }

    const sb = createClient(url, key)
    const { data: snap, error } = await sb
      .from('approved_snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single()

    if (error || !snap) { console.error('Snapshot not found:', error?.message); process.exit(1) }

    data = snap.payload
    snapshotHash = snap.payload_hash
    snapshotMeta = { id: snap.id, matter_id: snap.matter_id, intake_id: snap.intake_id, version: snap.version }

    // Verify hash
    const computed = crypto.createHash('sha256')
      .update(JSON.stringify(sortKeysDeep(data)))
      .digest('hex')
    if (snapshotHash && computed !== snapshotHash) {
      console.error(`HASH MISMATCH! Stored: ${snapshotHash}, Computed: ${computed}`)
      process.exit(1)
    }
    console.log(`Snapshot v${snap.version} loaded. Hash verified: ${computed.slice(0, 12)}…`)
  } else {
    data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))
    snapshotHash = null
    snapshotMeta = null
    console.log('Loaded from JSON file.')
  }

  // Ensure output dir
  fs.mkdirSync(outputDir, { recursive: true })

  const markSlug = (data.mark_text || 'untitled').replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()
  const jurisdiction = data.jurisdiction || 'Canada'

  // Build documents
  const docs = [
    { name: `01_${markSlug}_clearance_report.docx`, doc: buildClearanceReport(data), type: 'trademark_clearance_report_docx' },
    { name: `02_${markSlug}_filing_record.docx`, doc: buildFilingRecord(data), type: 'trademark_filing_record_docx' },
  ]

  if (jurisdiction === 'Canada' || jurisdiction === 'Both') {
    docs.push({ name: `03_${markSlug}_filing_summary_CA.docx`, doc: buildFilingSummaryCA(data), type: 'trademark_filing_summary_ca_docx' })
  }
  if (jurisdiction === 'United States' || jurisdiction === 'Both') {
    docs.push({ name: `04_${markSlug}_filing_summary_US.docx`, doc: buildFilingSummaryUS(data), type: 'trademark_filing_summary_us_docx' })
  }

  docs.push(
    { name: `05_${markSlug}_goods_schedule.docx`, doc: buildGoodsSchedule(data), type: 'trademark_goods_schedule_docx' },
    { name: `06_${markSlug}_owner_info.docx`, doc: buildOwnerSheet(data), type: 'trademark_owner_sheet_docx' },
  )

  // Generate files
  for (const { name, doc } of docs) {
    const buf = await Packer.toBuffer(doc)
    const outPath = path.join(outputDir, name)
    fs.writeFileSync(outPath, buf)
    console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB)`)
  }

  // Register artifacts
  if (doRegister && snapshotMeta) {
    const { createClient } = require('@supabase/supabase-js')
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    // Get existing artifact count for versioning
    const { data: existing } = await sb
      .from('generated_artifacts')
      .select('version')
      .eq('intake_id', snapshotMeta.intake_id)
      .order('version', { ascending: false })
      .limit(1)
    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    for (const { name, type } of docs) {
      const { error } = await sb
        .from('generated_artifacts')
        .insert({
          matter_id: snapshotMeta.matter_id,
          intake_id: snapshotMeta.intake_id,
          snapshot_id: snapshotMeta.id,
          artifact_type: type,
          version: nextVersion,
          file_path: path.join(outputDir, name),
          snapshot_hash: snapshotHash,
          generated_by: 'system',
          status: 'generated',
        })
      if (error) console.error(`  ⚠ Failed to register ${type}: ${error.message}`)
      else console.log(`  ✓ Registered: ${type} v${nextVersion}`)
    }
  }

  console.log(`\nDone. ${docs.length} documents generated in ${outputDir}`)
})()

// ─── Utility ──────────────────────────────────────────────────

function sortKeysDeep(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(sortKeysDeep)
  if (typeof obj === 'object') {
    const sorted = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeysDeep(obj[key])
    }
    return sorted
  }
  return obj
}
