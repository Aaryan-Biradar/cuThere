'use client';

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';

export default function HomePage() {
    const [events, setEvents] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchEvents(); }, []);

    async function fetchEvents(q = '') {
        setLoading(true);
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();
        setEvents(data);
        setLoading(false);
    }

    function handleSearch(e) {
        e.preventDefault();
        fetchEvents(query);
    }

    return (
        <main>
            <h1>cuThere</h1>
            <p>Discover events happening around you</p>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {loading ? (
                <p>Loading events…</p>
            ) : events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                <div className="events-grid">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </main>
    );
}
