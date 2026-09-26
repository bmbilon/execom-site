/** Stylized CAD drawing stack for the HEX-100 package (vector, no raster preview). */
export function HexCadVisual() {
  return (
    <svg
      viewBox="0 0 800 450"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8f5ec" />
          <stop offset="1" stopColor="#ece6d5" />
        </linearGradient>
        <pattern
          id="grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="rgba(20,42,62,0.10)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      {/* Three stacked drawing sheets, offset */}
      {[2, 1, 0].map((i) => (
        <g
          key={i}
          transform={`translate(${160 + i * 18} ${60 + i * 14})`}
        >
          <rect
            width="480"
            height="330"
            rx="3"
            fill="url(#paper)"
            stroke="rgba(20,42,62,0.22)"
            strokeWidth="1"
          />
          {i === 0 && (
            <>
              <rect
                width="480"
                height="330"
                fill="url(#grid)"
              />
              {/* faux orthographic views */}
              <circle
                cx="140"
                cy="120"
                r="56"
                fill="none"
                stroke="#0d1c2a"
                strokeWidth="1.3"
              />
              <polygon
                points="140,80 175,100 175,140 140,160 105,140 105,100"
                fill="none"
                stroke="#0d1c2a"
                strokeWidth="1.3"
              />
              <rect
                x="240"
                y="80"
                width="200"
                height="80"
                fill="none"
                stroke="#0d1c2a"
                strokeWidth="1.3"
              />
              <line
                x1="240"
                y1="100"
                x2="440"
                y2="100"
                stroke="#0d1c2a"
                strokeWidth="0.7"
                strokeDasharray="4 3"
              />
              <line
                x1="240"
                y1="140"
                x2="440"
                y2="140"
                stroke="#0d1c2a"
                strokeWidth="0.7"
                strokeDasharray="4 3"
              />
              {/* dimension lines */}
              <line
                x1="60"
                y1="220"
                x2="420"
                y2="220"
                stroke="#195E8E"
                strokeWidth="0.9"
              />
              <line
                x1="60"
                y1="215"
                x2="60"
                y2="225"
                stroke="#195E8E"
                strokeWidth="0.9"
              />
              <line
                x1="420"
                y1="215"
                x2="420"
                y2="225"
                stroke="#195E8E"
                strokeWidth="0.9"
              />
              <text
                x="240"
                y="214"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                fill="#195E8E"
              >
                112.50
              </text>
              {/* title block */}
              <rect
                x="280"
                y="260"
                width="180"
                height="58"
                fill="none"
                stroke="#0d1c2a"
                strokeWidth="1"
              />
              <line
                x1="280"
                y1="278"
                x2="460"
                y2="278"
                stroke="#0d1c2a"
                strokeWidth="0.7"
              />
              <line
                x1="280"
                y1="298"
                x2="460"
                y2="298"
                stroke="#0d1c2a"
                strokeWidth="0.7"
              />
              <text
                x="288"
                y="273"
                fontFamily="ui-monospace, monospace"
                fontSize="8"
                fill="#0d1c2a"
                letterSpacing="0.05em"
              >
                SC-HEX-100
              </text>
              <text
                x="288"
                y="293"
                fontFamily="ui-monospace, monospace"
                fontSize="8"
                fill="#0d1c2a"
                opacity="0.7"
              >
                SHEET 01 / 25
              </text>
              <text
                x="288"
                y="313"
                fontFamily="ui-monospace, monospace"
                fontSize="8"
                fill="#0d1c2a"
                opacity="0.7"
              >
                SCALE 1:1
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  )
}
