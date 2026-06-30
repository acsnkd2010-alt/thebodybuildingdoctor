import BlogAccessView from '@/components/admin/BlogAccessView';

export const dynamic = 'force-dynamic';

export default function BlogAccessDetailPage({ params }: { params: { uid: string } }) {
  return <BlogAccessView uid={params.uid} />;
}
