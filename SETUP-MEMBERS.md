# Members Integration (Auth Backend ↔ CMS)

The CMS can now list and manage all users registered through your separate
authentication backend. In the CMS they are called **Members**.

## How it works

- Your auth backend stores its users in the `users` collection
  (`mongoose.model("User")` → `users`).
- The CMS backend now has `models/Member.js`, which is pinned to that **same
  `users` collection** — no data is duplicated and no changes were needed in
  the auth backend. The auth service keeps full ownership of registration,
  login, passwords, and email verification.
- Because the CMS's own admin/editor accounts also live in a `users`
  collection, every member query filters on `memberCategory` (a field only
  the auth backend sets). Members never appear in the CMS "Users" screen,
  and CMS staff never appear in "Members".

## Required setup (one thing)

Point **both** backends at the **same database**. In
`bsis-backend-esm/.env`, set `MONGO_URI` to the exact same connection string
(including the database name) that your auth backend uses, e.g.:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<SAME_DB_NAME>
```

If the database names differ, the CMS will see zero members.

## New API endpoints (CMS backend)

All require a logged-in CMS account (admin or editor; delete is admin-only):

| Method | Endpoint                  | Description                                        |
|--------|---------------------------|----------------------------------------------------|
| GET    | `/api/members`            | List members — supports `q`, `category`, `tenant`, `verified`, `page`, `limit`, `sort` |
| GET    | `/api/members/stats`      | Totals, verified/unverified counts, category & tenant lists, 5 most recent |
| GET    | `/api/members/:id`        | Single member                                      |
| PUT    | `/api/members/:id`        | Update profile fields (name, org, category, city, website, tenant, verified) |
| PATCH  | `/api/members/:id/verify` | Toggle verified status `{ "isVerified": true }`    |
| DELETE | `/api/members/:id`        | Delete a member account (admin only)               |

Passwords and email-verification tokens are `select:false` and are never
returned or editable through the CMS — authentication stays fully owned by
the auth backend.

## What was added / changed

**Backend (`bsis-backend-esm`)**
- `models/Member.js` — new (maps to the shared `users` collection)
- `controllers/memberController.js` — new
- `routes/memberRoutes.js` — new
- `server.js` — mounts `/api/members`
- `controllers/authController.js` — `getUsers` now filters
  `role: { $in: ["admin", "editor"] }` so members don't leak into the CMS
  staff list on the shared database

**Frontend (`bsis-admin`)**
- `src/pages/Members.jsx` — new page: searchable/filterable member table,
  stats cards, view/edit modals, one-click verify toggle, delete
- `src/App.jsx` — `/members` route
- `src/components/Layout.jsx` — "Members" in the sidebar (Manage section,
  visible to admins and editors)
- `src/pages/Dashboard.jsx` — Members count stat card

## Notes

- Verifying a member from the CMS sets `isVerified: true` in the shared
  collection, so it takes effect immediately in the auth backend too.
- Deleting a member removes their account permanently — they can no longer
  log in through the auth backend.
- Because the two backends share one collection, emails are unique across
  both members and CMS staff. A member cannot register with the same email
  as a CMS admin (and vice versa).
