import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { practicum } from './config'

type Section = { title: string; paragraphs: string[] }
type Packet = {
  id: string
  reference: string
  participant: string
  employer: string
  courseVersion: number | null
  course: Record<string, unknown>
  cohort: Record<string, unknown> | null
  sponsorBrief: { summary?: string; outcome?: string } | null
  triage: { unresolved: string[]; source: string; governmentPortal: string }
  generatedAt: string
}
const plain = (value: unknown) =>
  String(value ?? 'Not yet confirmed')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[^\x20-\x7e\xa0-\xff\n]/g, '?')

export async function renderDocument(
  title: string,
  subtitle: string,
  sections: Section[],
  reference = 'Program information',
) {
  const pdf = await PDFDocument.create(),
    font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  pdf.setTitle(title)
  pdf.setAuthor('execom')
  pdf.setSubject('Executive AI Practicum')
  pdf.setLanguage('en-CA')
  let page = pdf.addPage([612, 792]),
    y = 0
  const navy = rgb(0.035, 0.075, 0.12),
    ink = rgb(0.1, 0.16, 0.21),
    muted = rgb(0.35, 0.41, 0.46),
    cyan = rgb(0.12, 0.43, 0.49)
  function header(first = false) {
    page.drawRectangle({ x: 0, y: 718, width: 612, height: 74, color: navy })
    page.drawText('execom  /  EXECUTIVE AI PRACTICUM', {
      x: 46,
      y: 750,
      size: 11,
      font: bold,
      color: rgb(0.88, 0.95, 0.96),
    })
    page.drawText(plain(reference).slice(0, 90), {
      x: 46,
      y: 732,
      size: 8,
      font,
      color: rgb(0.64, 0.72, 0.77),
    })
    y = first ? 681 : 684
  }
  function next() {
    page = pdf.addPage([612, 792])
    header()
  }
  function lines(text: string, size: number, width = 520) {
    const out: string[] = []
    for (const para of plain(text).split('\n')) {
      let line = ''
      for (const word of para.split(/\s+/)) {
        if (
          font.widthOfTextAtSize((line ? line + ' ' : '') + word, size) <= width
        ) {
          line += (line ? ' ' : '') + word
          continue
        }
        if (line) out.push(line)
        line = ''
        for (const char of word) {
          if (font.widthOfTextAtSize(line + char, size) > width) {
            out.push(line)
            line = ''
          }
          line += char
        }
      }
      out.push(line)
    }
    return out
  }
  function text(value: string, size = 10.5, isBold = false, color = ink) {
    const wrapped = lines(value, size),
      height = wrapped.length * size * 1.48 + 7
    if (height < 600 && y - height < 65) next()
    for (const line of wrapped) {
      if (y < 65) next()
      page.drawText(line, { x: 46, y, size, font: isBold ? bold : font, color })
      y -= size * 1.48
    }
    y -= 7
  }
  header(true)
  text(title, 24, true)
  text(subtitle, 11, false, muted)
  y -= 10
  for (const section of sections) {
    if (y < 140) next()
    text(section.title, 13, true, cyan)
    for (const p of section.paragraphs) text(p)
    y -= 8
  }
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: 46, y: 42 },
      end: { x: 566, y: 42 },
      thickness: 0.5,
      color: rgb(0.8, 0.84, 0.87),
    })
    p.drawText(
      'execom | Preparation material. Confirm scope and terms before enrolment.',
      { x: 46, y: 28, font, size: 7.5, color: muted },
    )
    p.drawText(`${i + 1} / ${pages.length}`, {
      x: 537,
      y: 28,
      font,
      size: 8,
      color: muted,
    })
  })
  return pdf.save()
}
const programSections: Section[] = [
  {
    title: 'The working offer',
    paragraphs: [
      'Bring one business process. Leave with a working AI system. Work with Brett Bilon, a Calgary entrepreneur who uses AI systems and agents across his own businesses.',
      'Starting tuition: C$10,000 per participant, plus applicable tax. Four to six executives per cohort, with a maximum of six. Ten weekly 60-minute working sessions. Target 15-30 minutes of executive review/application between sessions.',
    ],
  },
  {
    title: 'What the project produces',
    paragraphs: [
      'A bounded, employer-approved working system; baseline and result comparison; operating instructions and safeguards; and an employer acceptance review. Each project has an agreed owner, outcome and acceptance criteria.',
      'The executive time commitment is not the total delivery effort. Provider build allowance, internal staff contributions, software, integrations and ongoing support must be scoped before enrolment.',
    ],
  },
  {
    title: 'Learning and assessment',
    paragraphs: [
      'Scope and baseline: define the process, permissions and useful result. Build and test: work with approved tools and representative inputs. Evaluate: check quality, traceability, risk and performance. Handoff: demonstrate, document and review with the employer.',
      'Completion evidence: working demonstration, baseline/result comparison, operating documentation and employer acceptance review. Formal certification or accreditation is not claimed.',
    ],
  },
  {
    title: 'Admissions and availability',
    paragraphs: [
      'Apply with a recurring process you own and an employer sponsor who can authorize the work. HR may enquire before nominees are known; every participant receives an individual project review.',
      'Cohort dates, contracting/training entity, delivery scope and commercial terms are confirmed during admission. Applications do not reserve seats. Consult the current availability at execom.ca/executive-ai.',
    ],
  },
]
export function programDocument() {
  return renderDocument(
    'One process. Ten weeks.',
    'Program brief | Working offer, 6 October 2026',
    programSections,
  )
}
export function sponsorDocument() {
  return renderDocument(
    'Employer sponsorship brief',
    'A discussion guide for the executive, HR and the project sponsor.',
    [
      programSections[0],
      {
        title: 'Before you sponsor a participant',
        paragraphs: [
          'Identify the process owner, recurring decision or output, and the business friction worth improving. Agree a manageable boundary and how a useful result will be measured.',
          'Confirm the participant can attend ten weekly sessions. Identify any internal staff time, IT/security review, software costs and operating support required.',
          'Approve the tools and data permitted for the work. Define what must remain private and the human review required before using outputs.',
        ],
      },
      {
        title: 'What to confirm in the offer',
        paragraphs: [
          'Legal training/contracting entity and provider contact; actual cohort dates and schedule; C$10,000 starting tuition plus applicable tax; provider build allowance; staff, software and integration responsibilities; cancellation and refund terms; IP and data handling; and employer acceptance criteria.',
        ],
      },
      {
        title: 'Optional grant preparation',
        paragraphs: [
          'CAPG funding and execom provider/course eligibility remain unconfirmed. Owners, shareholders and employer board members are ineligible trainees under CAPG, but may still apply with private funding.',
          'An authorized employer applies through the official government portal before training begins. Never share government account passwords with execom.',
          'Official requirements: ' + practicum.grantSource,
          'Government portal: https://capg.alberta.ca/',
        ],
      },
    ],
  )
}
export function grantDocument(packet: Packet) {
  const c = packet.course,
    cohort = packet.cohort
  return renderDocument(
    'Employer funding preparation',
    'CAPG manual employer handoff | Not submitted to government',
    [
      {
        title: 'This package',
        paragraphs: [
          `Participant: ${packet.participant}\nEmployer: ${packet.employer}\nApplication: ${packet.reference}\nPackage: ${packet.id}\nCreated: ${packet.generatedAt}\nCourse version: ${packet.courseVersion ?? 'Draft program information; no approved version'}`,
          'This is a preparation snapshot. It is not a funding decision, an approved-provider claim, or evidence of government submission. No government API submission is connected.',
        ],
      },
      {
        title: 'Training provider and course',
        paragraphs: [
          `Program: ${practicum.name}\nLead: ${practicum.instructor}\nContracting/training entity: ${c.legalEntity || 'UNRESOLVED'}\nProvider address: ${c.providerAddress || 'UNRESOLVED'}`,
          `Learning plan: ${c.curriculum}\nAssessment: ${c.assessment}`,
          `Build allowance: ${c.buildAllowance || 'UNRESOLVED'}\nSoftware/integrations: ${c.softwareAndIntegrations || 'UNRESOLVED'}`,
        ],
      },
      {
        title: 'Schedule and itemized costs',
        paragraphs: [
          cohort
            ? `Cohort: ${cohort.name}\nLocation: ${cohort.location}\nStart: ${cohort.starts_at}\nEnd: ${cohort.ends_at}\nInstructional hours: ${cohort.instructional_hours}\nSchedule: ${cohort.schedule}`
            : 'Dates and cohort are not yet confirmed. Planned format: ten weekly 60-minute sessions. Do not assume all delivery/build effort is eligible instructional time.',
          `Starting total: C$10,000 plus applicable tax.\nInstruction allocation: ${c.trainingCostCAD == null ? 'UNRESOLVED' : `C$${c.trainingCostCAD}`}\nBuild/implementation allocation: ${c.buildCostCAD == null ? 'UNRESOLVED' : `C$${c.buildCostCAD}`}`,
          'Funding is based on eligible costs, not automatically the full offer. For an eligible existing employee, CAPG may reimburse 50% of eligible training costs up to C$5,000. Employee wages are not eligible. Do not present C$5,000 as the participant price.',
        ],
      },
      {
        title: 'Project brief released for employer review',
        paragraphs: [
          packet.sponsorBrief?.summary ||
            'No project description has been released by the applicant.',
          packet.sponsorBrief?.outcome ||
            'No outcome description has been released by the applicant.',
        ],
      },
      {
        title: 'Unresolved items and employer checklist',
        paragraphs: packet.triage.unresolved.map((s, i) => `${i + 1}. ${s}`),
      },
      {
        title: 'Employer handoff and evidence',
        paragraphs: [
          '1. Confirm employer, participant, provider and course eligibility against the current guidelines. Resolve the items above with admissions.',
          '2. Use your own Alberta.ca Account for Organizations and register the business in the CAPG portal. Keep government passwords and banking records out of execom.',
          '3. The employer completes and submits the government application before training starts. Retain the receipt/reference and the dated decision.',
          '4. Report the receipt or decision in the practicum workspace with its reference. The workspace labels this as an employer report unless staff records an evidence review.',
          '5. Retain attendance, completion/assessment evidence, invoices and proof of payment as required by the government. These records are not fabricated in advance.',
          'Official requirements: ' + packet.triage.source,
          'Official submission portal: ' + packet.triage.governmentPortal,
          `Government guidance reviewed: ${practicum.grantReviewed}. Verify current requirements before applying.`,
        ],
      },
    ],
    packet.reference + ' | Private employer package',
  )
}
