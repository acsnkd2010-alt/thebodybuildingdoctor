'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  fetchUsers,
  grantBlogAccess,
  updateBlogAccess,
  type BlogAccess,
} from '@/lib/admin-api';

type BlogAccessFormProps = {
  blogAccess?: BlogAccess;
  defaultUid?: string;
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function BlogAccessForm({
  blogAccess,
  defaultUid = '',
}: BlogAccessFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uid, setUid] = useState(blogAccess?.uid ?? defaultUid);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(blogAccess?.status ?? 'active');
  const [note, setNote] = useState(blogAccess?.note ?? '');

  async function handleLookup() {
    if (!email.trim()) return;
    try {
      const data = await fetchUsers({ email: email.trim() });
      const user = data.users[0];
      if (user) setUid(user.uid);
      else setError('No user found with that email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (blogAccess) {
        await updateBlogAccess(blogAccess.uid, { status, note });
        router.push(`/dashboard/blog-access/${encodeURIComponent(blogAccess.uid)}`);
      } else {
        if (!uid) {
          setError('User is required');
          setSaving(false);
          return;
        }
        await grantBlogAccess({ uid, status, note });
        router.push(`/dashboard/blog-access/${encodeURIComponent(uid)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog access');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!blogAccess && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Find user by email</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
              />
              <button
                type="button"
                onClick={handleLookup}
                className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Lookup
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>User ID (uid)</label>
            <input
              className={inputClass}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      {blogAccess && (
        <div className="text-sm text-slate-400">
          User: <span className="text-slate-200 font-mono">{blogAccess.uid}</span>
        </div>
      )}

      <div>
        <label className={labelClass}>Status</label>
        <select
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Note (optional)</label>
        <input
          className={inputClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Saving…' : blogAccess ? 'Save changes' : 'Grant blog access'}
      </button>
    </form>
  );
}
