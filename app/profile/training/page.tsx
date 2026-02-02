'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';

interface TrainingEntry {
  id: string;
  date: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

export default function TrainingLogPage() {
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    notes: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const res = await fetch('/api/profile/training-log', { credentials: 'include' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.entries)) {
        setEntries(data.entries);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);
    try {
      const res = await fetch('/api/profile/training-log', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.message || 'Failed to add entry', type: 'error' });
        return;
      }
      setEntries(data.entries ?? []);
      setToast({ message: 'Entry added', type: 'success' });
      setForm({
        date: new Date().toISOString().slice(0, 10),
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        notes: '',
      });
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full overflow-y-auto px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to profile
        </Link>
        <h1 className="text-xl font-semibold mb-1">Gym training log</h1>
        <p className="text-sm text-slate-400 mb-6">Record your workouts</p>

        <div className="card-surface p-6 rounded-2xl mb-6">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Add entry</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Exercise</label>
                <input
                  type="text"
                  value={form.exercise}
                  onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="e.g. Bench press"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Sets</label>
                <input
                  type="text"
                  value={form.sets}
                  onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Reps</label>
                <input
                  type="text"
                  value={form.reps}
                  onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="60"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-accent text-slate-950 text-sm font-semibold py-2 px-4 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              {isSubmitting ? 'Adding...' : 'Add entry'}
            </button>
          </form>
        </div>

        <div className="card-surface p-6 rounded-2xl">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Your entries</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-slate-500">No entries yet. Add one above.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-baseline gap-2 py-3 border-b border-slate-800 last:border-0 text-sm"
                >
                  <span className="text-slate-500 font-medium">{entry.date}</span>
                  <span className="text-slate-200">{entry.exercise || '—'}</span>
                  {(entry.sets || entry.reps || entry.weight) && (
                    <span className="text-slate-400">
                      {[entry.sets && `${entry.sets} sets`, entry.reps && `${entry.reps} reps`, entry.weight && `${entry.weight} kg`]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                  {entry.notes && <span className="text-slate-500 italic">{entry.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
