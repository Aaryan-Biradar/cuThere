import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Provide a standard User-Agent so Instagram doesn't block the request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();

    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    }

    headers.set('cache-control', 'public, max-age=86400');

    return new NextResponse(arrayBuffer, { status: 200, headers });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
