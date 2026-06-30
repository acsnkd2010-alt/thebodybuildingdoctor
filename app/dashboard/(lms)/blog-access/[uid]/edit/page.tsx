import { notFound } from 'next/navigation';

import BlogAccessForm from '@/components/admin/BlogAccessForm';
import { getBlogAccessAdmin } from '@/lib/db/blog-access';

export const dynamic = 'force-dynamic';

export default async function EditBlogAccessPage({ params }: { params: { uid: string } }) {
  const blogAccess = await getBlogAccessAdmin(params.uid);
  if (!blogAccess) notFound();
  return <BlogAccessForm blogAccess={blogAccess} />;
}
