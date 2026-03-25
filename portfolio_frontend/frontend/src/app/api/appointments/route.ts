import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const now = Date.now();
  return NextResponse.json(
    {
      appointment_id: `demo-${now}`,
      event_id: `evt-${randomUUID()}`,
      kafka_enabled: false,
      published: false,
      demo: true,
    },
    { status: 200 }
  );
}
