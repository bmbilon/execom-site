import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import {
  SECTIONS,
  PATH_LABELS,
  PATH_PRICE_RANGES,
  TIER_LABELS,
  LEAD_TYPE_LABELS,
  type AnswerMap,
  type QuestionDef,
  type ScoreResult,
} from './prototype-readiness'

// Two exports come out of this file, driven by `includeInternal`:
//
//   client   — founder-facing. Their answers and nothing else. Safe to
//              forward, attach to an email, or hand to a third party.
//   internal — staff-facing. Adds score, tier, lead type, recommended
//              path, signals, and internal notes.
//
// The split is enforced here rather than at the call site so a future
// caller cannot leak internal fields by passing the wrong flag shape.

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1A1A1A',
  },
  header: {
    fontSize: 8,
    color: '#5A5A5A',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#5A5A5A',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 3,
  },
  meta: {
    fontSize: 9,
    color: '#8A8A8A',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    marginTop: 22,
    marginBottom: 3,
  },
  sectionBlurb: {
    fontSize: 9,
    color: '#5A5A5A',
    marginBottom: 12,
  },
  label: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  answer: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  answerEmpty: {
    fontSize: 10,
    color: '#A8A8A8',
    fontFamily: 'Helvetica-Oblique',
  },
  qaBlock: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 10,
  },
  internalBanner: {
    backgroundColor: '#FDF3E3',
    borderWidth: 1,
    borderColor: '#E5C07B',
    padding: 8,
    marginBottom: 18,
  },
  internalBannerText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#8A6100',
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 10,
    marginRight: 8,
  },
  statLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 10,
  },
  statLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  statSub: {
    fontSize: 8,
    color: '#5A5A5A',
    marginTop: 3,
  },
  signalItem: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 3,
  },
  notesBox: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 10,
    marginTop: 6,
  },
})

export interface SubmissionPdfData {
  productName: string | null
  founderName: string | null
  founderEmail: string | null
  companyName: string | null
  submittedAt: string | null
  status: string | null
  answers: AnswerMap
  // Only read when includeInternal is true.
  score?: ScoreResult
  internalNotes?: string | null
}

// Mirrors the AnswerRow display logic on the admin detail page so the PDF
// and the screen never disagree about what an answer says.
function formatAnswer(question: QuestionDef, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null

  if (
    question.type === 'select' ||
    question.type === 'yes_no' ||
    question.type === 'yes_no_unsure'
  ) {
    const opt = question.options?.find((o) => o.value === value)
    return opt ? opt.label : String(value)
  }

  if (question.type === 'multi_select' && Array.isArray(value)) {
    return (value as string[])
      .map((v) => question.options?.find((o) => o.value === v)?.label ?? v)
      .join(', ')
  }

  if (question.type === 'currency' && typeof value === 'number') {
    return `$${value.toLocaleString()}`
  }

  return String(value)
}

function SubmissionPdf({
  data,
  includeInternal,
}: {
  data: SubmissionPdfData
  includeInternal: boolean
}) {
  const product = data.productName || 'Untitled product'
  const submitted = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString('en-CA')
    : 'Not submitted (draft)'
  const contact = [data.founderName, data.founderEmail, data.companyName]
    .filter(Boolean)
    .join(' · ')

  const footerText = includeInternal
    ? 'execom internal · Prototype Readiness · not for distribution'
    : 'execom · Prototype Readiness submission'

  return (
    <Document
      title={`Prototype Readiness - ${product}`}
      author="execom"
      subject="Prototype Readiness submission"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.header}>
          execom · Prototype Readiness · Submission
        </Text>

        {includeInternal ? (
          <View style={styles.internalBanner}>
            <Text style={styles.internalBannerText}>
              INTERNAL COPY — contains execom scoring and staff notes. Do not
              send to the founder or any third party.
            </Text>
          </View>
        ) : null}

        <Text style={styles.title}>{product}</Text>
        {contact ? <Text style={styles.subtitle}>{contact}</Text> : null}
        <Text style={styles.meta}>Submitted {submitted}</Text>
        {data.status ? (
          <Text style={styles.meta}>
            Status: {String(data.status).replace(/_/g, ' ')}
          </Text>
        ) : null}

        {includeInternal && data.score ? (
          <View style={{ marginTop: 18 }}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Internal score</Text>
                <Text style={styles.statValue}>{data.score.score} / 100</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Tier</Text>
                <Text style={styles.statValue}>
                  {TIER_LABELS[data.score.tier]}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Lead type</Text>
                <Text style={styles.statValue}>
                  {LEAD_TYPE_LABELS[data.score.leadType]}
                </Text>
              </View>
              <View style={styles.statLast}>
                <Text style={styles.statLabel}>Recommended path</Text>
                <Text style={styles.statValue}>
                  {PATH_LABELS[data.score.recommendedPath]}
                </Text>
                <Text style={styles.statSub}>
                  {PATH_PRICE_RANGES[data.score.recommendedPath]}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Positive signals</Text>
            {data.score.signals.positive.length === 0 ? (
              <Text style={styles.answerEmpty}>None detected.</Text>
            ) : (
              data.score.signals.positive.map((s) => (
                <Text key={s} style={styles.signalItem}>
                  • {s}
                </Text>
              ))
            )}

            <Text style={styles.sectionTitle}>Risks</Text>
            {data.score.signals.risks.length === 0 ? (
              <Text style={styles.answerEmpty}>None detected.</Text>
            ) : (
              data.score.signals.risks.map((s) => (
                <Text key={s} style={styles.signalItem}>
                  • {s}
                </Text>
              ))
            )}

            <Text style={styles.sectionTitle}>Internal notes</Text>
            <View style={styles.notesBox}>
              <Text
                style={
                  data.internalNotes ? styles.answer : styles.answerEmpty
                }
              >
                {data.internalNotes || 'No internal notes recorded.'}
              </Text>
            </View>
          </View>
        ) : null}

        {SECTIONS.map((section) => (
          <View key={section.id} break={false}>
            <Text style={styles.sectionTitle}>{section.label}</Text>
            <Text style={styles.sectionBlurb}>{section.blurb}</Text>
            {section.questions.map((q) => {
              const formatted = formatAnswer(q, data.answers[q.id])
              return (
                <View key={q.id} style={styles.qaBlock} wrap={false}>
                  <Text style={styles.label}>{q.label}</Text>
                  <Text style={formatted ? styles.answer : styles.answerEmpty}>
                    {formatted ?? 'No answer'}
                  </Text>
                </View>
              )
            })}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {footerText}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateSubmissionPdf(
  data: SubmissionPdfData,
  options: { includeInternal: boolean }
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <SubmissionPdf data={data} includeInternal={options.includeInternal} />
  )
  return Buffer.from(buffer)
}
