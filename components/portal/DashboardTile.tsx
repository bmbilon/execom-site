'use client'

import Link from 'next/link'

interface DashboardTileProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

// Premium tile treatment — uses the .dashboard-card liquid-glass system
// from globals.css for the surface (translucent layered glass, machined
// edges, cyan top-left bloom, hover lift) and pairs it with a glossy
// blue→teal icon badge. Tile content sits above the card pseudo-elements
// via `relative z-[1]` on the inner wrapper.
export default function DashboardTile({
  title,
  description,
  icon,
  href,
}: DashboardTileProps) {
  return (
    <Link href={href} className="group dashboard-card block p-6">
      {/* Top-edge teal hairline that fades in on hover. Subtle "alive" cue. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-[2]"
        style={{
          background:
            'linear-gradient(90deg, rgba(80,196,210,0) 0%, rgba(80,196,210,0.7) 50%, rgba(80,196,210,0) 100%)',
        }}
      />

      <div className="relative z-[1] flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Glossy icon badge */}
          <div
            className="relative w-12 h-12 rounded-[10px] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-[1.03]"
            style={{
              background:
                'linear-gradient(135deg, #195E8E 0%, #2A7FB5 55%, #50C4D2 100%)',
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.25) inset, 0 6px 16px rgba(25, 94, 142, 0.28), 0 1px 2px rgba(25, 94, 142, 0.20)',
            }}
          >
            {/* Soft top-sheen overlay — implies a glossy surface. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1.5 top-1 h-3 rounded-t-[8px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
              }}
            />
            <span className="relative text-white">{icon}</span>
          </div>

          <h3 className="portal-title text-[16px] font-semibold mb-1.5 tracking-tight group-hover:text-[#195E8E] transition-colors">
            {title}
          </h3>
          <p className="portal-body text-[13px]">
            {description}
          </p>
        </div>

        <svg
          className="w-4 h-4 text-[#b8b8b0] mt-1 flex-shrink-0 ml-4 group-hover:text-[#195E8E] group-hover:translate-x-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </Link>
  )
}
