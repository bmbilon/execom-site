'use client'

import Link from 'next/link'

interface DashboardTileProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export default function DashboardTile({ title, description, icon, href }: DashboardTileProps) {
  return (
    <Link
      href={href}
      className="group bg-white border border-[#E5E5E5] rounded-lg p-6 hover:border-[#195E8E]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="w-10 h-10 rounded-lg bg-[#195E8E]/5 flex items-center justify-center mb-4 group-hover:bg-[#195E8E]/10 transition-colors">
            {icon}
          </div>
          <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1.5 group-hover:text-[#195E8E] transition-colors">
            {title}
          </h3>
          <p className="text-[13px] text-[#5A5A5A] leading-relaxed">
            {description}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-[#b8b8b0] mt-1 flex-shrink-0 ml-4 group-hover:text-[#195E8E] group-hover:translate-x-0.5 transition-all"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  )
}
