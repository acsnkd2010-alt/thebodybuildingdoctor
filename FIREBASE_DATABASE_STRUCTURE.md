# Firebase Database Structure — The Bodybuilding Doctor

Project: **thebodybuildingdoctor**  
Stack: **Firebase Auth + Firestore** (no WordPress dependency for courses)

---

## Architecture

```
Firebase Auth
├── uid (Firebase-generated or imported)
├── email, displayName
└── optional custom claims: { roles: string[] }

Firestore (default)
├── users/{uid}                    ← app profiles
├── courses/{courseId}             ← course catalog (CRUD via admin API)
│   └── lessons/{lessonId}         ← lesson content
├── enrollments/{uid}_{courseId}   ← subscription / course access
└── progress/{uid}_{lessonId}      ← lesson progress (planned)
```

### Apps

| App | Path | Data source |
|-----|------|-------------|
| **Courses (mobile)** | `app/` | Firestore direct — catalog, enrollments, lessons |
| **Admin / media (web)** | `web/` | Firestore admin API for courses & enrollments |

---

## Users

### Firebase Authentication

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | Firebase Auth user ID |
| `email` | `string` | User email |
| `displayName` | `string` | Display name |

#### Optional custom claims (web / legacy imports)

```json
{
  "roles": ["administrator", "media_channel"]
}
```

| Role | Access |
|------|--------|
| `administrator` | Web app + course/enrollment admin API |
| `lms_manager` | Course/enrollment admin API |
| `media_channel` | Web media channel (if still used) |

Mobile app users are created on registration with a Firestore profile — no WordPress ID required.

### Firestore: `users/{uid}`

```json
{
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "photoURL": "",
  "role": "student",
  "createdAt": "<Timestamp>"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `email` | `string` | Email |
| `displayName` | `string` | Name |
| `photoURL` | `string?` | Avatar URL |
| `role` | `student \| admin` | App role |
| `createdAt` | `Timestamp` | Registration time |

---

## Courses

### Firestore: `courses/{courseId}`

```json
{
  "title": "Hypertrophy Fundamentals",
  "slug": "hypertrophy-fundamentals",
  "description": "Build muscle with evidence-based training principles.",
  "thumbnailUrl": "https://...",
  "instructorName": "The Bodybuilding Doctor",
  "level": "beginner",
  "category": "Training",
  "published": true,
  "priceCents": 0,
  "lessonCount": 12,
  "totalDurationSec": 7200,
  "order": 1,
  "createdAt": "<Timestamp>"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Course title |
| `slug` | `string` | URL slug |
| `description` | `string` | Plain-text or short description |
| `thumbnailUrl` | `string` | Cover image |
| `instructorName` | `string` | Instructor |
| `level` | `beginner \| intermediate \| advanced` | Difficulty |
| `category` | `string` | Category label |
| `published` | `boolean` | Visible in catalog when `true` |
| `priceCents` | `number` | `0` = free self-enroll; `> 0` = admin-granted access |
| `lessonCount` | `number` | Lesson count |
| `totalDurationSec` | `number` | Total duration |
| `order` | `number` | Sort order in catalog |

### Subcollection: `courses/{courseId}/lessons/{lessonId}`

```json
{
  "title": "Introduction",
  "order": 1,
  "durationSec": 600,
  "videoUrl": "https://www.youtube.com/embed/...",
  "contentHtml": "<p>...</p>",
  "freePreview": false
}
```

---

## Subscriptions (enrollments)

Course access is controlled by the **`enrollments`** collection — this is the subscription module.

### Document ID: `{uid}_{courseId}`

```json
{
  "uid": "abc123",
  "courseId": "courseDocId",
  "enrolledAt": "<Timestamp>",
  "source": "free",
  "status": "active",
  "expiresAt": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | Firebase Auth UID |
| `courseId` | `string` | Course document ID |
| `enrolledAt` | `Timestamp` | When access was granted |
| `source` | `free \| purchase \| admin` | How the user got access |
| `status` | `active \| expired \| revoked` | Current access state |
| `expiresAt` | `Timestamp?` | Optional expiry for time-limited subscriptions |

### Access rules

| Scenario | How access is granted |
|----------|----------------------|
| Free course (`priceCents === 0`) | User taps **Enroll for free** in the app |
| Paid course | Admin grants via `POST /api/admin/enrollments` |
| Revoke access | Admin calls `DELETE /api/admin/enrollments?uid=&courseId=` |

---

## Admin API (web)

Requires logged-in user with `administrator`, `admin`, or `lms_manager` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/courses` | List all courses |
| `POST` | `/api/admin/courses` | Create course |
| `GET` | `/api/admin/courses/{id}` | Get course |
| `PATCH` | `/api/admin/courses/{id}` | Update course |
| `DELETE` | `/api/admin/courses/{id}` | Delete course + lessons |
| `GET` | `/api/admin/enrollments` | List enrollments (`?uid=` / `?courseId=`) |
| `POST` | `/api/admin/enrollments` | Grant access `{ uid, courseId, expiresAt? }` |
| `DELETE` | `/api/admin/enrollments?uid=&courseId=` | Revoke access |

### Example: grant course access

```bash
curl -X POST http://localhost:3000/api/admin/enrollments \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{"uid":"wp_67","courseId":"23608"}'
```

---

## Mobile app queries

```typescript
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Published catalog
const courses = await getDocs(
  query(collection(db, 'courses'), where('published', '==', true), orderBy('order'))
);

// User's active enrollments
const enrollments = await getDocs(
  query(
    collection(db, 'enrollments'),
    where('uid', '==', uid),
    where('status', '==', 'active')
  )
);

// Check access to a course
const enrollment = await getDoc(doc(db, 'enrollments', `${uid}_${courseId}`));

// Lessons (only if enrolled or freePreview)
const lessons = await getDocs(
  query(collection(db, 'courses', courseId, 'lessons'), orderBy('order'))
);
```

**Composite index required:** `enrollments` — `uid` ASC, `status` ASC

---

## Security rules

See `firestore.rules` at the repo root. Summary:

- Users read/write their own `users/{uid}` profile
- Anyone signed in reads published `courses`
- Lessons readable if `freePreview` or enrolled
- Users can create their own `enrollments` (free self-enroll)
- Admin writes go through the web admin API (service account), not client SDK

---

## Environment

### Mobile (`app/.env`)

```env
EXPO_PUBLIC_FIREBASE_PROJECT_ID=thebodybuildingdoctor
EXPO_PUBLIC_FIREBASE_DATABASE_ID=(default)
```

### Web admin (`web/.env.local`)

```env
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
JWT_SECRET=...
FIRESTORE_DATABASE_ID=(default)
```

---

## Migration notes

- **WordPress is no longer the source of truth** for courses or user subscriptions.
- Legacy imported users may still have `wp_{id}` UIDs and `wordpressId` in old claims — enrollments use `uid` regardless.
- Import course data from `courses-full-export.json` into the native `(default)` Firestore database with the app schema field names (`thumbnailUrl`, `description`, `published`, etc.).

---

*Last updated: June 2026*
