import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { ClaimJson } from './claim-builder'

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
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#195E8E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#195E8E',
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableCell: {
    fontSize: 9,
    paddingRight: 8,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    paddingRight: 8,
  },
})

interface PdfExportProps {
  claim: ClaimJson
}

function ClaimPdf({ claim }: PdfExportProps) {
  const companyName = claim.company.name

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={{ marginTop: 120 }}>
          <Text style={styles.coverTitle}>SR&ED Claim Package</Text>
          <Text style={styles.coverSubtitle}>{companyName}</Text>
          <Text style={{ fontSize: 14, color: '#1A1A1A', marginBottom: 4 }}>
            Fiscal Year {claim.company.fiscal_year}
          </Text>
          <Text style={{ fontSize: 10, color: '#5A5A5A', marginTop: 20 }}>
            Generated {new Date(claim.generated_at).toLocaleDateString('en-CA')}
          </Text>
        </View>
        <Text style={styles.footer}>
          Prepared by {companyName} via execom SR&ED Portal
        </Text>
      </Page>

      {/* Table of Contents */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Table of Contents</Text>
        <Text style={styles.text}>1. Claim Summary</Text>
        {claim.projects.map((p, i) => (
          <Text key={i} style={styles.text}>
            {i + 2}. Project: {p.code ? `${p.code} — ` : ''}{p.name}
          </Text>
        ))}
        <Text style={styles.text}>{claim.projects.length + 2}. Evidence Index</Text>
        <Text style={styles.footer}>
          Prepared by {companyName} via execom SR&ED Portal
        </Text>
      </Page>

      {/* Claim Summary */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Claim Summary</Text>

        <Text style={styles.label}>Company</Text>
        <Text style={styles.text}>{claim.company.legal_name || claim.company.name}</Text>

        {claim.company.bn && (
          <>
            <Text style={styles.label}>Business Number</Text>
            <Text style={styles.text}>{claim.company.bn}</Text>
          </>
        )}

        <Text style={styles.label}>Fiscal Year</Text>
        <Text style={styles.text}>{claim.company.fiscal_year}</Text>

        <Text style={{ ...styles.sectionTitle, fontSize: 12, marginTop: 16 }}>
          Expenditures by Category
        </Text>

        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableCellBold, width: 200 }}>Category</Text>
          <Text style={{ ...styles.tableCellBold, width: 150 }}>Amount</Text>
        </View>

        {[
          ['Salary', claim.totals.salary],
          ['Wages', claim.totals.wages],
          ['Subcontractor', claim.totals.subcontractor],
          ['Materials', claim.totals.materials],
          ['Overhead', claim.totals.overhead],
          ['Other', claim.totals.other],
        ].map(([label, amount], i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, width: 200 }}>{label as string}</Text>
            <Text style={{ ...styles.tableCell, width: 150 }}>
              ${(amount as number).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        ))}

        <View style={{ ...styles.tableRow, borderBottomWidth: 2, borderBottomColor: '#195E8E' }}>
          <Text style={{ ...styles.tableCellBold, width: 200 }}>Total Qualified Expenditures</Text>
          <Text style={{ ...styles.tableCellBold, width: 150 }}>
            ${claim.totals.total_qualified.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ ...styles.text, fontFamily: 'Helvetica-Bold' }}>
            Estimated Federal ITC (15%): ${claim.totals.estimated_federal_itc.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={{ fontSize: 8, color: '#5A5A5A', marginTop: 4 }}>
            Note: ITC figures are Estimated. CCPC status and provincial rates are simplified in v1.
          </Text>
        </View>

        <Text style={styles.footer}>
          Prepared by {companyName} via execom SR&ED Portal
        </Text>
      </Page>

      {/* Per-Project Pages */}
      {claim.projects.map((project, idx) => (
        <Page key={idx} size="LETTER" style={styles.page}>
          <Text style={styles.sectionTitle}>
            {project.code ? `${project.code} — ` : ''}{project.name}
          </Text>

          {project.start_date && (
            <Text style={{ fontSize: 9, color: '#5A5A5A', marginBottom: 12 }}>
              {project.start_date} to {project.end_date || 'ongoing'}
            </Text>
          )}

          <Text style={styles.label}>Objective (T661 Line 242)</Text>
          <Text style={styles.text}>{project.t661.objective || 'Not provided'}</Text>

          <Text style={styles.label}>Uncertainty (T661 Line 244)</Text>
          <Text style={styles.text}>{project.t661.uncertainty || 'Not provided'}</Text>

          <Text style={styles.label}>Work Performed (T661 Line 246)</Text>
          <Text style={styles.text}>{project.t661.work_done || 'Not provided'}</Text>

          <Text style={styles.label}>Advancement (T661 Line 248)</Text>
          <Text style={styles.text}>{project.t661.advancement || 'Not provided'}</Text>

          {/* Cost Table */}
          {project.costs.length > 0 && (
            <>
              <Text style={{ ...styles.sectionTitle, fontSize: 11 }}>Costs</Text>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCellBold, width: 100 }}>Type</Text>
                <Text style={{ ...styles.tableCellBold, width: 200 }}>Description</Text>
                <Text style={{ ...styles.tableCellBold, width: 100 }}>Amount</Text>
              </View>
              {project.costs.map((cost, ci) => (
                <View key={ci} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: 100 }}>{cost.cost_type}</Text>
                  <Text style={{ ...styles.tableCell, width: 200 }}>{cost.description}</Text>
                  <Text style={{ ...styles.tableCell, width: 100 }}>
                    ${cost.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Evidence List */}
          {project.evidence.length > 0 && (
            <>
              <Text style={{ ...styles.sectionTitle, fontSize: 11 }}>Evidence</Text>
              {project.evidence.map((ev, ei) => (
                <View key={ei} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 9 }}>
                    {ev.evidence_type}: {ev.title}
                    {ev.file_name ? ` (${ev.file_name})` : ''}
                  </Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.footer}>
            Prepared by {companyName} via execom SR&ED Portal
          </Text>
        </Page>
      ))}

      {/* Evidence Index Appendix */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Appendix: Evidence Index</Text>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableCellBold, width: 80 }}>Project</Text>
          <Text style={{ ...styles.tableCellBold, width: 80 }}>Type</Text>
          <Text style={{ ...styles.tableCellBold, width: 150 }}>Title</Text>
          <Text style={{ ...styles.tableCellBold, width: 150 }}>File</Text>
        </View>
        {claim.projects.flatMap((p) =>
          p.evidence.map((e, i) => (
            <View key={`${p.code}-${i}`} style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, width: 80 }}>{p.code || p.name}</Text>
              <Text style={{ ...styles.tableCell, width: 80 }}>{e.evidence_type}</Text>
              <Text style={{ ...styles.tableCell, width: 150 }}>{e.title}</Text>
              <Text style={{ ...styles.tableCell, width: 150 }}>{e.file_name || '--'}</Text>
            </View>
          ))
        )}
        <Text style={styles.footer}>
          Prepared by {companyName} via execom SR&ED Portal
        </Text>
      </Page>
    </Document>
  )
}

export async function generatePdf(claim: ClaimJson): Promise<Buffer> {
  const buffer = await renderToBuffer(<ClaimPdf claim={claim} />)
  return Buffer.from(buffer)
}
