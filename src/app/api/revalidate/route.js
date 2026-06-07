import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * POST /api/revalidate?secret=...   (or header: x-revalidate-secret)
 *
 * Refreshes the cached event reads. The nightly scraper GitHub Action calls this when it
 * finishes, so the shared cache rebuilds exactly when the data changes.
 */
export async function POST(request) {
    const provided =
        new URL(request.url).searchParams.get('secret') ||
        request.headers.get('x-revalidate-secret');

    if (!process.env.REVALIDATE_SECRET || provided !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 });
    }

    revalidateTag('events');
    return NextResponse.json({ revalidated: true, tag: 'events', now: Date.now() });
}
