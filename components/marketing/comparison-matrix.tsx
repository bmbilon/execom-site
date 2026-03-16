interface ComparisonColumn {
  label: string
  highlight?: boolean
}

interface ComparisonRow {
  dimension: string
  values: string[]
}

interface ComparisonMatrixProps {
  columns: ComparisonColumn[]
  rows: ComparisonRow[]
  variant?: "light" | "dark"
}

export function ComparisonMatrix({
  columns,
  rows,
  variant = "light",
}: ComparisonMatrixProps) {
  const isDark = variant === "dark"

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={`border-b-2 ${
              isDark ? "border-white/20" : "border-border"
            }`}
          >
            <th className="text-left py-3 pr-4" />
            {columns.map((col, i) => (
              <th
                key={i}
                className={`text-left py-3 pr-4 text-nav uppercase tracking-widest font-semibold ${
                  col.highlight
                    ? isDark
                      ? "text-teal"
                      : "text-blue"
                    : isDark
                    ? "text-white/50"
                    : "text-muted"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={isDark ? "text-white/60" : "text-fg/70"}>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b ${
                isDark ? "border-white/10" : "border-border"
              }`}
            >
              <td
                className={`py-3.5 pr-6 font-medium text-[13px] uppercase tracking-wider ${
                  isDark ? "text-white/70" : "text-fg/80"
                }`}
              >
                {row.dimension}
              </td>
              {row.values.map((val, j) => (
                <td
                  key={j}
                  className={`py-3.5 pr-4 text-sm leading-snug ${
                    columns[j]?.highlight
                      ? isDark
                        ? "text-white/80"
                        : "text-fg/80"
                      : ""
                  }`}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
