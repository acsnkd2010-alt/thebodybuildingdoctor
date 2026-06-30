import BlogAccessForm from '@/components/admin/BlogAccessForm';

export const metadata = { title: 'Grant blog access' };

export default function NewBlogAccessPage({
  searchParams,
}: {
  searchParams: { uid?: string };
}) {
  return <BlogAccessForm defaultUid={searchParams.uid ?? ''} />;
}
