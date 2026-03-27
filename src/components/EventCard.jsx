function formatBadge(date, time) {
  if (!date && !time) return 'TBA';
  const parsed = date ? new Date(`${date}T00:00:00`) : null;
  const monthDay = parsed
    ? `${parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${parsed.getDate()}`
    : 'TBA';
  return `${monthDay} | ${time || 'TBA'}`;
}

export default function EventCard({ event }) {
  const href = event?.id && !event?.isMock ? `/events/${event.id}` : '#';
  const cardTags = event?.tags?.length ? event.tags : [event?.category || 'General'];

  return (
    <a
      href={href}
      className="group block rounded-xl border border-black/10 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41230] focus-visible:ring-offset-2"
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#C41230]">
        {event?.image_url ? (
          <>
            <img
              src={event.image_url}
              alt={event.title || 'Event image'}
              className="h-full w-full object-cover grayscale contrast-125 brightness-75 transition duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#C41230]/30 mix-blend-multiply" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#C41230]" />
        )}

        <div className="absolute right-0 top-0 bg-black px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-white">
          {formatBadge(event?.date, event?.time)}
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        <div>
          <p className="text-xs font-normal text-gray-500 [font-family:var(--font-brand-sans)]">{event?.time || 'Time TBA'}</p>
          <h3 className="mt-0.5 text-lg font-bold leading-snug text-black [font-family:var(--font-brand-sans)]">{event?.title || 'Untitled Event'}</h3>
        </div>

        <p className="line-clamp-2 text-sm text-black/75 [font-family:var(--font-brand-sans)]">
          {event?.description || 'Come join this university event and connect with the community.'}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {cardTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-black px-2 py-0.5 text-[11px] font-medium text-white [font-family:var(--font-brand-sans)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
