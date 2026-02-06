"use client"

import { useState } from "react"
import type { Metadata } from "next"

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`mb-20 ${className}`}>{children}</section>
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Wire this to your preferred backend:
    // - Vercel serverless function (/api/contact)
    // - Formspree, Resend, or similar
    // For now, this opens a mailto as a fallback
    const subject = encodeURIComponent("Execom inquiry")
    const body = encodeURIComponent(message)
    window.location.href = `mailto:brett@execom.ca?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <>
      <Section>
        <div className="space-y-5 text-body text-fg/80">
          <p>
            Most inquiries are not a fit. That is not posturing — it reflects
            how narrow this work is.
          </p>
          <p>
            If you are exploring options, gathering information, or looking for
            someone to think out loud with, this is probably not the right
            channel.
          </p>
          <p>
            If you are facing a specific structural decision with real
            consequences, describe it below in plain language. Two or three
            sentences is enough if the thinking is clear.
          </p>
        </div>
      </Section>

      <Section className="mb-0">
        {submitted ? (
          <div className="text-body text-fg/70">
            <p>Received. If we can be useful, we will respond.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="decision"
                className="text-nav uppercase tracking-widest text-muted block mb-4"
              >
                What decision are you facing right now
              </label>
              <textarea
                id="decision"
                name="decision"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full bg-transparent border border-border rounded-none px-4 py-3 text-body text-fg resize-none focus:outline-none focus:border-fg transition-colors placeholder:text-muted/40"
                placeholder=""
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted/60 max-w-[280px]">
                Vague messages receive no reply. That is not indifference — it
                is respect for your time and ours.
              </p>
              <button
                type="submit"
                disabled={!message.trim()}
                className="text-nav uppercase tracking-widest text-muted hover:text-fg disabled:text-muted/30 transition-colors cursor-pointer disabled:cursor-default"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </Section>
    </>
  )
}
