'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import ProjectCard from '@/components/portal/ProjectCard'
import { Toaster, toast } from 'sonner'

interface ProjectsClientProps {
  yearId: string
  companyId: string
  projects: {
    id: string
    name: string
    code: string | null
    status: string
    objective: string | null
    claim_year_id: string
  }[]
  costCounts: Record<string, number>
  evidenceCounts: Record<string, number>
}

export default function ProjectsClient({
  yearId,
  companyId,
  projects,
  costCounts,
  evidenceCounts,
}: ProjectsClientProps) {
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)

    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({
      claim_year_id: yearId,
      company_id: companyId,
      name: name.trim(),
      code: code.trim() || null,
      sort_order: projects.length,
    })

    if (error) {
      toast.error(error.message)
      setCreating(false)
      return
    }

    // Auto-advance claim status from draft to in_progress
    await supabase
      .from('claim_years')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', yearId)
      .eq('status', 'draft')

    setName('')
    setCode('')
    setShowNew(false)
    setCreating(false)
    toast.success('Project created')
    router.refresh()
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
          Projects ({projects.length})
        </p>
        <button
          onClick={() => setShowNew(true)}
          className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors"
        >
          New Project
        </button>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
                placeholder="e.g. Machine Learning Pipeline"
              />
            </div>
            <div className="w-[140px]">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
                placeholder="PROJ-01"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-[14px] text-[#5A5A5A] py-2.5 px-4 hover:text-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A]">
            No projects yet. Each SR&ED project needs its own T661 narrative describing the technological uncertainty and work performed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              costCount={costCounts[project.id] || 0}
              evidenceCount={evidenceCounts[project.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
