/**
 * Parse an Instagram post object into a structured event.
 * Looks for dates, times, and locations using common patterns.
 */
export function parseEventFromPost(post) {
    const text = post.caption || post.text || '';
    const lines = text.split('\n').filter((l) => l.trim());

    // Title: first non-empty line
    const title = lines[0]?.trim() || 'Untitled Event';

    // --- Date detection ---
    const datePatterns = [
        /(\d{1,2}\/\d{1,2}\/\d{2,4})/,           // 3/15/2026
        /(\w+\s+\d{1,2},?\s*\d{4})/,              // March 15, 2026
        /(\d{1,2}\s+\w+\s+\d{4})/,                // 15 March 2026
    ];
    let date = null;
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) { date = match[1]; break; }
    }

    // --- Time detection ---
    const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/);
    const time = timeMatch ? timeMatch[1] : null;

    // --- Location detection ---
    const locationMatch = text.match(
        /(?:📍|at|@|location:|venue:|where:)\s*(.+)/i
    );
    const location = locationMatch ? locationMatch[1].trim() : null;

    // Description: everything after the first line
    const description = lines.slice(1).join('\n').trim() || null;

    return {
        title,
        description,
        date,
        time,
        location,
        image_url: post.displayUrl || post.imageUrl || null,
        source_url: post.url || null,
        source_platform: 'instagram',
    };
}
