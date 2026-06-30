import { ObjectId } from 'mongodb';

import { getMongoDb } from '@/lib/mongodb';

export type InquiryType = 'mentorship' | 'courses' | 'both';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type InquiryDoc = {
  _id?: string | ObjectId;
  name: string;
  email: string;
  phone?: string;
  type: InquiryType;
  courseId?: string;
  courseTitle?: string;
  message?: string;
  status: InquiryStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export function serializeInquiry(doc: InquiryDoc & { _id: string | ObjectId }) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? '',
    type: doc.type,
    courseId: doc.courseId ?? '',
    courseTitle: doc.courseTitle ?? '',
    message: doc.message ?? '',
    status: doc.status,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function createInquiry(
  data: Omit<InquiryDoc, '_id' | 'status' | 'createdAt' | 'updatedAt'>,
) {
  const db = await getMongoDb();
  const now = new Date();
  const id = new ObjectId().toHexString();
  const doc: InquiryDoc & { _id: string } = {
    ...data,
    _id: id,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };
  await db.collection<InquiryDoc>('inquiries').insertOne(doc);
  return serializeInquiry(doc);
}

export async function listInquiries() {
  const db = await getMongoDb();
  const docs = await db
    .collection<InquiryDoc>('inquiries')
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => serializeInquiry(doc as InquiryDoc & { _id: string | ObjectId }));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const db = await getMongoDb();
  const result = await db.collection<InquiryDoc>('inquiries').updateOne(
    { _id: id as never },
    { $set: { status, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) return null;
  const doc = await db.collection<InquiryDoc>('inquiries').findOne({ _id: id as never });
  if (!doc) return null;
  return serializeInquiry(doc as InquiryDoc & { _id: string | ObjectId });
}
