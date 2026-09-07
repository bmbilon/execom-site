'use client'

// Form primitives for the /sred assessor.
//
// No new design language: every colour, radius and font size below is an
// existing execom token from tailwind.config.ts. The only thing these add is
// mobile ergonomics — 16px text so iOS does not zoom on focus, and 52px minimum
// tap targets so a thumb on a 320px screen hits what it aimed at.

import { useId, type ReactNode } from 'react'

const CONTROL =
  'w-full min-h-[52px] px-4 py-3 text-base text-fg bg-white border rounded-[5px] ' +
  'transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40 placeholder:text-subtle'

const CONTROL_OK = 'border-border focus:border-teal'
const CONTROL_BAD = 'border-red-400 focus:border-red-500'

function controlClass(invalid?: boolean) {
  return `${CONTROL} ${invalid ? CONTROL_BAD : CONTROL_OK}`
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-2 text-[13px] text-red-600">
      {message}
    </p>
  )
}

interface FieldShellProps {
  label: string
  helper?: string
  error?: string
  children: (ids: { controlId: string; describedBy?: string; invalid: boolean }) => ReactNode
}

export function Field({ label, helper, error, children }: FieldShellProps) {
  const base = useId()
  const controlId = `${base}-control`
  const helperId = helper ? `${base}-helper` : undefined
  const errorId = error ? `${base}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="mb-6">
      <label
        htmlFor={controlId}
        className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-blue mb-2"
      >
        {label}
      </label>
      {helper && (
        <p id={helperId} className="text-[13px] leading-relaxed text-muted mb-3">
          {helper}
        </p>
      )}
      {children({ controlId, describedBy, invalid: !!error })}
      <FieldError id={errorId ?? `${base}-error`} message={error} />
    </div>
  )
}

// ─── Text ──────────────────────────────────────────────────────────────────

export function TextInput(props: {
  label: string
  helper?: string
  error?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
}) {
  return (
    <Field label={props.label} helper={props.helper} error={props.error}>
      {({ controlId, describedBy, invalid }) => (
        <input
          id={controlId}
          type={props.type ?? 'text'}
          className={controlClass(invalid)}
          value={props.value}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function TextArea(props: {
  label: string
  helper?: string
  error?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <Field label={props.label} helper={props.helper} error={props.error}>
      {({ controlId, describedBy, invalid }) => (
        <textarea
          id={controlId}
          rows={props.rows ?? 4}
          className={`${controlClass(invalid)} leading-relaxed resize-y`}
          value={props.value}
          placeholder={props.placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

/**
 * Money is held as a string while typing so a half-entered "12," does not get
 * coerced to NaN under the user's cursor. The parent converts on submit.
 */
export function MoneyInput(props: {
  label: string
  helper?: string
  error?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={props.label} helper={props.helper} error={props.error}>
      {({ controlId, describedBy, invalid }) => (
        <div className="relative">
          <span
            aria-hidden
            className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted"
          >
            $
          </span>
          <input
            id={controlId}
            type="text"
            inputMode="numeric"
            className={`${controlClass(invalid)} pl-8`}
            value={props.value}
            placeholder="0"
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(e) => props.onChange(e.target.value.replace(/[^\d.,]/g, ''))}
          />
        </div>
      )}
    </Field>
  )
}

export function DateInput(props: {
  label: string
  helper?: string
  error?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={props.label} helper={props.helper} error={props.error}>
      {({ controlId, describedBy, invalid }) => (
        <input
          id={controlId}
          type="date"
          className={controlClass(invalid)}
          value={props.value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

export function SelectInput<T extends string>(props: {
  label: string
  helper?: string
  error?: string
  value: T | ''
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (v: T) => void
  placeholder?: string
}) {
  return (
    <Field label={props.label} helper={props.helper} error={props.error}>
      {({ controlId, describedBy, invalid }) => (
        <select
          id={controlId}
          className={`${controlClass(invalid)} appearance-none bg-white pr-10`}
          value={props.value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => props.onChange(e.target.value as T)}
        >
          <option value="" disabled>
            {props.placeholder ?? 'Choose one'}
          </option>
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

// ─── Choices ───────────────────────────────────────────────────────────────

const CHOICE_BASE =
  'w-full min-h-[52px] px-4 py-3 text-left text-base rounded-[5px] border transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-teal/40'
const CHOICE_ON = 'border-teal bg-teal/10 text-fg font-medium'
const CHOICE_OFF = 'border-border bg-white text-fg/75 hover:border-teal/50'

export function ChoiceGroup<T extends string>(props: {
  label: string
  helper?: string
  error?: string
  value: T | ''
  options: ReadonlyArray<{ value: T; label: string; note?: string }>
  onChange: (v: T) => void
  columns?: 1 | 2
}) {
  const base = useId()
  const errorId = `${base}-error`
  const helperId = `${base}-helper`

  return (
    <fieldset className="mb-6 min-w-0">
      <legend className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
        {props.label}
      </legend>
      {props.helper && (
        <p id={helperId} className="text-[13px] leading-relaxed text-muted mb-3">
          {props.helper}
        </p>
      )}
      <div
        role="radiogroup"
        aria-describedby={props.helper ? helperId : undefined}
        aria-invalid={props.error ? true : undefined}
        className={`grid gap-2 ${props.columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {props.options.map((o) => {
          const selected = props.value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${CHOICE_BASE} ${selected ? CHOICE_ON : CHOICE_OFF}`}
              onClick={() => props.onChange(o.value)}
            >
              <span className="block">{o.label}</span>
              {o.note && (
                <span className="block mt-1 text-[13px] text-muted font-normal">{o.note}</span>
              )}
            </button>
          )
        })}
      </div>
      <FieldError id={errorId} message={props.error} />
    </fieldset>
  )
}

export function MultiChoice<T extends string>(props: {
  label: string
  helper?: string
  error?: string
  values: T[]
  options: ReadonlyArray<{ value: T; label: string }>
  onToggle: (v: T) => void
}) {
  const base = useId()
  return (
    <fieldset className="mb-6 min-w-0">
      <legend className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
        {props.label}
      </legend>
      {props.helper && (
        <p className="text-[13px] leading-relaxed text-muted mb-3">{props.helper}</p>
      )}
      <div className="grid gap-2">
        {props.options.map((o) => {
          const selected = props.values.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              className={`${CHOICE_BASE} ${selected ? CHOICE_ON : CHOICE_OFF} flex items-center gap-3`}
              onClick={() => props.onToggle(o.value)}
            >
              <span
                aria-hidden
                className={`shrink-0 w-5 h-5 rounded-[3px] border flex items-center justify-center ${
                  selected ? 'border-teal bg-teal text-white' : 'border-border bg-white'
                }`}
              >
                {selected ? '✓' : ''}
              </span>
              <span>{o.label}</span>
            </button>
          )
        })}
      </div>
      <FieldError id={`${base}-error`} message={props.error} />
    </fieldset>
  )
}

/** Consent checkbox. Never pre-checked; the caller owns the value. */
export function ConsentCheckbox(props: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  error?: string
}) {
  const id = useId()
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="flex items-start gap-3 cursor-pointer text-[15px] leading-relaxed text-fg/80 min-h-[44px]"
      >
        <input
          id={id}
          type="checkbox"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          className="mt-1 w-5 h-5 shrink-0 accent-teal"
        />
        <span>{props.children}</span>
      </label>
      <FieldError id={`${id}-error`} message={props.error} />
    </div>
  )
}
