function formatDate(date, time) {
  if (!date && !time) return 'TBA';
  const parsed = date ? new Date(`${date}T00:00:00`) : null;
  const monthDay = parsed
    ? `${parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${parsed.getDate()}`
    : 'TBA';
  return `${monthDay} • ${time || 'TBA'}`;
}

export default function EventCard({ event, trendingRank = null, isPast = false }) {
  const href = event?.id && !event?.isMock ? `/events/${event.id}` : '#';

  return (
    <a
      href={href}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CF142B]"
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#1a1a1a]">
        {event?.image_url ? (
          <>
            <img
              src={event.image_url}
              alt={event.title || 'Event image'}
              className="h-full w-full object-cover brightness-90 transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1f1f1f] via-[#181818] to-[#101010]" />
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {isPast && <span className="rounded-full bg-[#374151] px-3 py-1 text-[10px] font-semibold tracking-wide text-white">PAST EVENT</span>}
          {trendingRank ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#CF142B] text-xs font-bold text-white">
              #{trendingRank}
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h3 className="text-lg font-bold leading-snug text-white sm:text-xl">{event?.title || 'Untitled Event'}</h3>
          <p className="mt-1 text-sm text-[#9CA3AF]">{formatDate(event?.date, event?.time)}</p>
        </div>
      </div>
    </a>
  );
}
