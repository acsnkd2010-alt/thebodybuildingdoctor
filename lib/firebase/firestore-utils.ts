import { Timestamp } from 'firebase-admin/firestore';

export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return undefined;
}

export function toIso(value: unknown): string | null {
  return toDate(value)?.toISOString() ?? null;
}

export function newDocId(collection: FirebaseFirestore.CollectionReference) {
  return collection.doc().id;
}
