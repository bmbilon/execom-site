#!/usr/bin/env node
/**
 * IP Transfer Document Generator
 *
 * Generates IP assignment documents from an approved Supabase snapshot.
 * Produces the following documents:
 *   - 01: IP Assignment Agreement
 *   - 02: Board Resolution — IP Acquisition
 *   - 03: Tax Papering Memo
 *   - 04: Consideration Papering
 *   - 05: Patent Assignment Recordation Checklist (if patent_filed)
 *
 * Usage:
 *   node generate_ip_transfer_docs.js --snapshot <snapshot_id> [--output <dir>] [--register]
 *   node generate_ip_transfer_docs.js --json <data.json> [--output <dir>]
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
  console.error('Usage: node generate_ip_transfer_docs.js --snapshot <id> | --json <file>')
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

// ─── Helpers ──────────────────────────────────────────────────

const ASSET_TYPE_LABELS = {
  invention: 'Invention',
  software: 'Software',
  design: 'Design',
  trade_secret: 'Trade Secret',
  other: 'Other',
}

const CONSIDERATION_LABELS = {
  shares: 'Shares',
  cash: 'Cash',
  mixed: 'Cash and Shares',
  nominal: 'Nominal ($1.00)',
}

function considerationDescription(d) {
  const parts = []
  if (d.consideration_type === 'nominal') return 'Nominal consideration of $1.00 (One Dollar).'
  if (d.consideration_type === 'cash' || d.consideration_type === 'mixed') {
    parts.push(`Cash payment of $${d.cash_amount || '___'} CAD`)
  }
  if (d.consideration_type === 'shares' || d.consideration_type === 'mixed') {
    parts.push(`Issuance of ${d.share_count || '___'} ${d.share_class || 'common'} shares of the Corporation`)
  }
  return parts.join('; and ') + '.'
}

// ─── Document builders ────────────────────────────────────────

function buildDoc01_Assignment(d) {
  const corpName = d.assignee_corp_name || '[Corporation Name]'
  const inventorName = d.inventor_name || '[Inventor Name]'
  const assetTitle = d.asset_title || '[Asset Title]'
  const assetType = ASSET_TYPE_LABELS[d.asset_type] || d.asset_type || '[Type]'
  const today = new Date().toISOString().split('T')[0]

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('IP Assignment Agreement', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('IP ASSIGNMENT AGREEMENT', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`Effective Date: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),

        p('1. PARTIES', { heading: HeadingLevel.HEADING_2 }),
        p('This IP Assignment Agreement (this "Agreement") is entered into between:'),
        p(`(a) ${inventorName} (the "Assignor"); and`, { numbering: { reference: 'alpha', level: 0 } }),
        p(`(b) ${corpName} (the "Assignee"), an Alberta corporation.`, { numbering: { reference: 'alpha', level: 0 } }),
        p(''),

        p('2. BACKGROUND', { heading: HeadingLevel.HEADING_2 }),
        p(`The Assignor has developed certain intellectual property described herein and wishes to assign all right, title, and interest in such intellectual property to the Assignee.`),
        p(''),

        p('3. ASSIGNED INTELLECTUAL PROPERTY', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Asset Title', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetTitle, {}]]),
          tableRow([['Asset Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetType, {}]]),
          tableRow([['Description', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.asset_description || 'See attached schedule.', {}]]),
        ]}),
        p(''),
        p('The "Assigned IP" means all intellectual property rights in and to the above-described asset, including without limitation all patents, patent applications, copyrights, trade secrets, know-how, and all related rights worldwide.'),
        p(''),

        p('4. ASSIGNMENT', { heading: HeadingLevel.HEADING_2 }),
        p(`For and in consideration of the Consideration (defined below), the Assignor hereby irrevocably assigns, transfers, and conveys to the Assignee all right, title, and interest in and to the Assigned IP, including:`),
        p('All patents and patent applications related thereto;', { numbering: { reference: 'alpha', level: 0 } }),
        p('All copyrights and moral rights (to the extent waivable);', { numbering: { reference: 'alpha', level: 0 } }),
        p('All trade secrets and confidential information;', { numbering: { reference: 'alpha', level: 0 } }),
        p('All rights to sue for past, present, and future infringement; and', { numbering: { reference: 'alpha', level: 0 } }),
        p('All other intellectual property rights of any kind.', { numbering: { reference: 'alpha', level: 0 } }),
        p(''),

        p('5. CONSIDERATION', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Consideration Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [CONSIDERATION_LABELS[d.consideration_type] || d.consideration_type || '___', {}]]),
          ...(d.consideration_type === 'cash' || d.consideration_type === 'mixed' ? [
            tableRow([['Cash Amount', { bold: true, width: 3600, shading: 'F2F2F2' }], [`$${d.cash_amount || '___'} CAD`, {}]]),
          ] : []),
          ...(d.consideration_type === 'shares' || d.consideration_type === 'mixed' ? [
            tableRow([['Share Count', { bold: true, width: 3600, shading: 'F2F2F2' }], [String(d.share_count || '___'), {}]]),
            tableRow([['Share Class', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.share_class || 'Common', {}]]),
          ] : []),
          ...(d.consideration_type === 'nominal' ? [
            tableRow([['Amount', { bold: true, width: 3600, shading: 'F2F2F2' }], ['$1.00 CAD', {}]]),
          ] : []),
        ]}),
        p(''),
        p(`In consideration for the assignment of the Assigned IP, the Assignee shall provide the following: ${considerationDescription(d)}`),
        p(''),

        p('6. FURTHER ASSURANCES', { heading: HeadingLevel.HEADING_2 }),
        p('The Assignor agrees to execute any further documents, filings, or assignments as may be reasonably necessary to perfect the Assignee\'s rights in the Assigned IP, including patent assignment recordations with applicable patent offices.'),
        p(''),

        p('7. REPRESENTATIONS AND WARRANTIES', { heading: HeadingLevel.HEADING_2 }),
        p('The Assignor represents and warrants that:'),
        p('The Assignor is the sole and rightful owner of the Assigned IP;', { numbering: { reference: 'alpha', level: 0 } }),
        p('The Assigned IP is free and clear of all liens, encumbrances, and claims;', { numbering: { reference: 'alpha', level: 0 } }),
        p('The Assignor has the full right and authority to enter into this Agreement;', { numbering: { reference: 'alpha', level: 0 } }),
        p('The Assigned IP does not, to the best of the Assignor\'s knowledge, infringe upon the rights of any third party.', { numbering: { reference: 'alpha', level: 0 } }),
        p(''),

        ...(d.public_disclosure ? [
          p('8. DISCLOSURE ACKNOWLEDGMENT', { heading: HeadingLevel.HEADING_2 }),
          p('The parties acknowledge that portions of the Assigned IP may have been publicly disclosed:'),
          new Table({ rows: [
            tableRow([['Disclosure Date', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.disclosure_date || 'N/A', {}]]),
            tableRow([['Description', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.disclosure_description || 'N/A', {}]]),
          ]}),
          p(''),
        ] : []),

        p(d.public_disclosure ? '9. GOVERNING LAW' : '8. GOVERNING LAW', { heading: HeadingLevel.HEADING_2 }),
        p('This Agreement shall be governed by and construed in accordance with the laws of the Province of Alberta and the federal laws of Canada applicable therein.'),
        p(''),
        p(''),

        p('ASSIGNOR:', { bold: true }),
        p(''),
        p('_________________________________________'),
        p(inventorName, { bold: true }),
        ...(d.inventor_email ? [p(`Email: ${d.inventor_email}`)] : []),
        p(`Date: ${today}`),
        p(''),
        p(''),
        p('ASSIGNEE:', { bold: true }),
        p(corpName),
        p(''),
        p('_________________________________________'),
        p('Authorized Signing Officer'),
        p(`Date: ${today}`),
      ],
    }],
  })
}

function buildDoc02_BoardResolution(d) {
  const corpName = d.assignee_corp_name || '[Corporation Name]'
  const inventorName = d.inventor_name || '[Inventor Name]'
  const assetTitle = d.asset_title || '[Asset Title]'
  const assetType = ASSET_TYPE_LABELS[d.asset_type] || d.asset_type || '[Type]'
  const today = new Date().toISOString().split('T')[0]

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Board Resolution \u2014 IP Acquisition', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('BOARD RESOLUTION', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p('IP ACQUISITION', { align: AlignmentType.CENTER, bold: true }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p('(the "Corporation")', { align: AlignmentType.CENTER, italics: true }),
        p(`Effective Date: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),

        p('The undersigned, being all of the directors of the Corporation, hereby consent to and adopt the following resolutions:'),
        p(''),

        p('1. IP ACQUISITION APPROVAL', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that the Corporation is hereby authorized to acquire certain intellectual property (the "Assigned IP") from ${inventorName} (the "Assignor"), described as follows:`),
        p(''),
        new Table({ rows: [
          tableRow([['Asset Title', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetTitle, {}]]),
          tableRow([['Asset Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetType, {}]]),
          tableRow([['Description', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.asset_description || 'See IP Assignment Agreement.', {}]]),
        ]}),
        p(''),

        p('2. CONSIDERATION', { heading: HeadingLevel.HEADING_2 }),
        p(`RESOLVED, that in consideration for the assignment of the Assigned IP, the Corporation shall provide: ${considerationDescription(d)}`),
        p(''),
        p('FURTHER RESOLVED, that the directors have determined that the Consideration is fair and reasonable having regard to the nature and value of the Assigned IP.'),
        p(''),

        p('3. AUTHORIZATION OF AGREEMENT', { heading: HeadingLevel.HEADING_2 }),
        p('RESOLVED, that the form, terms, and provisions of the IP Assignment Agreement between the Corporation and the Assignor (the "Agreement") are hereby approved.'),
        p(''),
        p('FURTHER RESOLVED, that any officer or director of the Corporation is authorized to execute and deliver the Agreement and all ancillary documents.'),
        p(''),

        ...(d.patent_filed ? [
          p('4. PATENT RECORDATION', { heading: HeadingLevel.HEADING_2 }),
          p('RESOLVED, that the officers of the Corporation are authorized to file patent assignment recordations with applicable patent offices to reflect the assignment of the Assigned IP to the Corporation.'),
          p(''),
          ...(d.patent_number ? [p(`Patent/Application No.: ${d.patent_number}`, { bold: true }), p('')] : []),
        ] : []),

        p(d.patent_filed ? '5. GENERAL AUTHORITY' : '4. GENERAL AUTHORITY', { heading: HeadingLevel.HEADING_2 }),
        p('RESOLVED, that any officer or director of the Corporation is authorized to execute and deliver all documents and take all actions necessary or desirable to give effect to the foregoing resolutions.'),
        p(''),
        p(''),
        p('_________________________________________'),
        p('Director', { bold: true }),
        p(`Date: ${today}`),
      ],
    }],
  })
}

function buildDoc03_TaxMemo(d) {
  const corpName = d.assignee_corp_name || '[Corporation Name]'
  const inventorName = d.inventor_name || '[Inventor Name]'
  const assetTitle = d.asset_title || '[Asset Title]'
  const today = new Date().toISOString().split('T')[0]

  const isTaxDeferral = d.consideration_type === 'shares' || d.consideration_type === 'mixed'

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Tax Papering Memo', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('TAX PAPERING MEMO', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p('IP TRANSFER \u2014 INTERNAL USE ONLY', { align: AlignmentType.CENTER, bold: true }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`Prepared: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),

        p('1. TRANSACTION SUMMARY', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Assignor', { bold: true, width: 3600, shading: 'F2F2F2' }], [inventorName, {}]]),
          tableRow([['Assignee', { bold: true, width: 3600, shading: 'F2F2F2' }], [corpName, {}]]),
          tableRow([['Asset', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetTitle, {}]]),
          tableRow([['Consideration Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [CONSIDERATION_LABELS[d.consideration_type] || '___', {}]]),
        ]}),
        p(''),

        p('2. APPLICABLE TAX FRAMEWORK', { heading: HeadingLevel.HEADING_2 }),
        p('This memo identifies the key Canadian tax considerations for the IP transfer. It is not tax advice and the parties should consult with their own tax advisors.'),
        p(''),
        p('Key provisions to consider:'),
        p('Section 85 rollover (Income Tax Act) \u2014 election available where property is transferred to a Canadian corporation for shares', { numbering: { reference: 'alpha', level: 0 } }),
        p('Capital gains inclusion rate \u2014 applicable if Assignor disposes of capital property', { numbering: { reference: 'alpha', level: 0 } }),
        p('Eligible capital property treatment \u2014 applicable to goodwill and similar intangible property', { numbering: { reference: 'alpha', level: 0 } }),
        p('Transfer pricing \u2014 fair market value must be established for non-arm\'s length transactions', { numbering: { reference: 'alpha', level: 0 } }),
        p(''),

        p('3. SECTION 85 ROLLOVER ANALYSIS', { heading: HeadingLevel.HEADING_2 }),
        ...(isTaxDeferral ? [
          p('The transfer involves share consideration, which may qualify for a Section 85 rollover election under the Income Tax Act (Canada). Key requirements:'),
          p(''),
          p('The property must be "eligible property" (IP generally qualifies);', { numbering: { reference: 'alpha', level: 0 } }),
          p('Consideration must include at least one share of the transferee corporation;', { numbering: { reference: 'alpha', level: 0 } }),
          p('A joint election (Form T2057) must be filed with CRA;', { numbering: { reference: 'alpha', level: 0 } }),
          p('The elected amount must be between the tax cost and fair market value.', { numbering: { reference: 'alpha', level: 0 } }),
          p(''),
          p('ACTION REQUIRED: If the parties wish to make a Section 85 election, Form T2057 must be filed by the earlier of the filing deadlines for the Assignor and Assignee.', { bold: true }),
        ] : [
          p('The transfer consideration is cash/nominal. A Section 85 rollover is generally not applicable or necessary where no share consideration is issued.'),
        ]),
        p(''),

        p('4. FAIR MARKET VALUE', { heading: HeadingLevel.HEADING_2 }),
        p('For non-arm\'s length transactions, the transfer price should reflect fair market value. Consider obtaining an independent valuation, particularly for material IP assets.'),
        p(''),
        new Table({ rows: [
          tableRow([['Consideration', { bold: true, width: 3600, shading: 'F2F2F2' }], [considerationDescription(d), {}]]),
          tableRow([['FMV Established', { bold: true, width: 3600, shading: 'F2F2F2' }], ['[ ] Yes  [ ] No  [ ] Not Required', {}]]),
          tableRow([['Valuation Method', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
        ]}),
        p(''),

        p('5. ACTION ITEMS', { heading: HeadingLevel.HEADING_2 }),
        p('Confirm arm\'s length status of Assignor and Assignee', { numbering: { reference: 'numbers', level: 0 } }),
        p('Obtain FMV determination (if required)', { numbering: { reference: 'numbers', level: 0 } }),
        ...(isTaxDeferral ? [
          p('Prepare and file Form T2057 (Section 85 election)', { numbering: { reference: 'numbers', level: 0 } }),
          p('Determine elected amount (agreed amount)', { numbering: { reference: 'numbers', level: 0 } }),
        ] : []),
        p('Ensure assignment is reflected in corporate tax records', { numbering: { reference: 'numbers', level: 0 } }),
        p('File any patent assignment recordation (if applicable)', { numbering: { reference: 'numbers', level: 0 } }),
        p(''),
        p('DISCLAIMER: This memo is prepared for internal use as part of the IP transfer papering process. It does not constitute legal or tax advice. The parties should consult with qualified tax professionals.', { italics: true, color: '666666', size: 20 }),
      ],
    }],
  })
}

function buildDoc04_ConsiderationPapering(d) {
  const corpName = d.assignee_corp_name || '[Corporation Name]'
  const inventorName = d.inventor_name || '[Inventor Name]'
  const assetTitle = d.asset_title || '[Asset Title]'
  const today = new Date().toISOString().split('T')[0]

  const isShares = d.consideration_type === 'shares' || d.consideration_type === 'mixed'
  const isCash = d.consideration_type === 'cash' || d.consideration_type === 'mixed'

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Consideration Papering', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('CONSIDERATION PAPERING', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p('IP TRANSFER', { align: AlignmentType.CENTER, bold: true }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`Prepared: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),

        p('1. CONSIDERATION SUMMARY', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Asset', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetTitle, {}]]),
          tableRow([['Assignor', { bold: true, width: 3600, shading: 'F2F2F2' }], [inventorName, {}]]),
          tableRow([['Assignee', { bold: true, width: 3600, shading: 'F2F2F2' }], [corpName, {}]]),
          tableRow([['Type', { bold: true, width: 3600, shading: 'F2F2F2' }], [CONSIDERATION_LABELS[d.consideration_type] || '___', {}]]),
          tableRow([['Description', { bold: true, width: 3600, shading: 'F2F2F2' }], [considerationDescription(d), {}]]),
        ]}),
        p(''),

        ...(isCash ? [
          p('2. CASH CONSIDERATION', { heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: [
            tableRow([['Amount', { bold: true, width: 3600, shading: 'F2F2F2' }], [`$${d.cash_amount || '___'} CAD`, {}]]),
            tableRow([['Payment Method', { bold: true, width: 3600, shading: 'F2F2F2' }], ['[ ] Wire  [ ] Cheque  [ ] EFT', {}]]),
            tableRow([['Payment Date', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
            tableRow([['Reference/Confirmation', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
          ]}),
          p(''),
        ] : []),

        ...(isShares ? [
          p(isCash ? '3. SHARE CONSIDERATION' : '2. SHARE CONSIDERATION', { heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: [
            tableRow([['Number of Shares', { bold: true, width: 3600, shading: 'F2F2F2' }], [String(d.share_count || '___'), {}]]),
            tableRow([['Share Class', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.share_class || 'Common', {}]]),
            tableRow([['Price Per Share', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
            tableRow([['Issuance Date', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
            tableRow([['Certificate No.', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
          ]}),
          p(''),
          p('Share Ledger Entry:', { bold: true }),
          p('The following entry should be recorded in the Corporation\'s share register:'),
          new Table({ rows: [
            tableRow([['Shareholder', { bold: true, shading: 'F2F2F2' }], ['Class', { bold: true, shading: 'F2F2F2' }], ['# Shares', { bold: true, shading: 'F2F2F2' }], ['Consideration', { bold: true, shading: 'F2F2F2' }]]),
            tableRow([[inventorName, {}], [d.share_class || 'Common', {}], [String(d.share_count || '___'), {}], ['IP Assignment', {}]]),
          ]}),
          p(''),
        ] : []),

        ...(d.consideration_type === 'nominal' ? [
          p('2. NOMINAL CONSIDERATION', { heading: HeadingLevel.HEADING_2 }),
          p('The transfer is made for nominal consideration of $1.00 (One Dollar) and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged.'),
          p(''),
          new Table({ rows: [
            tableRow([['Amount', { bold: true, width: 3600, shading: 'F2F2F2' }], ['$1.00 CAD', {}]]),
            tableRow([['Payment Confirmed', { bold: true, width: 3600, shading: 'F2F2F2' }], ['[ ] Yes  [ ] Pending', {}]]),
          ]}),
          p(''),
        ] : []),

        p('COMPLETION CHECKLIST', { heading: HeadingLevel.HEADING_2 }),
        p('[ ] IP Assignment Agreement executed by both parties'),
        p('[ ] Consideration delivered/issued as described above'),
        ...(isShares ? [p('[ ] Share register updated'), p('[ ] Share certificate issued (if applicable)')] : []),
        ...(isCash ? [p('[ ] Payment confirmation received')] : []),
        p('[ ] Corporate records updated'),
        ...(d.patent_filed ? [p('[ ] Patent assignment recordation filed')] : []),
        p(''),
        p(''),
        p('Confirmed by: _________________________________________'),
        p('Title: _________________________________________'),
        p(`Date: ${today}`),
      ],
    }],
  })
}

function buildDoc05_PatentChecklist(d) {
  const corpName = d.assignee_corp_name || '[Corporation Name]'
  const inventorName = d.inventor_name || '[Inventor Name]'
  const assetTitle = d.asset_title || '[Asset Title]'
  const today = new Date().toISOString().split('T')[0]

  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections: [{
      properties: { page: PAGE },
      headers: { default: makeHeader('Patent Assignment Recordation Checklist', corpName) },
      footers: { default: makeFooter(corpName) },
      children: [
        p('PATENT ASSIGNMENT RECORDATION CHECKLIST', { heading: HeadingLevel.HEADING_1, align: AlignmentType.CENTER }),
        p(corpName.toUpperCase(), { align: AlignmentType.CENTER, bold: true, color: '2E75B6' }),
        p(`Prepared: ${today}`, { align: AlignmentType.CENTER, italics: true, color: '666666' }),
        p(''),

        p('1. PATENT/APPLICATION DETAILS', { heading: HeadingLevel.HEADING_2 }),
        new Table({ rows: [
          tableRow([['Asset Title', { bold: true, width: 3600, shading: 'F2F2F2' }], [assetTitle, {}]]),
          tableRow([['Patent/App No.', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.patent_number || '___', {}]]),
          tableRow([['Filing Jurisdiction', { bold: true, width: 3600, shading: 'F2F2F2' }], [d.patent_jurisdiction || 'Canada (CIPO)', {}]]),
          tableRow([['Inventor/Assignor', { bold: true, width: 3600, shading: 'F2F2F2' }], [inventorName, {}]]),
          tableRow([['Assignee', { bold: true, width: 3600, shading: 'F2F2F2' }], [corpName, {}]]),
        ]}),
        p(''),

        p('2. RECORDATION REQUIREMENTS \u2014 CIPO (CANADA)', { heading: HeadingLevel.HEADING_2 }),
        p('For Canadian patents/applications, assignment recordation with the Canadian Intellectual Property Office (CIPO):'),
        p(''),
        p('[ ] Obtain executed IP Assignment Agreement'),
        p('[ ] Prepare Assignment Recordation Request'),
        p('[ ] Include: Patent/Application number, names and addresses of assignor and assignee'),
        p('[ ] Pay applicable CIPO fees'),
        p('[ ] File via CIPO online portal or by mail'),
        p('[ ] Confirm recordation and obtain updated certificate'),
        p(''),

        p('3. RECORDATION REQUIREMENTS \u2014 USPTO (US)', { heading: HeadingLevel.HEADING_2 }),
        p('If the patent/application is also filed in the United States:'),
        p(''),
        p('[ ] Prepare USPTO Assignment Cover Sheet'),
        p('[ ] Include: Assignor name and address, Assignee name and address'),
        p('[ ] Include: Patent/Application number, execution date, title of invention'),
        p('[ ] Attach executed assignment document'),
        p('[ ] File via USPTO EPAS (Electronic Patent Assignment System)'),
        p('[ ] Pay USPTO recording fee'),
        p('[ ] Confirm reel/frame number upon recordation'),
        p(''),

        p('4. OTHER JURISDICTIONS', { heading: HeadingLevel.HEADING_2 }),
        p('If patent protection exists in additional jurisdictions, recordation may be required or advisable in each jurisdiction. Consult with local patent counsel.'),
        p(''),
        new Table({ rows: [
          tableRow([['Jurisdiction', { bold: true, shading: 'F2F2F2' }], ['Status', { bold: true, shading: 'F2F2F2' }], ['Notes', { bold: true, shading: 'F2F2F2' }]]),
          tableRow([['Canada (CIPO)', {}], ['[ ] Filed  [ ] Recorded', {}], ['', {}]]),
          tableRow([['United States (USPTO)', {}], ['[ ] Filed  [ ] Recorded  [ ] N/A', {}], ['', {}]]),
          tableRow([['Other: ____________', {}], ['[ ] Filed  [ ] Recorded  [ ] N/A', {}], ['', {}]]),
        ]}),
        p(''),

        p('5. TIMELINE', { heading: HeadingLevel.HEADING_2 }),
        p('While there is no strict deadline for recording assignments, prompt recordation is recommended to:'),
        p('Establish a public record of ownership;', { numbering: { reference: 'alpha', level: 0 } }),
        p('Protect against subsequent conflicting assignments;', { numbering: { reference: 'alpha', level: 0 } }),
        p('Facilitate enforcement of patent rights.', { numbering: { reference: 'alpha', level: 0 } }),
        p(''),
        new Table({ rows: [
          tableRow([['Target Filing Date', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
          tableRow([['Responsible Person', { bold: true, width: 3600, shading: 'F2F2F2' }], ['_________________________________', {}]]),
          tableRow([['Confirmation Received', { bold: true, width: 3600, shading: 'F2F2F2' }], ['[ ] Yes  [ ] Pending', {}]]),
        ]}),
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

  // Verify hash
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
    const { data: existing } = await sb.from('generated_artifacts').select('version')
      .eq('snapshot_id', meta.id).eq('artifact_type', type)
      .order('version', { ascending: false }).limit(1)
    const nextVersion = existing?.length > 0 ? existing[0].version + 1 : 1

    await sb.from('generated_artifacts').update({ status: 'superseded' })
      .eq('intake_id', meta.intake_id).eq('artifact_type', type).eq('status', 'generated')

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

  await sb.from('matter_status_events').insert({
    matter_id: meta.matter_id,
    intake_id: meta.intake_id,
    from_status: 'approved_for_generation',
    to_status: 'generated',
    changed_by: generatedBy,
    note: `IP Transfer docs generated (01-05) from snapshot v${meta.version}`,
  })
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const { data, meta } = snapshotId
    ? await loadFromSnapshot(snapshotId)
    : await loadFromJson(jsonFile)

  const safeName = `${data.asset_title || 'unnamed'}`.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
  fs.mkdirSync(outputDir, { recursive: true })

  const docs = [
    { builder: buildDoc01_Assignment, name: `01_IP_Assignment_Agreement_${safeName}.docx`, type: 'ip_assignment_agreement_docx' },
    { builder: buildDoc02_BoardResolution, name: `02_Board_Resolution_IP_${safeName}.docx`, type: 'ip_board_resolution_docx' },
    { builder: buildDoc03_TaxMemo, name: `03_Tax_Papering_Memo_${safeName}.docx`, type: 'ip_tax_memo_docx' },
    { builder: buildDoc04_ConsiderationPapering, name: `04_Consideration_Papering_${safeName}.docx`, type: 'ip_consideration_papering_docx' },
  ]

  // Only generate patent checklist if patent_filed is true
  if (data.patent_filed) {
    docs.push({
      builder: buildDoc05_PatentChecklist,
      name: `05_Patent_Recordation_Checklist_${safeName}.docx`,
      type: 'ip_patent_checklist_docx',
    })
  }

  const generated = []
  for (const { builder, name, type } of docs) {
    const doc = builder(data)
    const buf = await Packer.toBuffer(doc)
    const outPath = path.join(outputDir, name)
    fs.writeFileSync(outPath, buf)
    console.log(`Generated: ${outPath}`)
    generated.push({ path: outPath, type })
  }

  console.log(`\n${generated.length} document(s) generated.`)
  if (!data.patent_filed) {
    console.log('Note: Patent Assignment Recordation Checklist skipped (patent_filed = false)')
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
