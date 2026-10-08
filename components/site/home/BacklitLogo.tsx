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

/** A flat outline with a faint perimeter glow and light in the E's lower slash. */
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
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <radialGradient id="lcb-halo">
          <stop offset="0" stopColor="#bdeff4" stopOpacity=".5" />
          <stop offset=".3" stopColor="#50c4d2" stopOpacity=".2" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-core">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".3" stopColor="#edfcff" stopOpacity=".95" />
          <stop offset=".65" stopColor="#8bdce6" stopOpacity=".5" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={`translate(${LOGO_LIGHT.x} ${LOGO_LIGHT.y})`}>
        <g className="lc-star">
          <circle r="22" fill="url(#lcb-halo)" />
          <circle r="6.2" fill="url(#lcb-core)" />
        </g>
      </g>

      <use href="#lcb-shape" fill="none" stroke="#50c4d2" strokeWidth="2" opacity=".3" filter="url(#lcb-perimeter)" />
      <use href="#lcb-shape" fill="none" stroke="#8bdce6" strokeWidth=".9" strokeOpacity=".82" strokeLinejoin="round" />
    </svg>
  )
}
