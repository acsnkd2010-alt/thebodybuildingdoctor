import { NextResponse } from 'next/server';

import { createBlog, listAllBlogs } from '@/lib/db/blogs';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const blogs = await listAllBlogs();
    return NextResponse.json({ blogs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blogs';
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

    const blog = await createBlog({
      title,
      slug,
      excerpt: typeof body.excerpt === 'string' ? body.excerpt : '',
      contentHtml: typeof body.contentHtml === 'string' ? body.contentHtml : '',
      thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : '',
      authorName:
        typeof body.authorName === 'string' ? body.authorName : 'The Bodybuilding Doctor',
      published: body.published === true,
      order: typeof body.order === 'number' ? body.order : 0,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create blog';
    return NextResponse.json({ message }, { status: 500 });
  }
}
