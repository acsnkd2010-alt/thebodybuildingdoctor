# Firebase Database Structure — The Body Building Doctor

Project: **thebodybuildingdoctor**  
Source: WordPress (`triotradellc.com`) → Firebase Auth + Firestore

---

## Firebase Config (Expo / Mobile)


```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAXB-LXEAZbf_JjcgM8rkNi1Cdi9ubd2Kc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=thebodybuildingdoctor.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=thebodybuildingdoctor
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=thebodybuildingdoctor.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=246531057407
EXPO_PUBLIC_FIREBASE_APP_ID=1:246531057407:web:99c5c3e5840e642b298eca
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Y2YTGP5KWY
EXPO_PUBLIC_FIREBASE_DATABASE_ID=thebodybuildingdoctor
```

> **Important:** The database `thebodybuildingdoctor` is currently in **MongoDB compatibility mode**.  
> Mobile apps should use a **Native Firestore** database (e.g. `(default)`) with the Firebase JS SDK.  
> See [Database modes](#database-modes) below.

---

## Architecture Overview

```
Firebase Auth (113 users)
├── uid: wp_{wordpressId}
├── email, displayName, password (WordPress bcrypt import)
└── custom claims: { roles: string[], wordpressId: number }

Firestore / MongoDB
├── users/{uid}              ← user profiles (billing, shipping, roles)
├── courses/{courseId}       ← course metadata (planned / to import)
│   └── lessons/{lessonId}   ← lesson content + thumbnails + videos
└── bmc_media/{id}           ← optional video/blog content
```

---

## Database Modes

| Database ID | Mode | Used by | Mobile SDK |
|-------------|------|---------|------------|
| `thebodybuildingdoctor` | MongoDB compatibility | `main.py` (pymongo) | ❌ Not supported |
| `(default)` | Native Firestore | Expo / React Native | ✅ Supported |

**Recommendation:** Create a Native Firestore `(default)` database for the mobile app and import course data there.

---

## Users

### 1. Firebase Authentication

Imported from `user-export-2026-06-27-20-29-00.csv` via `main.py`.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | Format: `wp_{wordpressId}` (e.g. `wp_9`, `wp_67`) |
| `email` | `string` | User email (unique) |
| `displayName` | `string` | Display name from WordPress |
| `emailVerified` | `boolean` | Set to `true` on import |
| `disabled` | `boolean` | Account active status |
| `passwordHash` | `bytes` | WordPress bcrypt hash (imported) |

**Current count:** 113 users (112 from WordPress + 1 native signup)

#### Custom Claims (roles)

Set on each auth user via `auth.set_custom_user_claims()`:

```json
{
  "roles": ["customer", "subscriber"],
  "wordpressId": 67
}
```

| Claim | Type | Description |
|-------|------|-------------|
| `roles` | `string[]` | WordPress roles (see [User roles](#user-roles)) |
| `wordpressId` | `number` | Original WordPress user ID |

**Read in mobile app** (after login, force token refresh):

```typescript
const token = await user.getIdTokenResult(true);
const roles: string[] = token.claims.roles ?? [];
const wordpressId: number = token.claims.wordpressId;
```

#### User Roles

| Role | Count (approx) | Description |
|------|----------------|-------------|
| `customer` | 58 | WooCommerce customer |
| `subscriber` | 53 | Basic subscriber |
| `media_channel` | 33 | Media channel access |
| `administrator` | 4 | Full admin |
| `tutor_instructor` | 2 | Course instructor |
| `editor` | 1 | Content editor |
| `author` | 1 | Post author |
| `contributor` | 1 | Contributor |
| `shop_manager` | 1 | WooCommerce manager |
| `lms_manager` | 1 | LMS manager |
| `instructor` | 1 | Instructor |
| `instructors_assistant` | 1 | Instructor assistant |
| `student` | 1 | Student |
| `media_channel_member` | 1 | Media channel member |

Users can have **multiple roles** (e.g. `["subscriber", "media_channel"]`).

---

### 2. Firestore Collection: `users`

**Document ID:** `wp_{wordpressId}` (same as Firebase Auth `uid`)

Stored by `main.py` → `users` collection.

```json
{
  "_id": "wp_67",
  "firebaseUid": "wp_67",
  "wordpressId": 67,
  "customerId": "67",
  "username": "abhijit.flotek",
  "email": "abhijit.flotek@gmail.com",
  "displayName": "abhijit.flotek",
  "firstName": "",
  "lastName": "",
  "roles": ["customer"],
  "registeredAt": "2026-01-03 17:42:55",
  "lastUpdate": "2026-01-04 10:39:32",
  "orders": 2,
  "totalSpent": 0,
  "billing": {
    "firstName": "Jeet",
    "lastName": "Bargal",
    "company": "",
    "email": "abhijit.flotek@gmail.com",
    "phone": "7875513190",
    "address1": "10 d2 harishakti society...",
    "address2": "",
    "postcode": "422008",
    "city": "Nasik",
    "state": "MH",
    "country": "IN"
  },
  "shipping": {
    "firstName": "Jeet",
    "lastName": "Bargal",
    "company": "",
    "phone": "7875513190",
    "address1": "10 d2 harishakti society...",
    "address2": "",
    "postcode": "422008",
    "city": "Nasik",
    "state": "MH",
    "country": "IN"
  }
}
```

#### Field Reference — `users`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `string` | ✅ | Document ID = `wp_{wordpressId}` |
| `firebaseUid` | `string` | ✅ | Same as Auth UID |
| `wordpressId` | `number` | ✅ | WordPress user ID |
| `customerId` | `string \| null` | | WooCommerce customer ID |
| `username` | `string` | | WordPress login |
| `email` | `string` | ✅ | Email address |
| `displayName` | `string` | | Full display name |
| `firstName` | `string` | | First name |
| `lastName` | `string` | | Last name |
| `roles` | `string[]` | ✅ | WordPress roles |
| `registeredAt` | `string` | | ISO-ish registration date |
| `lastUpdate` | `string` | | Last profile update |
| `orders` | `number` | | Order count |
| `totalSpent` | `number` | | Total spend (INR) |
| `billing` | `object` | | Billing address block |
| `shipping` | `object` | | Shipping address block |

---

## Courses

Exported from WordPress via `get_courses.py` → `courses-full-export.json`.

**Current stats:**

| Metric | Count |
|--------|-------|
| Courses | 15 |
| Lessons | 140 |
| Lessons with thumbnails | 136 |
| BMC media (with YouTube) | 41 |
| Video entries (bmc_media) | 35 |

### Recommended Firestore Layout

```
courses/{courseId}
lessons/{lessonId}          ← subcollection under each course
bmc_media/{mediaId}         ← optional top-level collection
```

Use WordPress post IDs as document IDs (numbers stored as strings, e.g. `"23608"`).

---

### 3. Firestore Collection: `courses`

**Document ID:** WordPress course ID (e.g. `23608`)

```json
{
  "id": 23608,
  "title": "ANABOLICS BLUEPRINT",
  "slug": "anabolics-blueprint",
  "link": "https://triotradellc.com/courses/anabolics-blueprint/",
  "status": "publish",
  "description_html": "<h3>...</h3><p>...</p>",
  "excerpt": "<p>...</p>",
  "thumbnail": {
    "id": 23693,
    "url": "https://triotradellc.com/wp-content/uploads/.../image.jpeg",
    "alt": "",
    "sizes": {
      "thumbnail": "https://...-150x150.jpeg",
      "medium": "https://...-300x169.jpeg",
      "large": "https://...-1024x576.jpeg",
      "full": "https://.../image.jpeg"
    }
  },
  "lesson_count": 84,
  "wordpress_id": 23608,
  "created_at": "2026-06-15T22:28:58",
  "updated_at": "2026-06-15T16:59:00"
}
```

#### Field Reference — `courses`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | ✅ | WordPress course ID |
| `title` | `string` | ✅ | Course title |
| `slug` | `string` | ✅ | URL slug |
| `link` | `string` | | Original WordPress URL |
| `status` | `string` | | `publish`, `draft`, etc. |
| `description_html` | `string` | | Full HTML description |
| `excerpt` | `string` | | Short HTML excerpt |
| `thumbnail` | `Thumbnail` | | See [Thumbnail object](#thumbnail-object) |
| `lesson_count` | `number` | | Number of lessons |
| `wordpress_id` | `number` | | Same as `id` (for queries) |
| `created_at` | `string` | | WordPress created date |
| `updated_at` | `string` | | WordPress modified date |

#### Course List (15)

| ID | Slug | Lessons |
|----|------|---------|
| 23608 | `anabolics-blueprint` | 84 |
| — | `fertility-protocol` | 49 |
| — | `anabolics-blueprint-global-edition` | 5 |
| — | `consultation-call` | 1 |
| — | `lean-bulk-program` | 0 |
| — | `pure-bulking-program` | 0 |
| — | `workout-plan` | 0 |
| — | `personal-training-3-months` | 0 |
| — | `new-course` … `new-course-7` | 0 |

---

### 4. Firestore Subcollection: `courses/{courseId}/lessons`

**Document ID:** WordPress lesson ID (e.g. `23613`)

```json
{
  "id": 23613,
  "course_id": 23608,
  "title": "ANDROGEN RECEPTORS",
  "slug": "androgen-receptors",
  "link": "https://triotradellc.com/courses/anabolics-blueprint/lessons/androgen-receptors/",
  "status": "publish",
  "menu_order": 1,
  "content_html": "<p>...</p>",
  "excerpt": "<p>...</p>",
  "thumbnail": {
    "id": 23612,
    "url": "https://triotradellc.com/wp-content/uploads/2025/03/download.jpeg",
    "alt": "",
    "sizes": {
      "thumbnail": "https://...-150x150.jpeg",
      "medium": "https://...-300x134.jpeg",
      "full": "https://.../download.jpeg"
    }
  },
  "videos": []
}
```

#### Field Reference — `lessons`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | ✅ | WordPress lesson ID |
| `course_id` | `number` | ✅ | Parent course ID |
| `title` | `string` | ✅ | Lesson title |
| `slug` | `string` | ✅ | URL slug |
| `link` | `string` | | Original lesson URL |
| `status` | `string` | | `publish`, `draft`, etc. |
| `menu_order` | `number` | | Sort order within course |
| `content_html` | `string` | | Full lesson HTML content |
| `excerpt` | `string` | | Short excerpt HTML |
| `thumbnail` | `Thumbnail` | | Lesson cover image |
| `videos` | `Video[]` | | Video links (see below) |

#### Video Object

```json
{
  "type": "iframe",
  "url": "https://www.youtube.com/embed/7WSoSFf1GnY?feature=oembed"
}
```

| `type` | Description |
|--------|-------------|
| `iframe` | Embedded player URL (YouTube, Vimeo) |
| `html5` | Direct `.mp4` / `.webm` file |
| `url` | Generic video URL |
| `tutor_meta` | From Tutor LMS (requires `WP_PASSWORD` export) |

> **Note:** Lesson `videos` are empty in the current export. Tutor LMS stores videos behind login. Re-run `get_courses.py` with `WP_PASSWORD` set to fetch them.

---

### 5. Firestore Collection: `bmc_media` (optional)

Blog/media posts with embedded YouTube videos.

**Document ID:** WordPress post ID (e.g. `25233`)

```json
{
  "id": 25233,
  "title": "SELANK — Calm Without Cognitive Suppression",
  "slug": "selank-calm-without-cognitive-suppression",
  "link": "https://triotradellc.com/bmc_media/selank-calm-without-cognitive-suppression/",
  "featured_video_url": "",
  "thumbnail": {
    "url": "https://triotradellc.com/wp-content/uploads/..."
  },
  "content_html": "<p>...</p>",
  "videos": [
    {
      "type": "iframe",
      "url": "https://www.youtube.com/embed/7WSoSFf1GnY?feature=oembed"
    }
  ]
}
```

---

## Shared Types

### Thumbnail Object

```typescript
interface Thumbnail {
  id?: number;
  url: string;
  alt?: string;
  sizes?: Record<string, string>;  // e.g. thumbnail, medium, large, full
}
```

### Video Object

```typescript
interface Video {
  type: "iframe" | "html5" | "url" | "tutor_meta";
  url: string;
}
```

### Address Object (users)

```typescript
interface Address {
  firstName: string;
  lastName: string;
  company: string;
  email?: string;      // billing only
  phone: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;     // ISO country code, e.g. "IN"
}
```

---

## Mobile App Queries (Native Firestore)

```typescript
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// All published courses
const coursesSnap = await getDocs(collection(db, "courses"));

// Single course
const course = await getDoc(doc(db, "courses", "23608"));

// Lessons for a course (ordered)
const lessonsSnap = await getDocs(
  query(
    collection(db, "courses", "23608", "lessons"),
    orderBy("menu_order")
  )
);

// User profile
const profile = await getDoc(doc(db, "users", user.uid));

// BMC media
const mediaSnap = await getDocs(collection(db, "bmc_media"));
```

---

## Suggested Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User can read/write own profile only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Courses & lessons: read for authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false;  // admin import only

      match /lessons/{lessonId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }

    // BMC media: read for authenticated users
    match /bmc_media/{mediaId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## Related Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `main.py` | Import WordPress users → Auth + Firestore profiles | Firebase Auth + `users` collection |
| `get_users.py` | Export all Firebase users + roles | `firebase-users-export.json`, `.csv` |
| `get_courses.py` | Export courses + lessons from WordPress | `courses-full-export.json` |

### Run commands

```bash
cd wordpresstofirebasedatatransfer
source venv/bin/activate

# Export users + roles
python3 get_users.py

# Export courses + lessons
python3 get_courses.py

# Import users (needs MongoDB credentials for profiles)
python3 main.py
```

---

## Import Status

| Data | Auth | Firestore Profiles | Courses |
|------|------|-------------------|---------|
| Status | ✅ 113 users imported | ⏳ Needs MongoDB credentials OR Native Firestore | ⏳ Export ready, import pending |

**Source files:**
- Users CSV: `user-export-2026-06-27-20-29-00.csv`
- Courses JSON: `courses-full-export.json`
- Users export: `firebase-users-export.json`
