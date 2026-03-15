export default function MicroLabel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`text-[12px] font-semibold uppercase tracking-[0.08em] text-blue ${className}`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {children}
    </span>
  )
}
