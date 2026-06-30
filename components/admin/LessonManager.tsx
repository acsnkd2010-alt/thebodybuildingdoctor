'use client';

import { useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

import {
  createLesson,
  deleteLesson,
  formatDuration,
  updateLesson,
  type Lesson,
} from '@/lib/admin-api';

type LessonManagerProps = {
  courseId: string;
  initialLessons: Lesson[];
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none';

export default function LessonManager({ courseId, initialLessons }: LessonManagerProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [contentHtml, setContentHtml] = useState('');
  const [freePreview, setFreePreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setVideoUrl(lesson.videoUrl);
    setDurationSec(lesson.durationSec);
    setContentHtml(lesson.contentHtml ?? '');
    setFreePreview(lesson.freePreview);
    setShowForm(false);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setVideoUrl('');
    setDurationSec(0);
    setContentHtml('');
    setFreePreview(false);
  }

  async function handleSaveLesson(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await updateLesson(courseId, editingId, {
          title,
          videoUrl,
          durationSec,
          contentHtml,
          freePreview,
        });
        setLessons((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)).sort((a, b) => a.order - b.order),
        );
        cancelEdit();
      } else {
        const lesson = await createLesson(courseId, {
          title,
          videoUrl,
          durationSec,
          contentHtml,
          freePreview,
        });
        setLessons((prev) => [...prev, lesson].sort((a, b) => a.order - b.order));
        setTitle('');
        setVideoUrl('');
        setDurationSec(0);
        setContentHtml('');
        setFreePreview(false);
        setShowForm(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(lesson: Lesson) {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    try {
      await deleteLesson(courseId, lesson.id);
      setLessons((prev) => prev.filter((item) => item.id !== lesson.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete lesson');
    }
  }

  async function handleTogglePreview(lesson: Lesson) {
    try {
      const updated = await updateLesson(courseId, lesson.id, {
        freePreview: !lesson.freePreview,
      });
      setLessons((prev) => prev.map((item) => (item.id === lesson.id ? updated : item)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update lesson');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Lessons</h2>
          <p className="text-sm text-slate-400">{lessons.length} lesson{lessons.length === 1 ? '' : 's'}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          <PlusIcon className="w-4 h-4" />
          Add lesson
        </button>
      </div>

      {(showForm || editingId) && (
        <form onSubmit={handleSaveLesson} className="card-surface p-5 space-y-4">
          {error && <p className="text-sm text-red-300">{error}</p>}
          <h3 className="text-sm font-medium text-slate-200">
            {editingId ? 'Edit lesson' : 'Add lesson'}
          </h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Title</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Video URL</label>
            <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Duration (seconds)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Content (HTML)</label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={freePreview}
              onChange={(e) => setFreePreview(e.target.checked)}
            />
            Free preview
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save lesson' : 'Add lesson'}
            </button>
            <button
              type="button"
              onClick={() => (editingId ? cancelEdit() : setShowForm(false))}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {lessons.length === 0 ? (
        <div className="card-surface p-6 text-sm text-slate-400 text-center">
          No lessons yet. Add your first lesson above.
        </div>
      ) : (
        <div className="card-surface divide-y divide-slate-800">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="font-medium text-slate-100">
                  {lesson.order}. {lesson.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 truncate">
                  {lesson.videoUrl || 'No video URL'} · {formatDuration(lesson.durationSec)}
                </div>
                {lesson.freePreview && (
                  <span className="pill mt-2 border-sky-700 text-sky-300">Free preview</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(lesson)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePreview(lesson)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  {lesson.freePreview ? 'Remove preview' : 'Mark preview'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(lesson)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
