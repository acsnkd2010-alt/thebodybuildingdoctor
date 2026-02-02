import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const base = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
    return NextResponse.json({ user: base });
  }

  try {
    const res = await fetch(
      `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/profile?user_id=${user.id}`,
      {
        headers: { Authorization: `Bearer ${WORDPRESS_API_KEY}` },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ user: base });
    }
    const profile = await res.json();
    return NextResponse.json({
      user: {
        ...base,
        name: profile.name ?? base.name,
        email: profile.email ?? base.email,
        username: profile.username ?? base.username,
        profile_picture_url: profile.profile_picture_url ?? '',
        phone: profile.phone ?? '',
        date_of_birth: profile.date_of_birth ?? '',
      },
    });
  } catch {
    return NextResponse.json({ user: base });
  }
}
