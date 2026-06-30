'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

import AdminActions from '@/components/admin/AdminActions';
import {
  deleteEnrollment,
  fetchCourses,
  fetchEnrollments,
  type Course,
  type Enrollment,
} from '@/lib/admin-api';

export default function EnrollmentList() {
  const searchParams = useSearchParams();
  const filterUid = searchParams.get('uid')?.trim() ?? '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const courseMap = Object.fromEntries(courses.map((course) => [course.id, course.title]));

  async function load(uid = filterUid) {
    setLoading(true);
    setError(null);
    try {
      const [courseData, enrollmentData] = await Promise.all([
        fetchCourses(),
        fetchEnrollments(uid ? { uid } : undefined),
      ]);
      setCourses(courseData.courses);
      setEnrollments(enrollmentData.enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filterUid);
  }, [filterUid]);

  async function handleDelete(enrollment: Enrollment) {
    if (!confirm('Delete this enrollment permanently?')) return;
    const key = `${enrollment.uid}_${enrollment.courseId}`;
    setDeletingKey(key);
    try {
      await deleteEnrollment(enrollment.uid, enrollment.courseId, true);
      setEnrollments((prev) =>
        prev.filter(
          (item) => !(item.uid === enrollment.uid && item.courseId === enrollment.courseId),
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete enrollment');
    } finally {
      setDeletingKey(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading enrollments…</div>;
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error}
        <button type="button" onClick={() => load()} className="block mt-3 text-accent underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filterUid && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          Filtered by user <span className="font-mono text-slate-100">{filterUid}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {enrollments.length} enrollment{enrollments.length === 1 ? '' : 's'}
        </p>
        <Link
          href="/dashboard/enrollments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          <PlusIcon className="w-4 h-4" />
          New enrollment
        </Link>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-900/80 text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => {
                const key = `${enrollment.uid}_${enrollment.courseId}`;
                const base = `/dashboard/enrollments/${encodeURIComponent(enrollment.uid)}/${encodeURIComponent(enrollment.courseId)}`;
                return (
                  <tr key={key} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-300">{enrollment.uid}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {courseMap[enrollment.courseId] ?? enrollment.courseId}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize text-slate-400">
                      {enrollment.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`pill ${
                          enrollment.status === 'active'
                            ? 'border-emerald-700 text-emerald-300'
                            : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminActions
                        viewHref={base}
                        editHref={`${base}/edit`}
                        onDelete={() => handleDelete(enrollment)}
                        deleting={deletingKey === key}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
