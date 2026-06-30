import { NextRequest, NextResponse } from 'next/server';

import { listInquiries, updateInquiryStatus, type InquiryStatus } from '@/lib/db/inquiries';
import { requireAdminApi } from '@/lib/auth/require-admin';

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'closed'];

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const inquiries = await listInquiries();
    return NextResponse.json({ inquiries });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load inquiries';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const status = STATUSES.includes(body.status) ? body.status : null;

    if (!id || !status) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const inquiry = await updateInquiryStatus(id, status);
    if (!inquiry) {
      return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json(inquiry);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update inquiry';
    return NextResponse.json({ message }, { status: 500 });
  }
}
