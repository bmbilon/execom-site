import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

const CREDENTIALS = [
  "Built and launched Plume, a global beauty brand carried by Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws",
  "Raised capital across the full spectrum, from consumer crowdfunding to institutional debt",
  "Enterprise sales and strategic partnerships at Lexmark, Iron Mountain, and DATA Communications Management",
  "B.Comm, Entrepreneurship and Innovation, Haskayne School of Business, University of Calgary",
]

export function FounderCard() {
  return (
    <div className="s-edge overflow-hidden">
      <div className="relative aspect-[1000/778]">
        <Image
          src="/brett-bilon.jpg"
          alt="Brett Bilon, founder and CEO of execom"
          fill
          sizes="(min-width: 1024px) 680px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111b] via-[#07111b]/10 to-transparent" aria-hidden />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <p className="s-eyebrow">Founder &amp; CEO</p>
          <p className="mt-2 font-display text-[2rem] leading-none tracking-[-0.02em] text-snow md:text-[2.4rem]">Brett Bilon</p>
        </div>
      </div>
      <ul className="grid gap-3 p-6 md:p-8">
        {CREDENTIALS.map((c) => (
          <li key={c} className="grid grid-cols-[14px_1fr] gap-3 text-[14.5px] leading-relaxed text-haze">
            <span className="mt-[9px] h-px w-2.5 bg-cyan-400" aria-hidden />
            {c}
          </li>
        ))}
      </ul>
      <div className="border-t border-white/[0.07] px-6 py-4 md:px-8">
        <a href="https://ca.linkedin.com/in/brettbilon" target="_blank" rel="noopener noreferrer" className="s-link text-[14px]">
          LinkedIn
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  )
}
