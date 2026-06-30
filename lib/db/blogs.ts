import { ObjectId } from 'mongodb';

import { getMongoDb } from '@/lib/mongodb';

export type BlogDoc = {
  _id?: string | ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl?: string;
  authorName?: string;
  published: boolean;
  publishedAt?: Date | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
};

function blogId(doc: BlogDoc & { _id?: string | ObjectId }) {
  return String(doc._id);
}

export function serializeBlog(doc: BlogDoc & { _id: string | ObjectId }) {
  return {
    id: blogId(doc),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    contentHtml: doc.contentHtml,
    thumbnailUrl: doc.thumbnailUrl ?? '',
    authorName: doc.authorName ?? 'The Bodybuilding Doctor',
    published: doc.published,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    order: doc.order,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listPublishedBlogs() {
  const db = await getMongoDb();
  const docs = await db
    .collection<BlogDoc>('blogs')
    .find({ published: true })
    .sort({ order: 1, publishedAt: -1, createdAt: -1 })
    .toArray();
  return docs.map((doc) => serializeBlog(doc as BlogDoc & { _id: string | ObjectId }));
}

export async function listAllBlogs() {
  const db = await getMongoDb();
  const docs = await db
    .collection<BlogDoc>('blogs')
    .find()
    .sort({ order: 1, publishedAt: -1, createdAt: -1 })
    .toArray();
  return docs.map((doc) => serializeBlog(doc as BlogDoc & { _id: string | ObjectId }));
}

export async function getBlogById(id: string) {
  const db = await getMongoDb();
  const doc = await db.collection<BlogDoc>('blogs').findOne({ _id: id as never });
  if (!doc) return null;
  return serializeBlog(doc as BlogDoc & { _id: string | ObjectId });
}

export async function createBlog(data: Omit<BlogDoc, 'createdAt' | 'updatedAt'>) {
  const db = await getMongoDb();
  const now = new Date();
  const id = data._id ? String(data._id) : new ObjectId().toHexString();
  const publishedAt = data.published ? (data.publishedAt ?? now) : null;
  const doc = { ...data, _id: id, publishedAt, createdAt: now, updatedAt: now };
  await db.collection<BlogDoc>('blogs').insertOne(doc);
  return serializeBlog(doc);
}

export async function updateBlog(id: string, updates: Partial<BlogDoc>) {
  const db = await getMongoDb();
  const existing = await db.collection<BlogDoc>('blogs').findOne({ _id: id as never });
  if (!existing) return null;

  const nextPublished = updates.published ?? existing.published;
  const publishedAt =
    updates.publishedAt !== undefined
      ? updates.publishedAt
      : nextPublished && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

  const result = await db.collection<BlogDoc>('blogs').findOneAndUpdate(
    { _id: id as never },
    {
      $set: {
        ...updates,
        publishedAt,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  );

  if (!result) return null;
  return serializeBlog(result as BlogDoc & { _id: string | ObjectId });
}

export async function deleteBlog(id: string) {
  const db = await getMongoDb();
  const result = await db.collection<BlogDoc>('blogs').deleteOne({ _id: id as never });
  return result.deletedCount > 0;
}
