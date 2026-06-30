import { notFound } from 'next/navigation';

import BlogForm from '@/components/admin/BlogForm';
import { getBlogById } from '@/lib/db/blogs';

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const blog = await getBlogById(params.id);
  if (!blog) notFound();
  return <BlogForm blog={blog} />;
}
