'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ──

interface RecalcRun {
  id: string
  claim_year_id: string
  status: 'running' | 'succeeded' | 'failed' | 'cancelled'
  trigger_source: string | null
  trigger_entity: string | null
  started_at: string
  finished_at: string | null
  error_message: string | null
  provisional_federal_qe: number | null
  final_federal_qe: number | null
  provinces_processed: string[] | null
  provincial_credits: {
    provinceCode: string
    creditAmount: number
    federalAssistanceAmount: number
  }[] | null
  review_summary: {
    blockers: number
    warnings: number
    info: number
  } | null
}

interface RecalcLock {
  claim_year_id: string
  locked_at: string
  locked_by: string | null
  run_id: string | null
}

interface LineValue {
  id: string
  form_code: string
  line_code: string
  value: number | null
  explanation: string | null
  province_code?: string
}

interface ReviewIssue {
  id: string
  rule_key: string | null
  severity: 'blocker' | 'warning' | 'info'
  message: string
  source_area: string
}

interface Props {
  yearId: string
  claimYear: Record<string, unknown>
  recalcRuns: RecalcRun[]
  recalcLock: RecalcLock | null
  federalLines: LineValue[]
  provincialLines: LineValue[]
  reviewIssues: ReviewIssue[]
}

// ── Helpers ──

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    running: 'bg-blue-100 text-blue-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}

function severityBadge(severity: string) {
  const colors: Record<string, string> = {
    blocker: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[severity] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {severity}
    </span>
  )
}

// ── Component ──

export default function CalculationStatusClient({
  yearId,
  claimYear,
  recalcRuns,
  recalcLock,
  federalLines,
  provincialLines,
  reviewIssues,
}: Props) {
  const router = useRouter()
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [recalcError, setRecalcError] = useState<string | null>(null)

  const latestRun = recalcRuns[0] ?? null

  const triggerRecalculation = useCallback(
    async (force = false) => {
      setIsRecalculating(true)
      setRecalcError(null)
      try {
        const res = await fetch(
          `/api/portal/calculate/${yearId}/recalculate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ triggerSource: 'manual', force }),
          }
        )
        const json = await res.json()
        if (!json.ok) {
          setRecalcError(json.error ?? 'Recalculation failed')
        }
        router.refresh()
      } catch (err) {
        setRecalcError(
          err instanceof Error ? err.message : 'Network error'
        )
      } finally {
        setIsRecalculating(false)
      }
    },
    [yearId, router]
  )

  const companyName =
    (claimYear.companies as Record<string, unknown>)?.name ?? 'Unknown'
  const fiscalYear = claimYear.fiscal_year as number

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calculation Status
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {String(companyName)}, FY{fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => triggerRecalculation(false)}
            disabled={isRecalculating}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isRecalculating ? 'Recalculating…' : 'Recalculate'}
          </button>
          {recalcLock && (
            <button
              onClick={() => triggerRecalculation(true)}
              disabled={isRecalculating}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Force Recalculate
            </button>
          )}
        </div>
      </div>

      {recalcError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {recalcError}
        </div>
      )}

      {/* Lock Status Banner */}
      {recalcLock && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-medium text-amber-800">
            Recalculation lock active
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Locked at {formatDate(recalcLock.locked_at)}
            {recalcLock.run_id && `, Run: ${recalcLock.run_id.slice(0, 8)}…`}
          </p>
        </div>
      )}

      {/* Latest Result Summary */}
      {latestRun && latestRun.status === 'succeeded' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Calculation Result
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Run {latestRun.id.slice(0, 8)}…, completed{' '}
            {formatDate(latestRun.finished_at)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provisional QE
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatMoney(latestRun.provisional_federal_qe)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Final QE
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatMoney(latestRun.final_federal_qe)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provinces
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {latestRun.provinces_processed?.join(', ') || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review Issues
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {latestRun.review_summary
                  ? `${latestRun.review_summary.blockers}B / ${latestRun.review_summary.warnings}W / ${latestRun.review_summary.info}I`
                  : '-'}
              </p>
            </div>
          </div>

          {/* Provincial Credits Breakdown */}
          {latestRun.provincial_credits &&
            latestRun.provincial_credits.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">
                  Provincial Credits
                </h3>
                <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Province
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">
                          Credit Amount
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-500">
                          Fed. Assistance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {latestRun.provincial_credits.map((pc) => (
                        <tr key={pc.provinceCode}>
                          <td className="px-4 py-2 font-medium">
                            {pc.provinceCode}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatMoney(pc.creditAmount)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatMoney(pc.federalAssistanceAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Federal Line Values */}
      {federalLines.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Federal Line Values
          </h2>
          <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Form
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Line
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">
                    Value
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {federalLines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2 text-gray-600">
                      {line.form_code}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {line.line_code}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatMoney(line.value)}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {line.explanation ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provincial Line Values */}
      {provincialLines.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Provincial Line Values
          </h2>
          <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Province
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Form
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Line
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {provincialLines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2 font-medium">
                      {line.province_code}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {line.form_code}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {line.line_code}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatMoney(line.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Review Issues */}
      {reviewIssues.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Open Review Issues
          </h2>
          <div className="mt-3 space-y-2">
            {reviewIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 p-3"
              >
                {severityBadge(issue.severity)}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{issue.message}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {issue.rule_key ?? 'manual'} · {issue.source_area}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recalculation History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recalculation History
        </h2>
        {recalcRuns.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No recalculation runs yet. Click "Recalculate" to run the
            pipeline.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Trigger
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Started
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">
                    Duration
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">
                    Final QE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recalcRuns.map((run) => {
                  const durationMs =
                    run.finished_at && run.started_at
                      ? new Date(run.finished_at).getTime() -
                        new Date(run.started_at).getTime()
                      : null
                  return (
                    <tr key={run.id}>
                      <td className="px-4 py-2">
                        {statusBadge(run.status)}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {run.trigger_source ?? '-'}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {formatDate(run.started_at)}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {durationMs !== null
                          ? `${(durationMs / 1000).toFixed(1)}s`
                          : '-'}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatMoney(run.final_federal_qe)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
