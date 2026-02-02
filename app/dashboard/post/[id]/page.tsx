import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchWordPressPost, getFeaturedImageUrl, getFeaturedVideoUrl, getFeaturedAudioUrl } from '../../../../lib/wordpress';
import { getSessionUser } from '../../../../lib/auth/session';
import SinglePostView from '../../../../components/SinglePostView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function SinglePostPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="card-surface max-w-lg w-full p-8 text-center space-y-4">
          <div className="pill mx-auto">Members Only</div>
          <h1 className="text-xl font-semibold">Sign in to read this article</h1>
          <Link
            href="/login"
            className="inline-block rounded-full bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const id = params?.id ?? '';
  const postId = parseInt(id, 10);
  if (isNaN(postId)) {
    notFound();
  }

  let post;
  try {
    post = await fetchWordPressPost(postId);
  } catch {
    notFound();
  }

  if (!post || typeof post.id !== 'number') {
    notFound();
  }

  const featuredImageUrl = getFeaturedImageUrl(post);
  const featuredVideoUrl = getFeaturedVideoUrl(post);
  const featuredAudioUrl = getFeaturedAudioUrl(post);

  return (
    <div className="min-h-full overflow-y-auto px-4 md:px-8 py-6 md:py-10">
      <SinglePostView
        post={post}
        featuredImageUrl={featuredImageUrl}
        featuredVideoUrl={featuredVideoUrl}
        featuredAudioUrl={featuredAudioUrl}
        userId={user.id}
      />
    </div>
  );
}
