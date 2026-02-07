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
      {/* ── HERO ── */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-[#195E8E]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[640px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Contact
            </p>
            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Most inquiries are not a fit.
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-[520px]">
              That is not posturing — it reflects how narrow this work is.
            </p>
            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* ── CONTEXT ── */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          <div className="space-y-4 text-body text-fg/80">
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
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="bg-surface-raised py-20 md:py-28">
        <div className="max-w-content mx-auto px-8">
          {submitted ? (
            <div className="bg-[#0d1b2a] border border-teal/20 px-8 py-12 text-center">
              <p className="text-teal text-nav uppercase tracking-widest mb-4">
                Received
              </p>
              <p className="text-body text-white/70">
                If we can be useful, we will respond.
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
                  className="w-full bg-white border border-border px-5 py-4 text-body text-fg resize-none focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 transition-all placeholder:text-muted/30"
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
                  className="bg-blue text-white text-nav uppercase tracking-widest px-8 py-4 hover:bg-blue/90 disabled:opacity-20 transition-all cursor-pointer disabled:cursor-default"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER NOTE ── */}
      <section className="bg-[#0d1b2a] py-16 md:py-20">
        <div className="max-w-content mx-auto px-8 text-center">
          <p className="text-caption text-white/20 uppercase tracking-widest">
            We respond to specifics. Vague inquiries go unanswered.
          </p>
        </div>
      </section>
    </>
  )
}
