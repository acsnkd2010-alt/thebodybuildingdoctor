import { randomUUID } from 'crypto';
import { put } from '@vercel/blob';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type UploadFolder = 'courses' | 'blogs';

export async function uploadImageToStorage(
  file: Buffer,
  contentType: string,
  folder: UploadFolder,
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not set. Create a Blob store in Vercel → Storage, then add the token to web/.env.local and redeploy.',
    );
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed.');
  }

  if (file.length > MAX_BYTES) {
    throw new Error('Image must be 5 MB or smaller.');
  }

  const ext = EXT_BY_TYPE[contentType] ?? 'jpg';
  const pathname = `thumbnails/${folder}/${randomUUID()}.${ext}`;

  const blob = await put(pathname, file, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, path: blob.pathname };
}
