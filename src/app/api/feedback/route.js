import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, feedback, _hp_company } = body;

    // ── Honeypot check ──────────────────────────────────────────────
    // If the hidden field has any value a bot filled it in.
    // Return 200 so the bot thinks it succeeded, but do nothing.
    if (_hp_company) {
      return NextResponse.json({ ok: true });
    }

    // ── Validate required fields ────────────────────────────────────
    if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required.' },
        { status: 400 },
      );
    }

    // ── Build Discord Embed ─────────────────────────────────────────
    // Coerce + truncate like the feedback field: a non-string email would throw, and Discord
    // rejects embed field values over 1024 chars with a 400.
    const from = (typeof email === 'string' && email.trim()) ? email.trim().slice(0, 1024) : 'Anonymous';
    const embed = {
      title: '📬 New Feedback',
      color: 0xd71920, // cuThere brand red
      fields: [
        {
          name: '👤 From',
          value: from,
          inline: true,
        },
        {
          name: '💬 Feedback',
          value: feedback.trim().slice(0, 1024), // Discord field limit
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'cuThere Feedback Form',
      },
    };

    // ── POST to Discord Webhook ─────────────────────────────────────
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('[feedback] DISCORD_WEBHOOK_URL is not set');
      return NextResponse.json(
        { error: 'Server misconfiguration.' },
        { status: 500 },
      );
    }

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'cuThere Feedback',
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('[feedback] Discord webhook error:', discordRes.status, errText);
      return NextResponse.json(
        { error: 'Failed to deliver feedback.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[feedback] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
