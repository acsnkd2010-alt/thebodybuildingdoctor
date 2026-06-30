'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  createEnrollment,
  fetchCourses,
  fetchUsers,
  updateEnrollment,
  type Course,
  type Enrollment,
} from '@/lib/admin-api';

type EnrollmentFormProps = {
  enrollment?: Enrollment;
  defaultUid?: string;
  defaultCourseId?: string;
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function EnrollmentForm({
  enrollment,
  defaultUid = '',
  defaultCourseId = '',
}: EnrollmentFormProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uid, setUid] = useState(enrollment?.uid ?? defaultUid);
  const [courseId, setCourseId] = useState(enrollment?.courseId ?? defaultCourseId);
  const [email, setEmail] = useState('');
  const [source, setSource] = useState(enrollment?.source ?? 'admin');
  const [status, setStatus] = useState(enrollment?.status ?? 'active');
  const [expiresAt, setExpiresAt] = useState(
    enrollment?.expiresAt ? enrollment.expiresAt.slice(0, 10) : '',
  );

  useEffect(() => {
    fetchCourses().then((data) => setCourses(data.courses)).catch(() => {});
  }, []);

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
      if (enrollment) {
        await updateEnrollment(enrollment.uid, enrollment.courseId, {
          source,
          status,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        });
        router.push(
          `/dashboard/enrollments/${encodeURIComponent(enrollment.uid)}/${encodeURIComponent(enrollment.courseId)}`,
        );
      } else {
        if (!uid || !courseId) {
          setError('User and course are required');
          setSaving(false);
          return;
        }
        const { enrollment: created } = await createEnrollment({
          uid,
          courseId,
          source,
          status,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        });
        router.push(
          `/dashboard/enrollments/${encodeURIComponent(created.uid)}/${encodeURIComponent(created.courseId)}`,
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save enrollment');
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

      <div className="grid gap-5 md:grid-cols-2">
        {!enrollment && (
          <>
            <div>
              <label className={labelClass}>Student email (lookup)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
                >
                  Look up
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>User UID</label>
              <input
                className={inputClass}
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className={enrollment ? '' : 'md:col-span-2'}>
          <label className={labelClass}>Course</label>
          <select
            className={inputClass}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            disabled={!!enrollment}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Source</label>
          <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="free">Free</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Expires at (optional)</label>
          <input
            type="date"
            className={inputClass}
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : enrollment ? 'Save changes' : 'Create enrollment'}
      </button>
    </form>
  );
}
