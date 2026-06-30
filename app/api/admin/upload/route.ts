import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/require-admin';
import { uploadImageToStorage, type UploadFolder } from '@/lib/upload-image';

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = form.get('folder');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    if (folder !== 'courses' && folder !== 'blogs') {
      return NextResponse.json({ message: 'folder must be courses or blogs' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';

    const result = await uploadImageToStorage(buffer, contentType, folder as UploadFolder);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('POST /api/admin/upload', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json({ message }, { status: 500 });
  }
}
