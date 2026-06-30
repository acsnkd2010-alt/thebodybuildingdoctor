'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

import {
  deleteCourse,
  fetchCourses,
  formatDuration,
  formatPrice,
  type Course,
} from '@/lib/admin-api';
import AdminActions from '@/components/admin/AdminActions';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCourses();
      setCourses(data.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.title}" and all its lessons?`)) return;
    setDeletingId(course.id);
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((item) => item.id !== course.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading courses…</div>;
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error}
        <button type="button" onClick={load} className="block mt-3 text-accent underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">{courses.length} course{courses.length === 1 ? '' : 's'}</p>
        <Link
          href="/dashboard/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          <PlusIcon className="w-4 h-4" />
          New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card-surface p-8 text-center text-slate-400">
          No courses yet. Create your first course to get started.
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Level</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Lessons</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{course.title}</div>
                    <div className="text-xs text-slate-500">{course.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell capitalize text-slate-300">
                    {course.level}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-300">
                    {course.lessonCount} · {formatDuration(course.totalDurationSec)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-300">
                    {formatPrice(course.priceCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`pill ${course.published ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminActions
                      viewHref={`/dashboard/courses/${course.id}`}
                      editHref={`/dashboard/courses/${course.id}/edit`}
                      onDelete={() => handleDelete(course)}
                      deleting={deletingId === course.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
