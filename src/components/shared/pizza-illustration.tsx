/**
 * Decorative pizza illustration used by the 404 page and empty states.
 * Inline SVG keeps it crisp and theme-aware without an extra image request.
 */
export function PizzaIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
    >
      <circle cx="80" cy="80" r="70" className="fill-brand/10" />
      <circle cx="80" cy="80" r="58" className="fill-brand/20" />
      <circle cx="80" cy="80" r="47" className="fill-brand/30" />

      <circle cx="62" cy="62" r="9" className="fill-brand" opacity="0.85" />
      <circle cx="96" cy="58" r="7" className="fill-brand" opacity="0.85" />
      <circle cx="106" cy="88" r="9" className="fill-brand" opacity="0.85" />
      <circle cx="74" cy="98" r="8" className="fill-brand" opacity="0.85" />
      <circle cx="52" cy="86" r="6" className="fill-brand" opacity="0.85" />

      <path
        d="M62 46c4-5 10-7 16-6"
        className="stroke-brand/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M104 70c5 4 7 9 7 14"
        className="stroke-brand/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M84 112c-6 3-13 3-19 0"
        className="stroke-brand/50"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M80 80 80 22M80 80l40 40M80 80 40 118"
        className="stroke-background/60"
        strokeWidth="2"
        strokeDasharray="5 7"
        strokeLinecap="round"
      />
    </svg>
  )
}
