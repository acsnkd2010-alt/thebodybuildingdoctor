'use client';

import { useRef, useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

import { uploadThumbnail } from '@/lib/admin-api';

type ThumbnailUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder: 'courses' | 'blogs';
  label?: string;
};

const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';
const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';

export default function ThumbnailUpload({
  value,
  onChange,
  folder,
  label = 'Thumbnail',
}: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const result = await uploadThumbnail(file, folder);
      onChange(result.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <label className={labelClass}>{label}</label>

      {value ? (
        <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
          <img src={value} alt="Thumbnail preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full max-w-sm aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-900/50 text-slate-500">
          <PhotoIcon className="w-10 h-10 opacity-50" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div>
        <label className={labelClass}>Or paste image URL</label>
        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
      <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF · max 5 MB · stored on Vercel Blob (free tier)</p>
    </div>
  );
}
