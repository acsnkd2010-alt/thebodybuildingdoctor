import { NextResponse } from 'next/server';

import { createCourse, listAllCourses } from '@/lib/db/courses';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const courses = await listAllCourses();
    return NextResponse.json({ courses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load courses';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const slug =
      typeof body.slug === 'string' && body.slug.trim()
        ? body.slug.trim()
        : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const course = await createCourse({
      title,
      slug,
      description: typeof body.description === 'string' ? body.description : '',
      thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : '',
      instructorName:
        typeof body.instructorName === 'string' ? body.instructorName : 'The Bodybuilding Doctor',
      level: body.level === 'intermediate' || body.level === 'advanced' ? body.level : 'beginner',
      category: typeof body.category === 'string' ? body.category : 'Training',
      published: body.published === true,
      priceCents: typeof body.priceCents === 'number' ? body.priceCents : 0,
      lessonCount: 0,
      totalDurationSec: 0,
      order: typeof body.order === 'number' ? body.order : 0,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create course';
    return NextResponse.json({ message }, { status: 500 });
  }
}
