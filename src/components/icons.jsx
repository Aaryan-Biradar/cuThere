/**
 * Shared inline SVG icons. Keep these tiny and presentational (no client state),
 * so they can be imported from both server and client components.
 */

/**
 * Left-pointing chevron used for "Back" links and the home-page carousel
 * "scroll left" control. (The carousel "scroll right" control mirrors this path.)
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
