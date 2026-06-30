'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  deleteCourse,
  formatDuration,
  formatPrice,
  type Course,
  type Lesson,
} from '@/lib/admin-api';

export default function CourseView({
  course,
  lessons,
}: {
  course: Course;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${course.title}" and all lessons?`)) return;
    setDeleting(true);
    try {
      await deleteCourse(course.id);
      router.push('/dashboard/courses');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete course');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/dashboard/courses"
        backLabel="Back to courses"
        title={course.title}
        editHref={`/dashboard/courses/${course.id}/edit`}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {course.thumbnailUrl && (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full max-h-64 object-cover rounded-2xl border border-slate-800"
        />
      )}

      <div className="card-surface p-6 grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">Slug</div>
          <div className="text-slate-100">{course.slug}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`pill ${course.published ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
          >
            {course.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Instructor</div>
          <div className="text-slate-100">{course.instructorName}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Level / Category</div>
          <div className="text-slate-100 capitalize">
            {course.level} · {course.category}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Price</div>
          <div className="text-slate-100">{formatPrice(course.priceCents)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Lessons / Duration</div>
          <div className="text-slate-100">
            {course.lessonCount} · {formatDuration(course.totalDurationSec)}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-slate-500 mb-1">Description</div>
          <div className="text-slate-300 whitespace-pre-wrap">{course.description || '—'}</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Lessons ({lessons.length})</h3>
        {lessons.length === 0 ? (
          <div className="card-surface p-6 text-sm text-slate-400">No lessons yet.</div>
        ) : (
          <div className="card-surface divide-y divide-slate-800">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-4">
                <div className="font-medium text-slate-100">
                  {lesson.order}. {lesson.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {lesson.videoUrl || 'No video'} · {formatDuration(lesson.durationSec)}
                  {lesson.freePreview ? ' · Free preview' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          href={`/dashboard/courses/${course.id}/edit`}
          className="inline-flex text-sm text-accent hover:underline"
        >
          Manage lessons →
        </Link>
      </div>
    </div>
  );
}
