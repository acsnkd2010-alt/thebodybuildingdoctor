import InquiryList from '@/components/admin/InquiryList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inquiries',
};

export default function InquiriesPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Join requests</h1>
        <p className="text-sm text-slate-400 mt-1">
          Mentorship and course applications from the public landing page.
        </p>
      </div>
      <InquiryList />
    </div>
  );
}
