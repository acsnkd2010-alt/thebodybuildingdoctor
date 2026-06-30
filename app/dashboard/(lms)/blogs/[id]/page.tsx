import { notFound } from 'next/navigation';

import BlogView from '@/components/admin/BlogView';
import { getBlogById } from '@/lib/db/blogs';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const blog = await getBlogById(params.id);
  if (!blog) notFound();
  return <BlogView blog={blog} />;
}
