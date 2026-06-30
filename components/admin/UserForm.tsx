'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ASSIGNABLE_ROLES } from '@/lib/admin/serialize-user';
import { createUser, updateUser, type AdminUser } from '@/lib/admin-api';

type UserFormProps = {
  user?: AdminUser;
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [role, setRole] = useState(user?.role ?? 'student');
  const [roles, setRoles] = useState<string[]>(user?.roles ?? []);
  const [disabled, setDisabled] = useState(user?.disabled ?? false);

  function toggleRole(roleName: string) {
    setRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (user) {
        await updateUser(user.uid, {
          email,
          displayName,
          role,
          roles,
          disabled,
          ...(password ? { password } : {}),
        });
        router.push(`/dashboard/users/${user.uid}`);
        router.refresh();
      } else {
        if (!password) {
          setError('Password is required for new users');
          setSaving(false);
          return;
        }
        const created = await createUser({ email, password, displayName, role, roles });
        router.push(`/dashboard/users/${created.uid}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
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
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{user ? 'New password (optional)' : 'Password'}</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
            minLength={6}
          />
        </div>
        <div>
          <label className={labelClass}>Display name</label>
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Profile role</label>
          <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            Mobile app users are created here by an admin. After creating the account, enroll them
            in courses and grant blog access from the user detail page.
          </p>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Firebase custom claim roles</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {ASSIGNABLE_ROLES.filter((r) => r !== 'student').map((roleName) => (
              <label key={roleName} className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={roles.includes(roleName)}
                  onChange={() => toggleRole(roleName)}
                />
                {roleName}
              </label>
            ))}
          </div>
        </div>
        {user && (
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              Account disabled
            </label>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : user ? 'Save changes' : 'Create user'}
      </button>
    </form>
  );
}
