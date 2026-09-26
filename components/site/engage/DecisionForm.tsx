"use client"

import { useId, useState } from "react"
import { ArrowRight, Check } from "lucide-react"

const EMAIL = "brett@execom.ca"

/**
 * Plain-language intake. Opens the visitor's email client with the message
 * pre-filled (same mechanism as the previous contact page).
 */
export function DecisionForm({ subject = "execom inquiry" }: { subject?: string }) {
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const id = useId()
  const words = message.trim() ? message.trim().split(/\s+/).length : 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    window.location.href = href
    setSent(true)
  }

  if (sent) {
    return (
      <div className="s-edge p-8 md:p-10" role="status">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 ring-1 ring-cyan-400/40">
          <Check className="h-5 w-5 text-cyan-300" aria-hidden />
        </span>
        <p className="mt-5 text-[1.3rem] font-semibold tracking-[-0.01em] text-snow">Received</p>
        <p className="mt-2 text-[15px] leading-relaxed text-haze">
          Your email client should have opened with the message ready to send. If we can be useful, we will respond.
        </p>
        <p className="mt-4 text-[13.5px] text-fog">
          Nothing opened? Email{" "}
          <a href={`mailto:${EMAIL}`} className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-4">
            {EMAIL}
          </a>{" "}
          directly.
        </p>
        <button type="button" onClick={() => setSent(false)} className="s-link mt-6 text-[14px]">
          Edit the message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="s-edge p-6 md:p-8">
      <label htmlFor={id} className="s-eyebrow">
        What decision are you facing right now?
      </label>
      <textarea
        id={id}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={6}
        placeholder="Two or three sentences is enough if the thinking is clear."
        className="mt-4 w-full resize-none rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-3.5 text-[15.5px] leading-relaxed text-snow outline-none transition-colors placeholder:text-fog/70 focus:border-cyan-500/60 focus:bg-white/[0.045] focus:ring-4 focus:ring-cyan-500/10"
      />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[40ch] text-[12.5px] leading-relaxed text-fog">
          Vague messages receive no reply. That is respect for your time and ours.
        </p>
        <div className="flex items-center gap-4">
          <span className="s-mono text-[11px] text-fog" aria-hidden>
            {words} {words === 1 ? "word" : "words"}
          </span>
          <button type="submit" disabled={!message.trim()} className="s-btn s-btn-primary">
            Send
            <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </form>
  )
}
