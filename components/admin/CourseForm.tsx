'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createCourse, updateCourse, type Course } from '@/lib/admin-api';
import ThumbnailUpload from '@/components/admin/ThumbnailUpload';

type CourseFormProps = {
  course?: Course;
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(course?.title ?? '');
  const [slug, setSlug] = useState(course?.slug ?? '');
  const [description, setDescription] = useState(course?.description ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? '');
  const [instructorName, setInstructorName] = useState(
    course?.instructorName ?? 'The Bodybuilding Doctor',
  );
  const [level, setLevel] = useState<Course['level']>(course?.level ?? 'beginner');
  const [category, setCategory] = useState(course?.category ?? 'Training');
  const [published, setPublished] = useState(course?.published ?? false);
  const [priceCents, setPriceCents] = useState(course?.priceCents ?? 0);
  const [order, setOrder] = useState(course?.order ?? 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      description,
      thumbnailUrl,
      instructorName,
      level,
      category,
      published,
      priceCents,
      order,
    };

    try {
      if (course) {
        await updateCourse(course.id, payload);
        router.push(`/dashboard/courses/${course.id}`);
        router.refresh();
      } else {
        const created = await createCourse(payload);
        router.push(`/dashboard/courses/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
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
        <div className="md:col-span-2">
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title if empty"
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <ThumbnailUpload
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            folder="courses"
          />
        </div>

        <div>
          <label className={labelClass}>Instructor</label>
          <input
            className={inputClass}
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Level</label>
          <select
            className={inputClass}
            value={level}
            onChange={(e) => setLevel(e.target.value as Course['level'])}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Price (paise / cents)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={priceCents}
            onChange={(e) => setPriceCents(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={labelClass}>Sort order</label>
          <input
            type="number"
            className={inputClass}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-slate-600"
            />
            Published (visible in mobile app)
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : course ? 'Save changes' : 'Create course'}
        </button>
      </div>
    </form>
  );
}
