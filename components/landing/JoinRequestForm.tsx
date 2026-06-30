'use client';

import { useState } from 'react';

type CourseOption = {
  id: string;
  title: string;
};

type JoinRequestFormProps = {
  courses: CourseOption[];
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

export default function JoinRequestForm({ courses }: JoinRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'mentorship' | 'courses' | 'both' | ''>('');
  const [courseId, setCourseId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          type,
          courseId: type === 'mentorship' ? '' : courseId,
          message,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setType('');
      setCourseId('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card-surface p-8 text-center space-y-4">
        <div className="pill mx-auto border-emerald-700 text-emerald-300">Request received</div>
        <h3 className="text-xl font-semibold text-slate-100">Thank you for reaching out</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          We&apos;ve received your application. A member of the team will contact you by email
          shortly to discuss mentorship or course access.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-sm text-accent hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  const showCourseSelect = type === 'courses' || type === 'both';

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inquiry-name" className="block text-xs text-slate-400 mb-1.5">
            Full name *
          </label>
          <input
            id="inquiry-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="inquiry-email" className="block text-xs text-slate-400 mb-1.5">
            Email *
          </label>
          <input
            id="inquiry-email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="inquiry-phone" className="block text-xs text-slate-400 mb-1.5">
          Phone <span className="text-slate-600">(optional)</span>
        </label>
        <input
          id="inquiry-phone"
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>

      <fieldset>
        <legend className="block text-xs text-slate-400 mb-2">I&apos;m interested in *</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {(
            [
              { value: 'mentorship', label: '1-on-1 mentorship' },
              { value: 'courses', label: 'Online courses' },
              { value: 'both', label: 'Both' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm cursor-pointer transition ${
                type === option.value
                  ? 'border-accent bg-accent/10 text-slate-100'
                  : 'border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="inquiry-type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
                className="accent-accent"
                required
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {showCourseSelect && courses.length > 0 && (
        <div>
          <label htmlFor="inquiry-course" className="block text-xs text-slate-400 mb-1.5">
            Course of interest <span className="text-slate-600">(optional)</span>
          </label>
          <select
            id="inquiry-course"
            className={inputClass}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Not sure yet / general interest</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="inquiry-message" className="block text-xs text-slate-400 mb-1.5">
          Tell us about your goals <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          id="inquiry-message"
          rows={4}
          className={inputClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Experience level, competition goals, timeline, questions…"
        />
      </div>

      {error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Submit request'}
      </button>
    </form>
  );
}
