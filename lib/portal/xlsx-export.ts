import ExcelJS from 'exceljs'
import type { ClaimJson } from './claim-builder'

export async function generateXlsx(claim: ClaimJson): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'execom SR&ED Portal'
  wb.created = new Date()

  const headerFill: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF195E8E' },
  }
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: 'FFFFFFFF' },
    size: 11,
  }
  const currencyFormat = '#,##0.00'

  // ── Sheet 1: Summary ──
  const summary = wb.addWorksheet('Summary')
  summary.columns = [
    { header: '', width: 30 },
    { header: '', width: 40 },
  ]

  const summaryRows = [
    ['Company Name', claim.company.name],
    ['Legal Name', claim.company.legal_name || ''],
    ['Business Number', claim.company.bn || ''],
    ['Fiscal Year', claim.company.fiscal_year.toString()],
    ['Fiscal Year End Month', claim.company.fiscal_ye_month.toString()],
    ['Address', claim.company.address ? `${claim.company.address.street || ''}, ${claim.company.address.city || ''}, ${claim.company.address.province || ''} ${claim.company.address.postal || ''}` : ''],
    [''],
    ['Expenditure Category', 'Amount'],
    ['Salary', claim.totals.salary],
    ['Wages', claim.totals.wages],
    ['Subcontractor', claim.totals.subcontractor],
    ['Materials', claim.totals.materials],
    ['Overhead', claim.totals.overhead],
    ['Other', claim.totals.other],
    [''],
    ['Total Qualified Expenditures', claim.totals.total_qualified],
    ['Estimated Federal ITC (15% non-CCPC)', claim.totals.estimated_federal_itc],
    ['Estimated Federal ITC (35% CCPC, under threshold)', claim.totals.total_qualified * 0.35],
    [''],
    ['Note: ITC figures are Estimated. CCPC status and provincial rates are simplified in v1.'],
  ]

  summaryRows.forEach((row) => {
    const r = summary.addRow(row)
    if (typeof row[1] === 'number') {
      r.getCell(2).numFmt = currencyFormat
    }
  })

  // Style header row for expenditure section
  const expHeaderRow = summary.getRow(8)
  expHeaderRow.eachCell((cell) => {
    cell.fill = headerFill
    cell.font = headerFont
  })

  // ── Sheet 2: Projects ──
  const projects = wb.addWorksheet('Projects')
  projects.columns = [
    { header: 'Code', width: 12 },
    { header: 'Name', width: 30 },
    { header: 'Objective (excerpt)', width: 50 },
    { header: 'Total Costs', width: 15 },
    { header: 'Evidence Count', width: 15 },
    { header: 'Status', width: 15 },
  ]
  styleHeaderRow(projects)

  claim.projects.forEach((p) => {
    const totalCosts = p.costs.reduce((sum, c) => sum + c.amount, 0)
    const row = projects.addRow([
      p.code || '',
      p.name,
      (p.t661.objective || '').slice(0, 200),
      totalCosts,
      p.evidence.length,
      p.status,
    ])
    row.getCell(4).numFmt = currencyFormat
  })

  // ── Sheet 3: Expenditure Detail ──
  const expenditures = wb.addWorksheet('Expenditure Detail')
  expenditures.columns = [
    { header: 'Project Code', width: 12 },
    { header: 'Cost Type', width: 15 },
    { header: 'Description', width: 35 },
    { header: 'Amount', width: 15 },
    { header: 'Hours', width: 10 },
    { header: 'Rate', width: 12 },
    { header: 'Employee/Vendor', width: 25 },
    { header: 'Period', width: 25 },
    { header: 'Source', width: 10 },
  ]
  styleHeaderRow(expenditures)

  claim.projects.forEach((p) => {
    p.costs.forEach((c) => {
      const row = expenditures.addRow([
        p.code || '',
        c.cost_type,
        c.description,
        c.amount,
        c.hours || '',
        c.rate || '',
        c.employee_name || c.vendor_name || '',
        [c.period_start, c.period_end].filter(Boolean).join(' to '),
        '',
      ])
      row.getCell(4).numFmt = currencyFormat
      if (c.rate) row.getCell(6).numFmt = currencyFormat
    })
  })

  // ── Sheet 4: Salary Allocation ──
  const salary = wb.addWorksheet('Salary Allocation')
  salary.columns = [
    { header: 'Employee Name', width: 25 },
    { header: 'Project Code', width: 12 },
    { header: 'Description', width: 35 },
    { header: 'Hours', width: 10 },
    { header: 'Rate', width: 12 },
    { header: 'Amount', width: 15 },
  ]
  styleHeaderRow(salary)

  claim.projects.forEach((p) => {
    p.costs
      .filter((c) => c.cost_type === 'salary' || c.cost_type === 'wages')
      .forEach((c) => {
        const row = salary.addRow([
          c.employee_name || '',
          p.code || '',
          c.description,
          c.hours || '',
          c.rate || '',
          c.amount,
        ])
        row.getCell(5).numFmt = currencyFormat
        row.getCell(6).numFmt = currencyFormat
      })
  })

  // ── Sheet 5: T661 Narratives ──
  const narratives = wb.addWorksheet('T661 Narratives')
  narratives.columns = [
    { header: 'Project Code', width: 12 },
    { header: 'Project Name', width: 25 },
    { header: 'Objective (Line 242)', width: 50 },
    { header: 'Obj. Chars', width: 10 },
    { header: 'Uncertainty (Line 244)', width: 50 },
    { header: 'Unc. Chars', width: 10 },
    { header: 'Work Performed (Line 246)', width: 60 },
    { header: 'Work Chars', width: 10 },
    { header: 'Advancement (Line 248)', width: 50 },
    { header: 'Adv. Chars', width: 10 },
  ]
  styleHeaderRow(narratives)

  claim.projects.forEach((p) => {
    narratives.addRow([
      p.code || '',
      p.name,
      p.t661.objective || '',
      (p.t661.objective || '').length,
      p.t661.uncertainty || '',
      (p.t661.uncertainty || '').length,
      p.t661.work_done || '',
      (p.t661.work_done || '').length,
      p.t661.advancement || '',
      (p.t661.advancement || '').length,
    ])
  })

  // ── Sheet 6: Evidence Index ──
  const evidenceSheet = wb.addWorksheet('Evidence Index')
  evidenceSheet.columns = [
    { header: 'Project Code', width: 12 },
    { header: 'Evidence Type', width: 15 },
    { header: 'Title', width: 30 },
    { header: 'Description', width: 40 },
    { header: 'Linked File', width: 30 },
  ]
  styleHeaderRow(evidenceSheet)

  claim.projects.forEach((p) => {
    p.evidence.forEach((e) => {
      evidenceSheet.addRow([
        p.code || '',
        e.evidence_type,
        e.title,
        e.description || '',
        e.file_name || '',
      ])
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1)
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF195E8E' },
    }
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11,
    }
  })
}
