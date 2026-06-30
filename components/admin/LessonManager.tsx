'use client';

import { useState } from 'react';
import {
  Bars3Icon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import RichTextEditor from '@/components/admin/RichTextEditor';
import {
  createLesson,
  deleteLesson,
  formatDuration,
  reorderLessons,
  updateLesson,
  type Lesson,
} from '@/lib/admin-api';

type LessonManagerProps = {
  courseId: string;
  initialLessons: Lesson[];
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none';

function sortLessons(items: Lesson[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function reorderItems(items: Lesson[], sourceId: string, targetId: string) {
  const sourceIndex = items.findIndex((lesson) => lesson.id === sourceId);
  const targetIndex = items.findIndex((lesson) => lesson.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export default function LessonManager({ courseId, initialLessons }: LessonManagerProps) {
  const [lessons, setLessons] = useState(() => sortLessons(initialLessons));
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
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

  async function persistOrder(nextLessons: Lesson[]) {
    const lessonIds = nextLessons.map((lesson) => lesson.id);
    const { lessons: updated } = await reorderLessons(courseId, lessonIds);
    setLessons(sortLessons(updated));
  }

  function handleDragStart(event: React.DragEvent, lessonId: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', lessonId);
    setDraggingId(lessonId);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragOver(event: React.DragEvent, lessonId: string) {
    event.preventDefault();
    if (draggingId && draggingId !== lessonId) {
      setDragOverId(lessonId);
    }
  }

  async function handleDrop(event: React.DragEvent, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    setDraggingId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId || isReordering) return;

    const previous = lessons;
    const next = reorderItems(lessons, sourceId, targetId);
    if (next === lessons) return;

    setLessons(next);
    setIsReordering(true);
    setError(null);
    try {
      await persistOrder(next);
    } catch (err) {
      setLessons(previous);
      setError(err instanceof Error ? err.message : 'Failed to reorder lessons');
    } finally {
      setIsReordering(false);
    }
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
        setLessons((prev) => sortLessons(prev.map((item) => (item.id === editingId ? updated : item))));
        cancelEdit();
      } else {
        const lesson = await createLesson(courseId, {
          title,
          videoUrl,
          durationSec,
          contentHtml,
          freePreview,
        });
        setLessons((prev) => sortLessons([...prev, lesson]));
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
      const remaining = lessons.filter((item) => item.id !== lesson.id);
      if (remaining.length > 0) {
        await persistOrder(remaining);
      } else {
        setLessons([]);
      }
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
          <p className="text-sm text-slate-400">
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
            {lessons.length > 1 && ' · drag to reorder'}
            {isReordering && (
              <span className="ml-2 text-xs text-slate-500">Saving order…</span>
            )}
          </p>
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

      {error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {(showForm || editingId) && (
        <form onSubmit={handleSaveLesson} className="card-surface p-5 space-y-4">
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
            <label className="block text-xs text-slate-400 mb-1">Content</label>
            <RichTextEditor
              value={contentHtml}
              onChange={setContentHtml}
              placeholder="Lesson notes, instructions, or supplementary text…"
              minHeight="200px"
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
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onDragOver={(event) => handleDragOver(event, lesson.id)}
              onDragLeave={() => {
                if (dragOverId === lesson.id) setDragOverId(null);
              }}
              onDrop={(event) => handleDrop(event, lesson.id)}
              className={`flex items-start justify-between gap-4 p-4 transition-colors ${
                draggingId === lesson.id ? 'opacity-40' : ''
              } ${
                dragOverId === lesson.id
                  ? 'bg-accent/10 ring-1 ring-inset ring-accent/40'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  role="button"
                  tabIndex={0}
                  draggable={!isReordering && lessons.length > 1}
                  title="Drag to reorder"
                  aria-label={`Drag to reorder ${lesson.title}`}
                  onDragStart={(event) => handleDragStart(event, lesson.id)}
                  onDragEnd={handleDragEnd}
                  className="mt-0.5 rounded border border-slate-700 p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 cursor-grab active:cursor-grabbing disabled:opacity-30 select-none touch-none"
                >
                  <Bars3Icon className="w-4 h-4 pointer-events-none" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-100">
                    {index + 1}. {lesson.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {lesson.videoUrl || 'No video URL'} · {formatDuration(lesson.durationSec)}
                  </div>
                  {lesson.freePreview && (
                    <span className="pill mt-2 border-sky-700 text-sky-300">Free preview</span>
                  )}
                </div>
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
