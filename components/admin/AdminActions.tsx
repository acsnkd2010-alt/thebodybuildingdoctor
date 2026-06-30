import Link from 'next/link';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

type AdminActionsProps = {
  viewHref?: string;
  editHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
  deleteLabel?: string;
};

export default function AdminActions({
  viewHref,
  editHref,
  onDelete,
  deleting,
  deleteLabel = 'Delete',
}: AdminActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {viewHref && (
        <Link
          href={viewHref}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          <EyeIcon className="w-3.5 h-3.5" />
          View
        </Link>
      )}
      {editHref && (
        <Link
          href={editHref}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
          Edit
        </Link>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40 disabled:opacity-50"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          {deleting ? 'Deleting…' : deleteLabel}
        </button>
      )}
    </div>
  );
}
