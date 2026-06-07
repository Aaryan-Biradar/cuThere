import EventCard from '@/components/EventCard';

export default function SearchResultsSection({ query, events }) {
  return (
    <section id="events" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-12">
      <div className="mb-6">
        <p className="font-sans text-sm font-medium text-slate-500">Showing results for</p>
        <h2 className="mt-1 font-sans text-2xl font-bold text-[#111827] sm:text-3xl">&ldquo;{query}&rdquo;</h2>
        <p className="mt-1 font-sans text-sm text-slate-500">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </p>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events match your search. Try different keywords.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event, index) => (
            <EventCard key={`search-${event.id || index}`} event={event} layout="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
