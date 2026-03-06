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

    if (loading) return <main><p>Loading…</p></main>;
    if (!event || event.error) return <main><p>Event not found.</p></main>;

    return (
        <main>
            <a href="/" className="back-link">← Back to events</a>
            <h1>{event.title}</h1>

            {event.image_url && (
                <img src={event.image_url} alt={event.title} className="detail-img" />
            )}

            {event.date && <p><strong>Date:</strong> {event.date}</p>}
            {event.time && <p><strong>Time:</strong> {event.time}</p>}
            {event.location && <p><strong>Location:</strong> {event.location}</p>}
            {event.description && <p style={{ marginTop: '1rem' }}>{event.description}</p>}

            <p style={{ marginTop: '1rem' }}><strong>RSVPs:</strong> {event.rsvp_count}</p>
            <button className="rsvp-btn" onClick={handleRsvp}>RSVP</button>

            {event.related?.length > 0 && (
                <>
                    <h2 style={{ marginTop: '2rem' }}>Related Events</h2>
                    <div className="events-grid">
                        {event.related.map((e) => (
                            <EventCard key={e.id} event={e} />
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}
