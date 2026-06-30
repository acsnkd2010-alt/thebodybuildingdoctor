export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  published: boolean;
  priceCents: number;
  lessonCount: number;
  totalDurationSec: number;
  order: number;
  createdAt: string | null;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  durationSec: number;
  videoUrl: string;
  contentHtml?: string;
  freePreview: boolean;
};

export type Enrollment = {
  uid: string;
  courseId: string;
  enrolledAt: string;
  source: string;
  status: string;
  expiresAt: string | null;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl: string;
  authorName: string;
  published: boolean;
  publishedAt: string | null;
  order: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BlogAccess = {
  uid: string;
  grantedAt: string;
  status: string;
  note: string;
};

export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  roles: string[];
  createdAt: string | null;
  lastSignIn: string | null;
  disabled: boolean;
};

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Request failed');
  }
  return data as T;
}

export function fetchCourses() {
  return adminFetch<{ courses: Course[] }>('/api/admin/courses');
}

export function fetchCourse(id: string) {
  return adminFetch<{ course: Course; lessons: Lesson[] }>(`/api/admin/courses/${id}`);
}

export function createCourse(body: Partial<Course>) {
  return adminFetch<Course>('/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCourse(id: string, body: Partial<Course>) {
  return adminFetch<Course>(`/api/admin/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteCourse(id: string) {
  return adminFetch<{ success: boolean }>(`/api/admin/courses/${id}`, { method: 'DELETE' });
}

export function createLesson(courseId: string, body: Partial<Lesson>) {
  return adminFetch<Lesson>(`/api/admin/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateLesson(courseId: string, lessonId: string, body: Partial<Lesson>) {
  return adminFetch<Lesson>(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteLesson(courseId: string, lessonId: string) {
  return adminFetch<{ success: boolean }>(
    `/api/admin/courses/${courseId}/lessons/${lessonId}`,
    { method: 'DELETE' },
  );
}

export function fetchEnrollments(params?: { uid?: string; courseId?: string }) {
  const search = new URLSearchParams();
  if (params?.uid) search.set('uid', params.uid);
  if (params?.courseId) search.set('courseId', params.courseId);
  const qs = search.toString();
  return adminFetch<{ enrollments: Enrollment[] }>(
    `/api/admin/enrollments${qs ? `?${qs}` : ''}`,
  );
}

export function fetchUsers(params?: { email?: string; uid?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params?.email) search.set('email', params.email);
  if (params?.uid) search.set('uid', params.uid);
  if (params?.q) search.set('q', params.q);
  const qs = search.toString();
  return adminFetch<{ users: AdminUser[]; total?: number }>(
    `/api/admin/users${qs ? `?${qs}` : ''}`,
  );
}

export function fetchUser(uid: string) {
  return adminFetch<AdminUser>(`/api/admin/users/${uid}`);
}

export function createUser(body: {
  email: string;
  password: string;
  displayName?: string;
  role?: string;
  roles?: string[];
}) {
  return adminFetch<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateUser(
  uid: string,
  body: {
    email?: string;
    password?: string;
    displayName?: string;
    role?: string;
    roles?: string[];
    disabled?: boolean;
  },
) {
  return adminFetch<AdminUser>(`/api/admin/users/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteUser(uid: string) {
  return adminFetch<{ success: boolean }>(`/api/admin/users/${uid}`, { method: 'DELETE' });
}

export function fetchEnrollment(uid: string, courseId: string) {
  return adminFetch<{ enrollment: Enrollment }>(
    `/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}`,
  );
}

export function createEnrollment(body: {
  uid: string;
  courseId: string;
  source?: string;
  status?: string;
  expiresAt?: string | null;
}) {
  return adminFetch<{ enrollment: Enrollment }>('/api/admin/enrollments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateEnrollment(
  uid: string,
  courseId: string,
  body: {
    source?: string;
    status?: string;
    expiresAt?: string | null;
  },
) {
  return adminFetch<{ enrollment: Enrollment }>(
    `/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function deleteEnrollment(uid: string, courseId: string, hard = false) {
  const qs = new URLSearchParams({ hard: String(hard) });
  return adminFetch<{ success: boolean }>(
    `/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}?${qs}`,
    { method: 'DELETE' },
  );
}

export function grantEnrollment(
  uid: string,
  courseId: string,
  body?: { source?: string; status?: string; expiresAt?: string | null },
) {
  return createEnrollment({ uid, courseId, source: 'admin', ...body });
}

export function revokeEnrollment(uid: string, courseId: string) {
  const qs = new URLSearchParams({ uid, courseId });
  return adminFetch<{ success: boolean }>(`/api/admin/enrollments?${qs}`, { method: 'DELETE' });
}

export function fetchBlogs() {
  return adminFetch<{ blogs: Blog[] }>('/api/admin/blogs');
}

export function fetchBlog(id: string) {
  return adminFetch<{ blog: Blog }>(`/api/admin/blogs/${id}`);
}

export function createBlog(body: Partial<Blog>) {
  return adminFetch<Blog>('/api/admin/blogs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBlog(id: string, body: Partial<Blog>) {
  return adminFetch<Blog>(`/api/admin/blogs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteBlog(id: string) {
  return adminFetch<{ success: boolean }>(`/api/admin/blogs/${id}`, { method: 'DELETE' });
}

export function fetchBlogAccessList(params?: { status?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  return adminFetch<{ blogAccess: BlogAccess[] }>(
    `/api/admin/blog-access${qs ? `?${qs}` : ''}`,
  );
}

export function fetchBlogAccess(uid: string) {
  return adminFetch<{ blogAccess: BlogAccess }>(
    `/api/admin/blog-access/${encodeURIComponent(uid)}`,
  );
}

export function grantBlogAccess(body: { uid: string; status?: string; note?: string }) {
  return adminFetch<{ blogAccess: BlogAccess }>('/api/admin/blog-access', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBlogAccess(
  uid: string,
  body: { status?: string; note?: string },
) {
  return adminFetch<{ blogAccess: BlogAccess }>(
    `/api/admin/blog-access/${encodeURIComponent(uid)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function deleteBlogAccess(uid: string, hard = false) {
  const qs = new URLSearchParams({ hard: String(hard) });
  return adminFetch<{ success: boolean }>(
    `/api/admin/blog-access/${encodeURIComponent(uid)}?${qs}`,
    { method: 'DELETE' },
  );
}

export async function uploadThumbnail(file: File, folder: 'courses' | 'blogs') {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Upload failed');
  }
  return data as { url: string; path: string };
}

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPrice(cents: number) {
  if (cents === 0) return 'Free';
  return `₹${(cents / 100).toFixed(0)}`;
}
