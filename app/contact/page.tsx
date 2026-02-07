"use client"

import { useState } from "react"

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent("Execom inquiry")
    const body = encodeURIComponent(message)
    window.location.href = `mailto:brett@execom.ca?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <>
      <section className="mb-16 pt-8">
        <p className="hero-text">Most inquiries are not a fit.</p>
        <div className="hero-rule" />
      </section>

      <section className="mb-16">
        <div className="space-y-4 text-body text-fg/80">
          <p>
            That is not posturing — it reflects how narrow this work is.
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
      </section>

      <section>
        {submitted ? (
          <div className="bg-surface-raised border border-teal/20 rounded-sm px-6 py-8">
            <p className="text-body text-fg/80">
              Received. If we can be useful, we will respond.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="decision" className="section-label">
                What decision are you facing right now
              </label>
              <textarea
                id="decision"
                name="decision"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full bg-white/60 border border-border px-5 py-4 text-body text-fg resize-none focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 transition-all placeholder:text-muted/30"
              />
            </div>
            <div className="flex items-center justify-between gap-8">
              <p className="text-caption uppercase tracking-widest text-muted/50 max-w-[320px]">
                Vague messages receive no reply. That is not indifference — it
                is respect for your time and ours.
              </p>
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-blue text-white text-nav uppercase tracking-widest px-6 py-3 hover:bg-blue/90 disabled:opacity-20 transition-all cursor-pointer disabled:cursor-default"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  )
}
