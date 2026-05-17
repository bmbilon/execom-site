'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  FileSpreadsheet,
  FolderOpen,
  Upload,
  ArrowRight,
  Lightbulb,
  Clock3,
} from 'lucide-react'

// ── Types ──

type Program = {
  id: string
  name: string
  fit: number
  rationale: string
  nextStep: string
}

type DiscoveryQuestion = {
  id: string
  label: string
  type: 'select' | 'textarea' | 'currency' | 'checkbox'
  options?: string[]
}

// ── Data ──

const PROGRAMS: Program[] = [
  {
    id: 'sred',
    name: 'SR&ED',
    fit: 91,
    rationale:
      'Strong fit based on technical uncertainty, iterative experimentation, and payroll-heavy R&D activity.',
    nextStep:
      'Map projects, staff, and supporting technical evidence into the draft claim builder.',
  },
  {
    id: 'ai-adoption',
    name: 'AI / Digital Modernization',
    fit: 74,
    rationale:
      'Likely fit if software, process automation, or data infrastructure investments are underway.',
    nextStep: 'Complete systems and implementation spend inventory.',
  },
  {
    id: 'export',
    name: 'Export / Market Expansion',
    fit: 58,
    rationale:
      'Potential fit if cross-border commercialization, channel development, or trade activity is in scope.',
    nextStep: 'Confirm target geographies, partners, and commercialization timeline.',
  },
]

const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: 'sector',
    label: 'Primary business sector',
    type: 'select',
    options: [
      'Software / AI',
      'Manufacturing',
      'Biotech / Health',
      'CleanTech',
      'AgTech',
      'Other',
    ],
  },
  {
    id: 'stage',
    label: 'Current innovation stage',
    type: 'select',
    options: [
      'Concept / Prototype',
      'Pilot',
      'Commercial but improving',
      'Scaling / Multi-site',
    ],
  },
  {
    id: 'spend',
    label: 'Approximate annual eligible innovation spend',
    type: 'currency',
  },
  {
    id: 'uncertainty',
    label:
      'What technical uncertainty or engineering challenge are you solving?',
    type: 'textarea',
  },
  {
    id: 'evidence',
    label:
      'Do you have technical records, experiments, commits, tickets, lab notes, or test data?',
    type: 'checkbox',
  },
]

const SAMPLE_PROJECTS = [
  {
    name: 'Peptide formulation optimization',
    stage: 'Evidence intake',
    completion: 78,
    lead: 'Brett Bilon',
    status: 'In progress',
  },
  {
    name: 'Automated claim narrative builder',
    stage: 'Eligibility scored',
    completion: 43,
    lead: 'execom AI',
    status: 'Drafting',
  },
  {
    name: 'Manufacturing process improvement',
    stage: 'Ready for review',
    completion: 92,
    lead: 'Client Ops',
    status: 'Review',
  },
]

const CHECKLIST = [
  'Company profile completed',
  'Project inventory created',
  'Payroll and contractor data mapped',
  'Evidence sources connected',
  'Technical uncertainty captured',
  'Experimentation timeline assembled',
  'Draft narratives generated',
  'Internal review completed',
  'Submission package exported',
]

const TABS = [
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'builder', label: 'Builder' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'review', label: 'Review' },
] as const

// ── Components ──

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string
  value: string
  detail: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue">
            {title}
          </p>
          <p className="mt-3 text-[1.5rem] font-serif text-[#1A1A1A]">
            {value}
          </p>
          <p className="mt-2 text-[13px] text-[#5A5A5A]">{detail}</p>
        </div>
        <div className="bg-surface-raised p-3 rounded-[6px]">
          <Icon className="h-5 w-5 text-[#5A5A5A]" />
        </div>
      </div>
    </div>
  )
}

