import { hasBlogRoleAccess, parseRoles } from '@/lib/auth/roles';
import { getMongoDb } from '@/lib/mongodb';

export type BlogAccessDoc = {
  _id: string;
  uid: string;
  grantedAt: Date;
  status: 'active' | 'revoked';
  note?: string;
};

export function serializeBlogAccess(doc: BlogAccessDoc) {
  return {
    uid: doc.uid,
    grantedAt: doc.grantedAt.toISOString(),
    status: doc.status,
    note: doc.note ?? '',
  };
}

export async function getBlogAccess(uid: string) {
  const db = await getMongoDb();
  const doc = await db.collection<BlogAccessDoc>('blog_access').findOne({ _id: uid });
  if (!doc || doc.status !== 'active') return null;
  return serializeBlogAccess(doc);
}

export async function getBlogAccessAdmin(uid: string) {
  const db = await getMongoDb();
  const doc = await db.collection<BlogAccessDoc>('blog_access').findOne({ _id: uid });
  if (!doc) return null;
  return serializeBlogAccess(doc);
}

export async function hasBlogAccess(uid: string, tokenRoles?: unknown) {
  if (hasBlogRoleAccess(parseRoles(tokenRoles))) {
    return true;
  }
  const access = await getBlogAccess(uid);
  return access !== null;
}

export async function resolveBlogAccess(uid: string, tokenRoles?: unknown) {
  const roles = parseRoles(tokenRoles);
  if (hasBlogRoleAccess(roles)) {
    return { hasAccess: true, blogAccess: null, source: 'role' as const };
  }
  const blogAccess = await getBlogAccess(uid);
  return {
    hasAccess: blogAccess !== null,
    blogAccess,
    source: blogAccess ? ('grant' as const) : null,
  };
}

export async function grantBlogAccess(uid: string, options: { status?: BlogAccessDoc['status']; note?: string } = {}) {
  const db = await getMongoDb();
  const doc: BlogAccessDoc = {
    _id: uid,
    uid,
    grantedAt: new Date(),
    status: options.status ?? 'active',
    note: options.note,
  };

  await db.collection<BlogAccessDoc>('blog_access').updateOne(
    { _id: uid },
    { $set: doc },
    { upsert: true },
  );

  return serializeBlogAccess(doc);
}

export async function revokeBlogAccess(uid: string) {
  const db = await getMongoDb();
  await db.collection<BlogAccessDoc>('blog_access').updateOne(
    { _id: uid },
    { $set: { status: 'revoked' } },
  );
}

export async function updateBlogAccess(
  uid: string,
  updates: Partial<Pick<BlogAccessDoc, 'status' | 'note'>>,
) {
  const db = await getMongoDb();
  const result = await db.collection<BlogAccessDoc>('blog_access').updateOne(
    { _id: uid },
    { $set: updates },
  );
  if (result.matchedCount === 0) return null;
  return getBlogAccessAdmin(uid);
}

export async function deleteBlogAccess(uid: string) {
  const db = await getMongoDb();
  const result = await db.collection<BlogAccessDoc>('blog_access').deleteOne({ _id: uid });
  return result.deletedCount > 0;
}

export async function listBlogAccess(filters: { status?: BlogAccessDoc['status'] } = {}) {
  const db = await getMongoDb();
  const query: Record<string, string> = {};
  if (filters.status) query.status = filters.status;
  const docs = await db.collection<BlogAccessDoc>('blog_access').find(query).toArray();
  return docs.map(serializeBlogAccess);
}
