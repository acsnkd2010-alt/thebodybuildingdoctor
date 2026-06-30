import { NextResponse } from 'next/server';

import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function POST() {
  return NextResponse.json(
    {
      message:
        'Self-registration is disabled. Your coach or administrator must create your account.',
    },
    { status: 403 },
  );
}
