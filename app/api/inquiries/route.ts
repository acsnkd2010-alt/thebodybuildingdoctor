import { NextResponse } from 'next/server';

import { createInquiry, type InquiryType } from '@/lib/db/inquiries';
import { getCourseById } from '@/lib/db/courses';

const INQUIRY_TYPES: InquiryType[] = ['mentorship', 'courses', 'both'];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const type = INQUIRY_TYPES.includes(body.type) ? body.type : null;
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';

    if (!name || name.length < 2) {
      return NextResponse.json({ message: 'Please enter your full name' }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ message: 'Please select what you are interested in' }, { status: 400 });
    }

    let courseTitle = '';
    if (courseId) {
      const course = await getCourseById(courseId);
      if (course) {
        courseTitle = course.title;
      }
    }

    const inquiry = await createInquiry({
      name,
      email,
      phone: phone || undefined,
      type,
      courseId: courseId || undefined,
      courseTitle: courseTitle || undefined,
      message: message || undefined,
    });

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit request';
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
