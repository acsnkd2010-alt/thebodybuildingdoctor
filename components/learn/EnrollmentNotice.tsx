import Link from 'next/link';

type EnrollmentNoticeProps = {
  enrolled: boolean;
};

export default function EnrollmentNotice({ enrolled }: EnrollmentNoticeProps) {
  if (enrolled) {
    return (
      <span className="inline-flex rounded-full border border-emerald-700 bg-emerald-950/30 px-4 py-2 text-sm font-medium text-emerald-300">
        Enrolled
      </span>
    );
  }

  return (
    <p className="text-sm text-slate-400">
      Enrollment is managed by an administrator. Request access via the{' '}
      <Link href="/#apply" className="text-accent hover:underline">
        application form
      </Link>{' '}
      or contact your coach.
    </p>
  );
}
