function parseEventDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isTodayEvent(dateString) {
  const eventDate = parseEventDate(dateString);
  if (!eventDate) return false;
  const today = new Date();
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

function formatEventDateTime(date, time) {
  if (!date && !time) return 'Date and time TBA';
  const parsed = parseEventDate(date);
  const dateLabel = parsed
    ? parsed.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBA';
  return `${dateLabel} · ${time || 'Time TBA'}`;
}

export default function EventCard({ event }) {
  const href = event?.id && !event?.isMock ? `/events/${event.id}` : '#';
  const showTodayBadge = isTodayEvent(event?.date);

  return (
    <a
      href={href}
      className="group block w-[min(16rem,calc(100vw-2.5rem))] shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 sm:w-64"
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}
    >
      <div className="relative h-40 w-full border-b border-[#E5E7EB] bg-[#F3F4F6]">
        {showTodayBadge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#D71920] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
            ● TODAY
          </span>
        )}
      </div>

      <div className="space-y-2 p-5">
        <h3 className="line-clamp-2 font-sans text-lg font-bold leading-snug text-[#111827]">{event?.title || 'Untitled Event'}</h3>
        <p className="font-sans text-sm font-bold text-[#D71920]">{formatEventDateTime(event?.date, event?.time)}</p>
        <p className="inline-flex line-clamp-1 items-center gap-1.5 font-sans text-xs font-medium text-[#6B7280]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9CA3AF]" fill="none" aria-hidden="true">
            <path
              d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          {event?.location || 'Carleton University Campus'}
        </p>
      </div>
    </a>
  );
}
