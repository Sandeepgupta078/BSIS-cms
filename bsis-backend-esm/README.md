# BSIS CMS Backend (MERN)

Complete Node.js + Express + MongoDB backend for managing the entire bsis.in website from an admin panel: pages (flexible section-based content), media library (Cloudinary), site settings (navbar/footer/logo), events, news, team, partners, and contact-form enquiries.

## Folder structure

```
bsis-backend/
├── server.js               # App entry: middleware, routes, error handling
├── package.json
├── .env.example            # Copy to .env and fill in
├── config/
│   ├── db.js               # MongoDB connection
│   └── cloudinary.js       # Cloudinary config
├── models/
│   ├── User.js             # Admin/editor users (bcrypt hashed passwords)
│   ├── Page.js             # ★ Core: pages as ordered flexible sections
│   ├── Media.js            # Uploaded images/files metadata
│   ├── SiteSettings.js     # Singleton: logo, navbar, footer, contact, socials
│   ├── Event.js
│   ├── NewsPost.js
│   ├── TeamMember.js
│   ├── Partner.js
│   └── ContactSubmission.js
├── controllers/            # One controller per resource
├── middleware/
│   ├── auth.js             # JWT protect + role restrictTo
│   ├── upload.js           # Multer (memory) with type/size limits
│   └── errorHandler.js     # Central error handler + asyncHandler
├── routes/                 # One router per resource
├── utils/
│   ├── slugify.js
│   └── apiFeatures.js      # Pagination helper
└── seed/
    └── seedAdmin.js        # Creates first admin + settings doc
```

## Setup

```bash
npm install
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm run seed:admin          # creates the first admin login
npm run dev                 # starts on http://localhost:5000
```

Check it works: `GET http://localhost:5000/api/health`

## API overview

### Auth (`/api/auth`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /login | Public (rate-limited) | Returns JWT + httpOnly cookie |
| POST | /logout | Public | Clears cookie |
| GET | /me | Logged in | Current user |
| PUT | /update-password | Logged in | Change own password |
| GET/POST | /users | Admin | List / create users |
| PUT/DELETE | /users/:id | Admin | Update role, deactivate, delete |

### Pages (`/api/pages`) — the heart of the CMS
| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | /home | Public | Homepage content |
| GET | /nav | Public | Pages flagged for navbar |
| GET | /slug/:slug | Public | Published page by slug (sorted, visible sections only) |
| GET | / | Admin/Editor | All pages incl. drafts (?status=, ?search=) |
| POST | / | Admin/Editor | Create page |
| GET/PUT/DELETE | /:id | Admin/Editor | Read / save / delete page |
| PATCH | /:id/sections/reorder | Admin/Editor | body: { sectionIds: [...] } |
| PATCH | /:id/publish | Admin/Editor | Toggle draft/published |
| POST | /:id/duplicate | Admin/Editor | Clone a page as draft |

A page's `sections` array is fully flexible:
```json
{
  "title": "Home",
  "slug": "home",
  "isHomepage": true,
  "status": "published",
  "sections": [
    { "type": "hero", "order": 0, "data": { "heading": "Empowering Startups", "subheading": "...", "image": "https://res.cloudinary.com/...", "buttonText": "Join Us", "buttonLink": "/membership" } },
    { "type": "stats", "order": 1, "data": { "items": [{ "value": "500+", "label": "Startups" }] } },
    { "type": "textBlock", "order": 2, "data": { "html": "<p>About BSIS...</p>" } }
  ]
}
```
`type` maps to a React component on the frontend; `data` is that component's props. New section types need zero backend changes.

### Media (`/api/media`) — all protected
| Method | Route | Purpose |
|---|---|---|
| POST | /upload | form-data `file` (+ optional `folder`, `altText`) → Cloudinary |
| POST | /upload-multiple | form-data `files` (max 10) |
| GET | / | Paginated library (?folder=, ?type=, ?search=) |
| PUT | /:id | Update alt text |
| DELETE | /:id | Deletes from Cloudinary + DB |

### Settings (`/api/settings`)
GET is public (frontend loads navbar/footer/logo/contact/socials once at app load). PUT is admin-only.

### Collections
- `/api/events` — public list (?upcoming=true, ?past=true, ?featured=true), slug detail; admin CRUD at /admin, POST /, /:id
- `/api/news` — same pattern (?category=, ?tag=, ?search=)
- `/api/team` — public GET (?category=leadership); admin CRUD + PATCH /reorder
- `/api/partners` — public GET (?category=sponsor); admin CRUD
- `/api/contact` — public POST (spam rate-limited); admin inbox GET, PATCH /:id/read, DELETE /:id

## Security included
- bcrypt (12 rounds), JWT in httpOnly cookie AND Bearer header support
- Role-based access (admin / editor)
- helmet, CORS whitelist via CLIENT_URLS, cookie security flags
- Rate limits: global API, login brute-force, contact-form spam
- Central error handler (Mongoose validation, duplicates, CastError, Multer)

## Connecting the frontend

Public website:
```js
const API = import.meta.env.VITE_API_URL; // e.g. https://api.bsis.in

// page content
fetch(`${API}/api/pages/slug/about-us`).then(r => r.json());
// navbar/footer
fetch(`${API}/api/settings`).then(r => r.json());
```

Admin panel:
```js
// login once, then send credentials with every request
fetch(`${API}/api/pages`, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: "include",
});
```

## Deploy
- MongoDB Atlas (free tier) → MONGO_URI
- Cloudinary (free tier) → keys
- Render / Railway / VPS: set all env vars, `npm start`
- Set CLIENT_URLS to your real domains, NODE_ENV=production
