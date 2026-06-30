'use client';

import { useCallback, useEffect, useState } from 'react';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  courseTitle: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string | null;
};

const typeLabels: Record<string, string> = {
  mentorship: 'Mentorship',
  courses: 'Courses',
  both: 'Mentorship & courses',
};

const statusStyles: Record<string, string> = {
  new: 'border-sky-700 text-sky-300',
  contacted: 'border-amber-700 text-amber-300',
  closed: 'border-slate-600 text-slate-400',
};

export default function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load inquiries');
      setInquiries(data.inquiries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: Inquiry['status']) {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading inquiries…</p>;
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error}
        <button type="button" onClick={load} className="block mt-2 text-accent hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-slate-400">
        No inquiries yet. Submissions from the landing page will appear here.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Interest</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                  {inquiry.createdAt
                    ? new Date(inquiry.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3 font-medium text-slate-100">{inquiry.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  <a href={`mailto:${inquiry.email}`} className="hover:text-accent">
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <div className="text-xs text-slate-500 mt-0.5">{inquiry.phone}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div>{typeLabels[inquiry.type] ?? inquiry.type}</div>
                  {inquiry.courseTitle && (
                    <div className="text-xs text-slate-500 mt-0.5">{inquiry.courseTitle}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 max-w-xs">
                  <p className="line-clamp-3 text-xs">{inquiry.message || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={inquiry.status}
                    disabled={updatingId === inquiry.id}
                    onChange={(e) =>
                      updateStatus(inquiry.id, e.target.value as Inquiry['status'])
                    }
                    className={`rounded-lg border bg-slate-900 px-2 py-1 text-xs ${statusStyles[inquiry.status]}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
