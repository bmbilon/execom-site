import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

async function generatePDF(data: {
  ref_code: string
  client_name: string
  client_email: string
  concept_title: string
  payload: Record<string, unknown>
}): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const page = pdf.addPage([612, 792]) // US Letter
  const { height } = page.getSize()

  let y = height - 60
  const left = 50
  const lineHeight = 18
  const sectionGap = 28

  // Title
  page.drawText('E-BRAKE Concept Intake', {
    x: left, y, size: 20, font: fontBold, color: rgb(0.098, 0.369, 0.557),
  })
  y -= 30

  // Reference
  page.drawText(`Reference: ${data.ref_code}`, {
    x: left, y, size: 10, font, color: rgb(0.37, 0.42, 0.52),
  })
  y -= sectionGap

  // Client info section
  const drawField = (label: string, value: string) => {
    page.drawText(label, { x: left, y, size: 10, font: fontBold, color: rgb(0.09, 0.17, 0.3) })
    page.drawText(value, { x: left + 120, y, size: 10, font, color: rgb(0.09, 0.17, 0.3) })
    y -= lineHeight
  }

  drawField('Name:', data.client_name || 'N/A')
  drawField('Email:', data.client_email || 'N/A')
  drawField('Concept:', data.concept_title || 'N/A')
  y -= 10

  // Concept details from payload
  const payload = data.payload || {} as Record<string, unknown>
  const concept = (payload.concept || {}) as Record<string, string>

  if (concept.summary) {
    y -= 10
    page.drawText('Concept Summary', { x: left, y, size: 12, font: fontBold, color: rgb(0.098, 0.369, 0.557) })
    y -= lineHeight

    // Word-wrap the summary
    const maxWidth = 512
    const words = concept.summary.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? line + ' ' + word : word
      const width = font.widthOfTextAtSize(test, 10)
      if (width > maxWidth && line) {
        page.drawText(line, { x: left, y, size: 10, font, color: rgb(0.09, 0.17, 0.3) })
        y -= lineHeight
        line = word
      } else {
        line = test
      }
      if (y < 60) {
        // Add new page
        const newPage = pdf.addPage([612, 792])
        y = 792 - 60
        // Switch drawing context — pdf-lib draws on the page directly,
        // so we need to update our reference
        Object.assign(page, newPage)
      }
    }
    if (line) {
      page.drawText(line, { x: left, y, size: 10, font, color: rgb(0.09, 0.17, 0.3) })
      y -= lineHeight
    }
  }

  // Evidence / Notes
  if (concept.notes) {
    y -= 10
    page.drawText('Evidence & Notes', { x: left, y, size: 12, font: fontBold, color: rgb(0.098, 0.369, 0.557) })
    y -= lineHeight

    const noteLines = concept.notes.split('\n')
    for (const noteLine of noteLines) {
      if (y < 60) {
        const newPage = pdf.addPage([612, 792])
        y = 792 - 60
        Object.assign(page, newPage)
      }

      const trimmed = noteLine.trim()
      if (!trimmed) { y -= 8; continue }

      // Check if it's a section header (starts with ##)
      if (trimmed.startsWith('##')) {
        y -= 6
        page.drawText(trimmed.replace(/^#+\s*/, ''), {
          x: left, y, size: 11, font: fontBold, color: rgb(0.09, 0.17, 0.3),
        })
        y -= lineHeight
        continue
      }

      // Word-wrap each line
      const maxWidth = 500
      const words = trimmed.split(' ')
      let line = ''
      for (const word of words) {
        const test = line ? line + ' ' + word : word
        const width = font.widthOfTextAtSize(test, 9)
        if (width > maxWidth && line) {
          page.drawText(line, { x: left + 12, y, size: 9, font, color: rgb(0.37, 0.42, 0.52) })
          y -= lineHeight - 4
          line = word
        } else {
          line = test
        }
      }
      if (line) {
        page.drawText(line, { x: left + 12, y, size: 9, font, color: rgb(0.37, 0.42, 0.52) })
        y -= lineHeight - 4
      }
    }
  }

  // Self-estimate inputs
  const inputs = (payload.inputs || {}) as Record<string, unknown>
  if (inputs.technical !== undefined) {
    y -= sectionGap
    if (y < 100) {
      pdf.addPage([612, 792])
      y = 792 - 60
    }
    page.drawText('Self-Estimate Scores (if provided)', {
      x: left, y, size: 12, font: fontBold, color: rgb(0.098, 0.369, 0.557),
    })
    y -= lineHeight
    const demand2A = (inputs.demand2A || {}) as Record<string, number>
    const scores = [
      ['Technical Feasibility', inputs.technical],
      ['Market Size', demand2A.mktsize],
      ['Accessibility', demand2A.access],
      ['Competition', demand2A.comp],
      ['Inertia', demand2A.inertia],
      ['Urgency', demand2A.urgency],
      ['Demand Intensity (2B)', inputs.demand2B],
      ['Unit Economics', inputs.unitEcon],
      ['Regulatory', inputs.regulatory],
      ['Distribution', inputs.distribution],
    ]
    for (const [label, val] of scores) {
      page.drawText(`${label}:`, { x: left + 12, y, size: 9, font, color: rgb(0.37, 0.42, 0.52) })
      page.drawText(`${val}`, { x: left + 200, y, size: 9, font: fontBold, color: rgb(0.09, 0.17, 0.3) })
      y -= lineHeight - 4
    }
  }

  // Footer
  y = 30
  page.drawText('Generated by E-BRAKE | execom.ca/ebrake', {
    x: left, y, size: 8, font, color: rgb(0.7, 0.7, 0.7),
  })

  const pdfBytes = await pdf.save()
  return Buffer.from(pdfBytes)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ref_code, client_name, client_email, concept_title, payload } = body

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Generate scoring tool link with data pre-loaded
    const payloadB64 = Buffer.from(encodeURIComponent(JSON.stringify(payload || {}))).toString('base64')
    const scoreLink = `https://execom.ca/ebrake/score#import=${payloadB64}`

    // Generate PDF
    const pdfBuffer = await generatePDF({
      ref_code: ref_code || 'N/A',
      client_name: client_name || 'N/A',
      client_email: client_email || 'N/A',
      concept_title: concept_title || 'N/A',
      payload: payload || {},
    })
    const pdfBase64 = pdfBuffer.toString('base64')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'E-BRAKE <notifications@execom.ca>',
        to: 'action@execom.ca',
        subject: `New E-BRAKE Submission: ${concept_title || 'Untitled'}`,
        html: [
          '<div style="font-family:Open Sans,-apple-system,sans-serif;max-width:600px;margin:0 auto">',
          '<div style="background:#195E8E;padding:16px 24px;border-radius:8px 8px 0 0">',
          '<h2 style="color:#fff;margin:0;font-family:Cambria,Georgia,serif;font-size:20px"><span style="color:#FFC342">E-BRAKE</span> Submission</h2>',
          '</div>',
          '<div style="background:#fff;border:1px solid #d9d7ce;border-top:none;border-radius:0 0 8px 8px;padding:24px">',
          '<table style="font-size:14px;line-height:1.8;width:100%">',
          `<tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#195E8E;width:100px">Reference</td><td style="color:#1a2a3a">${ref_code || 'N/A'}</td></tr>`,
          `<tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#195E8E">Name</td><td style="color:#1a2a3a">${client_name || 'N/A'}</td></tr>`,
          `<tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#195E8E">Email</td><td><a href="mailto:${client_email}" style="color:#50C4D2">${client_email || 'N/A'}</a></td></tr>`,
          `<tr><td style="padding:4px 16px 4px 0;font-weight:600;color:#195E8E">Concept</td><td style="color:#1a2a3a">${concept_title || 'N/A'}</td></tr>`,
          '</table>',
          '<hr style="border:none;border-top:1px solid #d9d7ce;margin:20px 0">',
          `<a href="${scoreLink}" style="display:inline-block;background:#50C4D2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Open in Scoring Tool</a>`,
          '<p style="font-size:12px;color:#5e6c84;margin-top:16px">Full intake PDF is attached. Click the button above to load this submission directly into the E-BRAKE scoring tool.</p>',
          '</div>',
          '</div>',
        ].join('\n'),
        attachments: [
          {
            filename: `ebrake-intake-${ref_code || 'unknown'}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send notification', detail: err }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Notification error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
