import { NextRequest, NextResponse } from 'next/server';

import { deleteBlog, getBlogById, updateBlog } from '@/lib/db/blogs';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const blog = await getBlogById(params.id);
    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ blog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blog';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const fields = [
      'title',
      'slug',
      'excerpt',
      'contentHtml',
      'thumbnailUrl',
      'authorName',
      'published',
      'order',
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const blog = await updateBlog(params.id, updates);
    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update blog';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    await deleteBlog(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog';
    return NextResponse.json({ message }, { status: 500 });
  }
}
