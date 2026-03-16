"use client"

import { useState } from "react"

interface AccordionItem {
  title: string
  content: React.ReactNode
}

interface AccordionSectionProps {
  items: AccordionItem[]
  /** Use "dark" on dark backgrounds, "light" on light backgrounds */
  variant?: "light" | "dark"
}

export function AccordionSection({ items, variant = "light" }: AccordionSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  const isDark = variant === "dark"

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={`border-b ${isDark ? "border-white/10" : "border-border"}`}
          >
            <button
              onClick={() => toggle(i)}
              className={`w-full flex items-center justify-between py-5 text-left transition-colors duration-200 group ${
                isDark
                  ? "text-white/80 hover:text-teal"
                  : "text-fg/80 hover:text-blue"
              }`}
              aria-expanded={isOpen}
            >
              <span className="text-body font-medium pr-4">{item.title}</span>
              <span
                className={`flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                } ${isDark ? "text-teal" : "text-blue"}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="1" x2="7" y2="13" />
                  <line x1="1" y1="7" x2="13" y2="7" />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-[1000px] opacity-100 pb-6" : "max-h-0 opacity-0"
              }`}
            >
              <div className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-fg/60"}`}>
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
