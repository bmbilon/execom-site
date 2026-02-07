import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ref_code, client_name, client_email, concept_title } = body

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'E-BRAKE <onboarding@resend.dev>',
        to: 'action@execom.ca',
        subject: 'New E-BRAKE Submission',
        text: [
          'New E-BRAKE submission received.',
          '',
          `Reference:  ${ref_code || 'N/A'}`,
          `Name:       ${client_name || 'N/A'}`,
          `Email:      ${client_email || 'N/A'}`,
          `Concept:    ${concept_title || 'N/A'}`,
          '',
          'Log in to Supabase to review the full submission.',
        ].join('\n'),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Notification error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