function FitBadge({ fit }: { fit: number }) {
  const color =
    fit >= 80
      ? 'bg-emerald-100 text-emerald-700'
      : fit >= 60
        ? 'bg-blue/10 text-blue'
        : 'bg-amber-100 text-amber-700'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${color}`}
    >
      {fit}% fit
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-[6px] bg-[#E5E5E5] rounded-[3px]">
      <div
        className="h-full bg-blue rounded-[3px] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

// ── Main Page ──

export default function ScreenerPage() {
  const [activeTab, setActiveTab] = useState<string>('eligibility')

  // Intake state
  const [companyName, setCompanyName] = useState('Plume Science Inc.')
  const [industry, setIndustry] = useState('Beauty / Consumer Health')
  const [employees, setEmployees] = useState('12')
  const [annualSpend, setAnnualSpend] = useState('375000')
  const [uncertainty, setUncertainty] = useState(
    'Developing and validating formulations, delivery systems, and manufacturing methods where standard known approaches did not reliably achieve the target performance profile.'
  )
  const [sector, setSector] = useState('')
  const [stage, setStage] = useState('')
  const [hasEvidence, setHasEvidence] = useState(true)

  const readiness = useMemo(() => {
    let score = 35
    if (companyName) score += 10
    if (industry) score += 10
    if (Number(employees) > 0) score += 10
    if (Number(annualSpend) >= 100000) score += 15
    if (uncertainty.length > 80) score += 20
    return Math.min(score, 100)
  }, [companyName, industry, employees, annualSpend, uncertainty])

  const estimatedRange = useMemo(() => {
    const spend = Number(annualSpend) || 0
    const low = Math.round(spend * 0.18)
    const high = Math.round(spend * 0.36)
    return `$${low.toLocaleString()}–$${high.toLocaleString()}`
  }, [annualSpend])

  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded-[4px] px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass =
    'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            Eligibility Engine
          </p>
          <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">
            Claims operating system
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] text-[#5A5A5A] leading-relaxed">
            From program discovery through evidence capture, financial mapping,
            narrative assembly, and submission-ready review.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/portal/dashboard"
            className="text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
          >
            <Upload className="inline mr-2 h-4 w-4" />
            Upload source files
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <MetricCard
          title="Eligibility confidence"
          value="High"
          detail="Based on current intake profile and technical narrative coverage"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Estimated claim range"
          value={estimatedRange}
          detail="Preliminary model using current payroll and project assumptions"
          icon={BarChart3}
        />
        <MetricCard
          title="Evidence coverage"
          value="82%"
          detail="Portion of claim requirements with supporting documentation"
          icon={FolderOpen}
        />
        <MetricCard
          title="Submission readiness"
          value={`${readiness}%`}
          detail="Composite score across profile, evidence, spend, and project inputs"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* Command Center */}
        <div className="bg-white border border-[#E5E5E5] rounded-[6px]">
          <div className="p-8 pb-0">
            <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">
              Command center
            </h2>
            <p className="text-[13px] text-[#5A5A5A] mt-1">
              Eligibility assessment, claim building, evidence management, and
              review, all in one workflow.
            </p>
          </div>

          {/* Tabs */}
          <div className="px-8 pt-6">
            <div className="flex gap-1 border-b border-[#E5E5E5]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-[13px] font-semibold transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'text-blue border-blue'
                      : 'text-[#5A5A5A] border-transparent hover:text-[#1A1A1A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* ── Eligibility Tab ── */}
            {activeTab === 'eligibility' && (
              <div className="space-y-6">
                {/* Program Fit Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {PROGRAMS.map((program) => (
                    <div
                      key={program.id}
                      className="border border-[#E5E5E5] rounded-[6px] p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">
                          {program.name}
                        </h3>
                        <FitBadge fit={program.fit} />
                      </div>
                      <p className="text-[13px] text-[#5A5A5A] leading-relaxed">
                        {program.rationale}
                      </p>
                      <p className="mt-3 text-[13px] font-medium text-[#1A1A1A]">
                        Next: {program.nextStep}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Intake Form + AI Preview */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Company name</label>
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Industry</label>
                      <input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>
                          Employees involved
                        </label>
                        <input
                          value={employees}
                          onChange={(e) => setEmployees(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Annual innovation spend
                        </label>
                        <input
                          value={annualSpend}
                          onChange={(e) => setAnnualSpend(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-[1.5px] border-dashed border-[#E5E5E5] bg-surface-raised rounded-[6px] p-5">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1A1A]">
                      <Lightbulb className="h-4 w-4" /> Interpretation preview
                    </div>
                    <p className="mt-3 text-[13px] text-[#5A5A5A] leading-relaxed">
                      The system translates raw intake answers into structured
                      eligibility signals: technical uncertainty, systematic
                      investigation, and evidence sufficiency.
                    </p>
                    <div className="mt-4 bg-white rounded-[6px] p-4 border border-[#E5E5E5]">
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                        Current intake suggests a strong probability of SR&ED
                        relevance. The strongest driver is sustained iterative
                        product development with measurable experimentation and
                        technical unknowns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Builder Tab ── */}
            {activeTab === 'builder' && (
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Guided Intake */}
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Guided intake instrument
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Modular questions that feed normalized entities into the
                    claim database.
                  </p>
                  <div className="space-y-4">
                    {DISCOVERY_QUESTIONS.map((q) => (
                      <div key={q.id}>
                        <label className={labelClass}>{q.label}</label>
                        {q.type === 'select' && (
                          <select
                            value={
                              q.id === 'sector'
                                ? sector
                                : q.id === 'stage'
                                  ? stage
                                  : ''
                            }
                            onChange={(e) => {
                              if (q.id === 'sector') setSector(e.target.value)
                              if (q.id === 'stage') setStage(e.target.value)
                            }}
                            className={inputClass + ' bg-white'}
                          >
                            <option value="">Select</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        {q.type === 'textarea' && (
                          <textarea
                            value={uncertainty}
                            onChange={(e) => setUncertainty(e.target.value)}
                            rows={4}
                            className={inputClass + ' resize-none'}
                          />
                        )}
                        {q.type === 'currency' && (
                          <input
                            value={annualSpend}
                            onChange={(e) => setAnnualSpend(e.target.value)}
                            placeholder="250000"
                            className={inputClass}
                          />
                        )}
                        {q.type === 'checkbox' && (
                          <label className="flex items-center gap-3 border border-[#E5E5E5] rounded-[6px] p-4 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasEvidence}
                              onChange={(e) => setHasEvidence(e.target.checked)}
                              className="w-4 h-4 rounded border-[#E5E5E5] text-blue focus:ring-blue/20"
                            />
                            <span className="text-[14px] text-[#1A1A1A]">
                              Yes, source records exist and can be uploaded or
                              connected.
                            </span>
                          </label>
                        )}
                      </div>
                    ))}
                    <button className="w-full bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark transition-colors">
                      Save answers and score
                    </button>
                  </div>
                </div>

                {/* Draft Assembly */}
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Draft assembly
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Each answer populates claim-ready components: project
                    summaries, hypotheses, uncertainties, experiments, and
                    evidence references.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                        Auto-generated project framing
                      </p>
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                        During the claim period, the company undertook a
                        systematic program of development aimed at resolving
                        formulation and performance uncertainties not answerable
                        through routine engineering or publicly available
                        methods.
                      </p>
                    </div>
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                        Evidence linked
                      </p>
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                        14 commits, 6 test summaries, 3 formulation logs, 2
                        supplier reports, and 1 manufacturing troubleshooting
                        dossier mapped to the draft chronology.
                      </p>
                    </div>
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                        Human-review flags
                      </p>
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                        Clarify why prior known formulation pathways were
                        insufficient. Tighten the causal link between each
                        experiment cycle and the targeted technical advancement.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors">
                        Preview narrative
                      </button>
                      <button className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors flex items-center">
                        Run full draft
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Evidence Tab ── */}
            {activeTab === 'evidence' && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Evidence vault
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Drop files in, connect systems, and watch them get
                    categorized.
                  </p>
                  <div className="space-y-3">
                    {[
                      ['Payroll exports', 'Mapped', '15 files'],
                      ['Experiment logs', 'Mapped', '28 files'],
                      ['Invoices / contractors', 'Needs review', '9 files'],
                      ['Code / tickets / commits', 'Connected', 'GitHub / Jira'],
                    ].map(([name, status, qty]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between border border-[#E5E5E5] rounded-[6px] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-4 w-4 text-[#5A5A5A]" />
                          <div>
                            <p className="text-[14px] font-medium text-[#1A1A1A]">
                              {name}
                            </p>
                            <p className="text-[12px] text-[#5A5A5A]">{qty}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wide bg-surface-raised text-[#5A5A5A] px-2 py-0.5 rounded">
                          {status}
                        </span>
                      </div>
                    ))}

                    <div className="border-[1.5px] border-dashed border-[#E5E5E5] rounded-[6px] p-6 text-center">
                      <Upload className="mx-auto h-5 w-5 text-[#5A5A5A]" />
                      <p className="mt-3 text-[14px] font-medium text-[#1A1A1A]">
                        Drop files or connect systems
                      </p>
                      <p className="mt-1 text-[13px] text-[#5A5A5A]">
                        QuickBooks, payroll, Drive, GitHub, Jira, lab docs, SOP
                        revisions, and test outputs.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Classification logic
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Transform uploaded material into structured claim objects
                    with traceability.
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Project-to-evidence matching',
                        desc: 'Link records to project IDs by date ranges, people, tags, keywords, repository references, and accounting classes.',
                      },
                      {
                        title: 'Spend categorization',
                        desc: 'Split payroll, contractor, material, and overhead items into claim buckets with confidence scoring and exception queues.',
                      },
                      {
                        title: 'Narrative evidence support',
                        desc: 'Every drafted sentence retains underlying document references so review teams can defend the claim.',
                      },
                    ].map((item) => (
                      <details
                        key={item.title}
                        className="border border-[#E5E5E5] rounded-[6px] group"
                      >
                        <summary className="px-4 py-3 text-[14px] font-medium text-[#1A1A1A] cursor-pointer">
                          {item.title}
                        </summary>
                        <div className="px-4 pb-4 text-[13px] text-[#5A5A5A] leading-relaxed">
                          {item.desc}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Review Tab ── */}
            {activeTab === 'review' && (
              <div className="grid gap-5 md:grid-cols-2">
                {/* Readiness Checklist */}
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Readiness checklist
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Missing pieces are flagged to prevent premature exports.
                  </p>
                  <div className="space-y-2">
                    {CHECKLIST.map((item, idx) => {
                      const done = idx < 6
                      return (
                        <div
                          key={item}
                          className="flex items-center justify-between border border-[#E5E5E5] rounded-[6px] px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-[#5A5A5A]" />
                            )}
                            <span className="text-[13px] text-[#1A1A1A]">
                              {item}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                              done
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-[#5A5A5A]'
                            }`}
                          >
                            {done ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Submission Pack */}
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
                    Submission pack
                  </h3>
                  <p className="text-[13px] text-[#5A5A5A] mb-5">
                    Defensible, reviewable, exportable package.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A1A]">
                            Draft claim package
                          </p>
                          <p className="text-[12px] text-[#5A5A5A]">
                            Narratives, project summaries, expense mapping,
                            evidence appendix
                          </p>
                        </div>
                        <FileSpreadsheet className="h-4 w-4 text-[#5A5A5A]" />
                      </div>
                    </div>
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A1A]">
                            Exception queue
                          </p>
                          <p className="text-[12px] text-[#5A5A5A]">
                            7 line items require operator judgment before
                            finalization
                          </p>
                        </div>
                        <Clock3 className="h-4 w-4 text-[#5A5A5A]" />
                      </div>
                    </div>
                    <div className="bg-surface-raised rounded-[6px] p-4">
                      <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                        Final state supports export to internal review,
                        accountant package, and claimant-ready filing formats
                        without rebuilding anything manually.
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors">
                        Send to reviewer
                      </button>
                      <button className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors">
                        Export package
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Active Claim Files */}
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
            <h3 className="text-[1rem] font-serif text-[#1A1A1A] mb-1">
              Active claim files
            </h3>
            <p className="text-[13px] text-[#5A5A5A] mb-5">
              Each file moves through one visible, measurable pipeline.
            </p>
            <div className="space-y-4">
              {SAMPLE_PROJECTS.map((project) => (
                <div
                  key={project.name}
                  className="border border-[#E5E5E5] rounded-[6px] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">
                        {project.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#5A5A5A]">
                        Lead: {project.lead}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wide bg-surface-raised text-[#5A5A5A] px-2 py-0.5 rounded">
                      {project.status}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                    {project.stage}
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={project.completion} />
                  </div>
                  <p className="mt-1 text-[12px] text-[#5A5A5A]">
                    {project.completion}% complete
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* What to Build Next */}
          <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
            <h3 className="text-[1rem] font-serif text-[#1A1A1A] mb-1">
              What to automate next
            </h3>
            <p className="text-[13px] text-[#5A5A5A] mb-5">
              Highest-leverage areas for reducing operator time and increasing
              client completion rates.
            </p>
            <div className="space-y-3">
              <div className="bg-surface-raised rounded-[6px] p-4 text-[13px] text-[#1A1A1A] leading-relaxed">
                Adaptive branching so the intake changes based on company type,
                claim year, and evidence maturity.
              </div>
              <div className="bg-surface-raised rounded-[6px] p-4 text-[13px] text-[#1A1A1A] leading-relaxed">
                Connector pipelines for accounting, payroll, code repositories,
                tickets, and cloud storage.
              </div>
              <div className="bg-surface-raised rounded-[6px] p-4 text-[13px] text-[#1A1A1A] leading-relaxed">
                Review engine that flags weak narratives, duplicate evidence,
                thin experimental logic, and unsupported expense allocations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
