'use client'

import Link from 'next/link'
import DashboardTile from '@/components/portal/DashboardTile'
import MarketableRangeTile from '@/components/portal/MarketableRangeTile'

interface DashboardProps {
  fullName: string
  hasCompany: boolean
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
// Rendered on a gradient-blue badge inside DashboardTile, so strokes are
// `currentColor` and the badge sets `text-white` on the wrapping span.

const ICON_PROPS = {
  className: 'w-[22px] h-[22px]',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function CompanySetupIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008V10.5zm0 3h.008v.008h-.008V13.5z" />
    </svg>
  )
}

function SREDIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PrototypingIcon() {
  // Beaker — physical / experimental / build-related
  return (
    <svg {...ICON_PROPS}>
      <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

function TrademarkIcon() {
  // Shield with checkmark — security / registration
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function ConceptValidationIcon() {
  // Target / bullseye — "did we hit it?" — semantic for validation
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function BusinessPlanningIcon() {
  // Presentation chart — strategy / planning / roadmap
  return (
    <svg {...ICON_PROPS}>
      <path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardClient({ fullName, hasCompany }: DashboardProps) {
  // Once company is set up, hide the "Company Setup" tile so it doesn't
  // imply they need to redo it. They can still reach the form via the
  // direct URL if they need to edit details.
  void hasCompany

  return (
    <div>
      <div className="mb-10">
        <h1 className="portal-title text-[1.75rem] font-serif mb-1">
          {fullName ? `Hi ${fullName.split(' ')[0]},` : 'Hi there,'} pick where to begin.
        </h1>
        <p className="portal-body text-[14px]">
          Each tile takes you into a focused workflow. New here? Start with Company Setup or Prototyping.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Hidden soft-launch tile: renders only when
            NEXT_PUBLIC_MARKETABLE_RANGE_PORTAL_TILE_ENABLED === "true". */}
        <MarketableRangeTile />
        <DashboardTile
          title="Company Setup"
          description="Register your company profile so you can access SR&ED, IP, and corporate filings."
          icon={<CompanySetupIcon />}
          href="/portal/company-setup"
        />
        <DashboardTile
          title="SR&ED"
          description="Prepare and manage SR&ED tax credit claims."
          icon={<SREDIcon />}
          href="/portal/sred"
        />
        <DashboardTile
          title="Prototyping"
          description="Pressure-test a product idea before tooling and find the right next step."
          icon={<PrototypingIcon />}
          href="/portal/prototype-readiness"
        />
        <DashboardTile
          title="Trademarks"
          description="File and manage Canadian and US trademark applications."
          icon={<TrademarkIcon />}
          href="/portal/matters/new?type=trademark"
        />
        <DashboardTile
          title="Concept Validation"
          description="Test whether real buyers will pay for an idea before you build it."
          icon={<ConceptValidationIcon />}
          href="/portal/coming-soon?module=concept-validation"
        />
        <DashboardTile
          title="Business Planning"
          description="Build a defensible business plan, financial model, and go-to-market roadmap."
          icon={<BusinessPlanningIcon />}
          href="/portal/coming-soon?module=business-planning"
        />
      </div>

      <p className="mt-10 text-[12px] text-[#b8b8b0]">
        Need something else? <Link href="/engage" className="text-blue hover:underline">Talk with execom</Link>.
      </p>
    </div>
  )
}
