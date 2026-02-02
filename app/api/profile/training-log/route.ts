import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/auth/session';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
    return NextResponse.json({ entries: [] });
  }
  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/training-log?user_id=${user.id}`,
      {
        headers: { Authorization: `Bearer ${WORDPRESS_API_KEY}` },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ entries: [] });
    }
    const data = await res.json();
    return NextResponse.json({ entries: data.entries ?? [] });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
    return NextResponse.json(
      { message: 'WordPress API not configured' },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const res = await fetch(
      `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/training-log`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WORDPRESS_API_KEY}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          date: body.date ?? new Date().toISOString().slice(0, 10),
          exercise: body.exercise ?? '',
          sets: body.sets ?? '',
          reps: body.reps ?? '',
          weight: body.weight ?? '',
          notes: body.notes ?? '',
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? 'Failed to add entry' },
        { status: res.status }
      );
    }
    return NextResponse.json({
      success: true,
      entry: data.entry,
      entries: data.entries ?? [],
    });
  } catch (error: unknown) {
    console.error('Training log error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to add entry' },
      { status: 500 }
    );
  }
}
