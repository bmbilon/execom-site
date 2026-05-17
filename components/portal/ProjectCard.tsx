'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    code: string | null
    status: string
    objective: string | null
    claim_year_id: string
  }
  costCount: number
  evidenceCount: number
}

export default function ProjectCard({ project, costCount, evidenceCount }: ProjectCardProps) {
  return (
    <Link
      href={`/portal/claims/${project.claim_year_id}/projects/${project.id}`}
      className="portal-card p-8 hover:shadow-sm transition-shadow block"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          {project.code && (
            <span className="text-[12px] font-mono text-[#5A5A5A]">{project.code}</span>
          )}
          <h3 className="text-[1rem] font-semibold text-[#1A1A1A]">{project.name}</h3>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {project.objective && (
        <p className="text-[13px] text-[#5A5A5A] line-clamp-2 mb-4">
          {project.objective}
        </p>
      )}

      <div className="flex gap-4 text-[12px] text-[#5A5A5A]">
        <span>{costCount} cost{costCount !== 1 ? 's' : ''}</span>
        <span>{evidenceCount} evidence</span>
      </div>
    </Link>
  )
}
