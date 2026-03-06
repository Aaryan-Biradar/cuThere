export default function EventCard({ event }) {
    return (
        <a href={`/events/${event.id}`} className="event-card">
            {event.image_url && (
                <img src={event.image_url} alt={event.title} className="event-card-img" />
            )}
            <div className="event-card-body">
                <h3>{event.title}</h3>
                {event.date && <p className="event-date">📅 {event.date}</p>}
                {event.location && <p className="event-location">📍 {event.location}</p>}
            </div>
        </a>
    );
}
