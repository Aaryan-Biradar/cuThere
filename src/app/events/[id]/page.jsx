'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EventCard from '@/components/EventCard';

export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/events/${id}`)
            .then((res) => res.json())
            .then((data) => { setEvent(data); setLoading(false); });
    }, [id]);

    async function handleRsvp() {
        const name = prompt('Enter your name to RSVP:');
        if (!name) return;

        await fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: Number(id), user_name: name }),
        });

        const res = await fetch(`/api/events/${id}`);
        setEvent(await res.json());
    }

    if (loading) return <main className="mx-auto max-w-4xl p-8 [font-family:var(--font-brand-sans)]"><p>Loading...</p></main>;
    if (!event || event.error) return <main className="mx-auto max-w-4xl p-8 [font-family:var(--font-brand-sans)]"><p>Event not found.</p></main>;

    return (
        <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6 [font-family:var(--font-brand-sans)]">
            <a href="/" className="inline-flex rounded-md border border-black px-3 py-1.5 text-sm font-medium text-black hover:bg-black hover:text-white">
                ← Back to events
            </a>
            <h1 className="text-3xl font-bold text-black [font-family:var(--font-brand-serif)]">{event.title}</h1>

            {event.image_url && (
                <img src={event.image_url} alt={event.title} className="h-64 w-full rounded-xl border border-black object-cover sm:h-80" />
            )}

            {event.date && <p className="text-black"><strong>Date:</strong> {event.date}</p>}
            {event.time && <p className="text-black"><strong>Time:</strong> {event.time}</p>}
            {event.location && <p className="text-black"><strong>Location:</strong> {event.location}</p>}
            {event.description && <p className="pt-2 text-black/90">{event.description}</p>}

            <p className="pt-2 text-black"><strong>RSVPs:</strong> {event.rsvp_count}</p>
            <button
                className="rounded-lg bg-[#C41230] px-5 py-2.5 font-semibold text-white transition hover:bg-[#a30f27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41230] focus-visible:ring-offset-2"
                onClick={handleRsvp}
            >
                RSVP
            </button>

            {event.related?.length > 0 && (
                <>
                    <h2 className="pt-4 text-2xl font-semibold text-black [font-family:var(--font-brand-serif)]">Related Events</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {event.related.map((e) => (
                            <EventCard key={e.id} event={e} />
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
