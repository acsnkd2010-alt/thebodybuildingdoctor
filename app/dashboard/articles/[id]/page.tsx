import { notFound } from 'next/navigation';
import Link from 'next/link';

import BlogArticleView from '@/components/BlogArticleView';
import { getBlogById } from '@/lib/db/blogs';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const blog = await getBlogById(params.id);
  return { title: blog?.title ?? 'Article' };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card-surface max-w-lg w-full p-8 text-center space-y-4">
          <div className="pill mx-auto">Members Only</div>
          <h1 className="text-xl font-semibold">Sign in to read this article</h1>
          <Link
            href="/login"
            className="inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const blog = await getBlogById(params.id);
  if (!blog || !blog.published) {
    notFound();
  }

  return <BlogArticleView blog={blog} />;
}
