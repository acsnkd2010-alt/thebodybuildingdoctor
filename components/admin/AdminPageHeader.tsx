import Link from 'next/link';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

type AdminPageHeaderProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  editHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
};

export default function AdminPageHeader({
  backHref,
  backLabel = 'Back',
  title,
  editHref,
  onDelete,
  deleting,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Link href={backHref} className="text-sm text-slate-400 hover:text-slate-200">
          ← {backLabel}
        </Link>
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      </div>
      <div className="flex gap-2">
        {editHref && (
          <Link
            href={editHref}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Edit
          </Link>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
