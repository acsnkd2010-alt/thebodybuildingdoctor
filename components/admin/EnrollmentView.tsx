'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  deleteEnrollment,
  fetchCourses,
  fetchEnrollment,
  type Course,
  type Enrollment,
} from '@/lib/admin-api';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function EnrollmentView({
  uid,
  courseId,
}: {
  uid: string;
  courseId: string;
}) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [enrollmentData, courseData] = await Promise.all([
          fetchEnrollment(uid, courseId),
          fetchCourses(),
        ]);
        setEnrollment(enrollmentData.enrollment);
        setCourse(courseData.courses.find((c) => c.id === courseId) ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load enrollment');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid, courseId]);

  async function handleDelete() {
    if (!confirm('Delete this enrollment permanently?')) return;
    setDeleting(true);
    try {
      await deleteEnrollment(uid, courseId, true);
      router.push('/dashboard/enrollments');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400">Loading enrollment…</div>;
  if (error || !enrollment) {
    return <div className="card-surface p-6 text-sm text-red-300">{error ?? 'Not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/dashboard/enrollments"
        backLabel="Back to enrollments"
        title="Enrollment details"
        editHref={`/dashboard/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}/edit`}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <div className="card-surface p-6 grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">User UID</div>
          <div className="text-slate-100 font-mono text-xs">{enrollment.uid}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Course</div>
          <div className="text-slate-100">{course?.title ?? enrollment.courseId}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Source</div>
          <div className="text-slate-100 capitalize">{enrollment.source}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`pill ${
              enrollment.status === 'active'
                ? 'border-emerald-700 text-emerald-300'
                : 'border-slate-600 text-slate-400'
            }`}
          >
            {enrollment.status}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Enrolled at</div>
          <div className="text-slate-300">{formatDate(enrollment.enrolledAt)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Expires at</div>
          <div className="text-slate-300">{formatDate(enrollment.expiresAt)}</div>
        </div>
      </div>

      <Link
        href={`/dashboard/users/${encodeURIComponent(enrollment.uid)}`}
        className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
      >
        View user
      </Link>
    </div>
  );
}
