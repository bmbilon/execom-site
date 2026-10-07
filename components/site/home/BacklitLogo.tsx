import { LOGO_PATH } from "@/lib/site/logoPath"

// Where the star sits, in logo units: the open gap between the top and middle
// arms of the E. The E is 124 units tall, so the star's 6.2 radius is 10% of it.
const STAR = { x: 126, y: 39 }
// Padding around the 202 x 194 logo so the bloom and the flare have room. The
// star lands at 55.41% / 35.99% of the rendered box, which the CSS relies on,
// and the box is 462 / 202 times the logo's width.
const VIEW = { x: -130, y: -110, w: 462, h: 414 }

const DEPTH = 9

/** The same official outline, flat cyan against the expanded white nova. */
export function NovaLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <path d={LOGO_PATH} fill="#50c4d2" fillRule="evenodd" />
    </svg>
  )
}

function Glint({ x, y, r, o, i }: { x: number; y: number; r: number; o: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <g className="lc-glint" style={{ animationDelay: `${2.6 + i * 1.1}s` }}>
        <ellipse rx={r} ry={r * 0.07} fill="url(#lcb-gl)" />
        <ellipse rx={r * 0.07} ry={r * 0.6} fill="url(#lcb-gl)" />
        <circle r={r * 0.12} fill="#fff" />
      </g>
    </g>
  )
}

/**
 * The execom logo as a solid object lit from behind: dark faces, lit side
 * walls, a bright rim, and a small star in the gap of the E with a wide bloom
 * and an anamorphic flare. Pure SVG, decorative.
 */
export function BacklitLogo({ className = "" }: { className?: string }) {
  const { x: sx, y: sy } = STAR
  return (
    <svg
      className={className}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      aria-hidden
      focusable="false"
    >
      <defs>
        <path id="lcb-shape" fillRule="evenodd" d={LOGO_PATH} />
        <clipPath id="lcb-clip">
          <use href="#lcb-shape" />
        </clipPath>
        <linearGradient id="lcb-face" x1="0" y1="0" x2="0" y2="194" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1f6a80" />
          <stop offset=".3" stopColor="#124354" />
          <stop offset=".64" stopColor="#0b2d3c" />
          <stop offset=".8" stopColor="#145163" />
          <stop offset="1" stopColor="#0c3443" />
        </linearGradient>
        <radialGradient id="lcb-sheen" cx={sx} cy={sy} r="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9fe6ee" stopOpacity=".55" />
          <stop offset=".45" stopColor="#50c4d2" stopOpacity=".16" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-rim" cx={sx} cy={sy} r="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".35" stopColor="#c9f3f8" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity=".55" />
        </radialGradient>
        <radialGradient id="lcb-wall" cx={sx} cy={sy} r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2fdfe" />
          <stop offset=".22" stopColor="#a5e6ee" />
          <stop offset=".6" stopColor="#3fa9ba" />
          <stop offset="1" stopColor="#1c6d82" />
        </radialGradient>
        <radialGradient id="lcb-back" cx={sx} cy={sy} r="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".3" stopColor="#c9f3f8" />
          <stop offset="1" stopColor="#58c2d0" />
        </radialGradient>
        <radialGradient id="lcb-bloom">
          <stop offset="0" stopColor="#d6f6fa" stopOpacity=".8" />
          <stop offset=".1" stopColor="#6fd2de" stopOpacity=".5" />
          <stop offset=".4" stopColor="#2b7db8" stopOpacity=".24" />
          <stop offset="1" stopColor="#195e8e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-gl">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".25" stopColor="#bdeff4" stopOpacity=".7" />
          <stop offset="1" stopColor="#50c4d2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcb-core">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".45" stopColor="#fff" />
          <stop offset=".7" stopColor="#d6f6fa" stopOpacity=".7" />
          <stop offset="1" stopColor="#8bdce6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* light behind the logo */}
      <g transform={`translate(${sx} ${sy})`}>
        <circle className="lc-bloom" r="250" fill="url(#lcb-bloom)" />
      </g>

      {/* side walls, stacked back to front, lit by the star */}
      {Array.from({ length: DEPTH }, (_, n) => {
        const k = DEPTH - n
        return (
          <use
            key={k}
            href="#lcb-shape"
            fill={k === DEPTH ? "url(#lcb-back)" : "url(#lcb-wall)"}
            transform={`translate(${(-0.34 * k).toFixed(2)} ${(-0.27 * k).toFixed(2)})`}
          />
        )
      })}

      {/* front face, inner bevel, rim */}
      <use href="#lcb-shape" fill="url(#lcb-face)" />
      <use href="#lcb-shape" fill="url(#lcb-sheen)" />
      <g clipPath="url(#lcb-clip)">
        <use href="#lcb-shape" fill="none" stroke="#dff8fb" strokeOpacity=".16" strokeWidth="1.3" />
      </g>
      <use href="#lcb-shape" fill="none" stroke="url(#lcb-rim)" strokeWidth=".7" />

      {/* the star and its flare, drawn over the logo like a lens would see it */}
      <g transform={`translate(${sx} ${sy})`} style={{ mixBlendMode: "screen" }}>
        <g className="lc-star">
          <ellipse rx="215" ry="1.15" fill="url(#lcb-gl)" opacity=".9" />
          <ellipse rx="70" ry="2.2" fill="url(#lcb-gl)" opacity=".5" />
          <ellipse rx="1" ry="34" fill="url(#lcb-gl)" opacity=".65" />
          <circle r="22" fill="url(#lcb-gl)" opacity=".6" />
          <circle r="6.2" fill="url(#lcb-core)" />
        </g>
      </g>
      <g style={{ mixBlendMode: "screen" }}>
        <Glint x={54.5} y={0.5} r={13} o={0.9} i={0} />
        <Glint x={155} y={28} r={9} o={0.75} i={1} />
        <Glint x={86.5} y={95} r={8} o={0.6} i={2} />
        <Glint x={148} y={51} r={7} o={0.7} i={3} />
      </g>
    </svg>
  )
}
