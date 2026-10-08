import { LOGO_FINALE_VIEW as VIEW, LOGO_LIGHT, LOGO_PATH } from "@/lib/site/logoPath"

/** The official logo, flat cyan against the expanded white nova. */
export function NovaLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <path d={LOGO_PATH} fill="#50c4d2" fillRule="evenodd" />
    </svg>
  )
}

/** A luminous cyan outline with a pulsing light tucked behind the E's lower slash. */
export function BacklitLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      aria-hidden
      focusable="false"
    >
      <defs>
        <path id="lcb-shape" fillRule="evenodd" d={LOGO_PATH} />
        <filter id="lcb-perimeter" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id="lcb-edge" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <mask id="lcb-light-mask" maskUnits="userSpaceOnUse" x={VIEW.x} y={VIEW.y} width={VIEW.width} height={VIEW.height}>
          <rect x={VIEW.x} y={VIEW.y} width={VIEW.width} height={VIEW.height} fill="#fff" />
          <use href="#lcb-shape" fill="#000" />
        </mask>
        <radialGradient id="lcb-halo">
          <stop offset="0" stopColor="#bdeff4" stopOpacity=".8" />
          <stop offset=".12" stopColor="#8bdce6" stopOpacity=".65" />
          <stop offset=".38" stopColor="#50c4d2" stopOpacity=".3" />
          <stop offset=".7" stopColor="#2983ae" stopOpacity=".1" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-corona">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".2" stopColor="#bdeff4" stopOpacity=".55" />
          <stop offset=".55" stopColor="#50c4d2" stopOpacity=".2" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-core">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".3" stopColor="#edfcff" stopOpacity=".95" />
          <stop offset=".65" stopColor="#8bdce6" stopOpacity=".5" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g mask="url(#lcb-light-mask)">
        <g transform={`translate(${LOGO_LIGHT.x} ${LOGO_LIGHT.y})`}>
          <g className="lc-star-halo">
            <circle r="58" fill="url(#lcb-halo)" />
            <circle r="22" fill="url(#lcb-corona)" />
          </g>
          <g className="lc-star">
            <circle r="6.2" fill="url(#lcb-core)" />
          </g>
        </g>
      </g>

      <g fill="none" strokeLinejoin="round">
        <use href="#lcb-shape" stroke="#1b9ee0" strokeWidth="3.5" opacity=".5" filter="url(#lcb-perimeter)" />
        <use href="#lcb-shape" stroke="#32d5f3" strokeWidth="2.2" opacity=".9" filter="url(#lcb-edge)" />
        <use href="#lcb-shape" stroke="#48dcee" strokeWidth="1.2" />
        <use href="#lcb-shape" stroke="#d4fcff" strokeWidth=".45" />
      </g>
    </svg>
  )
}
