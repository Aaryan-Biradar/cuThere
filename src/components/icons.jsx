/**
 * Shared inline SVG icons. Keep these tiny and presentational (no client state),
 * so they can be imported from both server and client components.
 */

/**
 * Left-pointing chevron used for "Back" links and the home-page carousel
 * "scroll left" control.
 */
export function ChevronLeftIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Map-pin marker shown next to event locations (cards + detail page). The two call
 * sites use slightly different stroke weights / dot sizes, hence the props.
 */
export function LocationPinIcon({ className = 'h-4 w-4', strokeWidth = 1.7, dotRadius = 2.2 }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r={dotRadius} stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}

/**
 * Right-pointing chevron (mirror of ChevronLeftIcon) used for the home-page
 * carousel "scroll right" control.
 */
export function ChevronRightIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
