# Login form field mapping (Next.js ↔ WordPress)

## Next.js login form (AuthForm)

| UI label           | State variable | Sent in JSON (login) | Notes                    |
|--------------------|----------------|----------------------|--------------------------|
| Email or Username  | `email`        | `email: "user input"`| Holds email OR username  |
| Password           | `password`     | `password: "..."`    | min 6 chars              |
| (Register only)    | `username`     | `username: "..."`    | For login, `username` is `""` |

**Login submit body:** `{ email: "<typed>", username: "", password: "..." }`

---

## Next.js login API (`/api/auth/login`)

- Reads: `email`, `username`, `password` from request body.
- Builds: `loginId = (username?.trim()) || (email?.trim())` → for login, this is the "Email or Username" value.
- Sends to WordPress: `{ username: loginId, password }` (same keys WordPress expects).

---

## WordPress plugin (`/wp-json/bmc/v1/auth/token`)

- **Expected JSON body:** `{ "username": "email_or_username", "password": "..." }`
- **Keys:** `username` (required), `password` (required).
- **`username`** can be the user’s **email** or **WordPress username**; plugin resolves email to user if needed.
- **`password`** is the WordPress user password.

---

## End-to-end flow

1. User types in **Email or Username** → stored in `email` state.
2. User types **Password** → stored in `password` state.
3. Form submits: `{ email: "value", username: "", password: "***" }`.
4. Next.js API: `loginId = email` → sends `{ username: "value", password: "***" }` to WordPress.
5. WordPress: reads `username` and `password` from JSON body; authenticates; returns token and user (with `role`).

Field names are aligned: WordPress receives **username** and **password**; Next.js sends those keys with the form values.
