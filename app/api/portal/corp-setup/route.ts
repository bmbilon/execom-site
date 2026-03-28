import { NextRequest, NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'brettbilon@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { formId, formTitle, formNumber, phase, fields } = body

    if (!formId || !formTitle || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build a plain-text email body
    const lines = [
      `New Corp Setup Form Submission`,
      `═══════════════════════════════`,
      ``,
      `Form: ${String(formNumber).padStart(2, '0')} — ${formTitle}`,
      `Phase: ${phase}`,
      `Submitted: ${new Date().toLocaleString('en-CA', { timeZone: 'America/Edmonton' })}`,
      ``,
      `─── Submitted Data ───`,
      ``,
    ]

    for (const field of fields) {
      if (field.value) {
        lines.push(`${field.label}:`)
        lines.push(`  ${field.value}`)
        lines.push(``)
      }
    }

    lines.push(`─── End of Submission ───`)

    const textBody = lines.join('\n')

    // Build HTML version
    const htmlRows = fields
      .filter((f: any) => f.value)
      .map(
        (f: any) =>
          `<tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500;vertical-align:top;width:35%;color:#1a1a1a">${f.label}</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#5a5a5a;white-space:pre-wrap">${f.value}</td></tr>`
      )
      .join('')

    const htmlBody = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto">
        <div style="background:#0d1b2a;padding:20px 24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;font-size:16px;font-weight:600;margin:0">New Corp Setup Submission</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
          <p style="color:#5a5a5a;font-size:14px;margin:0 0 4px">
            <strong style="color:#1a1a1a">${String(formNumber).padStart(2, '0')} — ${formTitle}</strong>
          </p>
          <p style="color:#b8b8b0;font-size:12px;margin:0 0 20px">
            Phase: ${phase} · ${new Date().toLocaleString('en-CA', { timeZone: 'America/Edmonton' })}
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            ${htmlRows}
          </table>
        </div>
      </div>
    `

    // Send via Resend if API key is available, otherwise log
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'execom Portal <portal@execom.ca>',
          to: NOTIFY_EMAIL,
          subject: `[Corp Setup] ${String(formNumber).padStart(2, '0')} — ${formTitle}`,
          html: htmlBody,
          text: textBody,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Resend error:', err)
        // Still return success to client — form data is captured
      }
    } else {
      // Fallback: log to server console for development
      console.log('═══ CORP SETUP SUBMISSION ═══')
      console.log(textBody)
      console.log('═══ END ═══')
      console.log('(Set RESEND_API_KEY to enable email notifications)')
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Corp setup API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
