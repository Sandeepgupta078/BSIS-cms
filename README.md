# BSIS CMS — Backend (ES Modules) + Admin Frontend (React + Vite + Tailwind)

A complete CMS for **bsis.in**. The admin panel manages every page of the website;
the website reads everything from the public API. Header, footer and navbar of the
site are **not** editable from the CMS (by design, per requirements).

## What you can do from the CMS

**Pages**
- Full CRUD — create, read, update, delete any page
- **Nested pages** — add a new page *inside* another page (sub-pages), shown as a tree
- **Hide / show** a page on the website without unpublishing it
- Publish / unpublish (draft ↔ published)
- Duplicate a page as a draft
- **Formatting direction** — per page *and* per section: Left → Right or Right → Left
- Content CRUD — every page is a stack of sections (hero, text, stats, cards, CTA,
  FAQ, gallery, testimonials, video, contact info, custom HTML). Add, edit, reorder,
  hide, delete sections. SEO fields per page.

**Media** — upload (drag & drop, multi-file), browse, search, edit alt text, copy URL, delete.
Images/PDF/MP4 up to 10 MB, stored on Cloudinary.

**Also included:** Events, News, Team, Partners CRUD · contact-form Enquiries inbox ·
user management (admin/editor roles) · change password.

---

## 1) Backend — `bsis-backend-esm/`

Node.js **ES modules** (`"type": "module"`), Express, MongoDB (Mongoose), JWT auth, Cloudinary.

```bash
cd bsis-backend-esm
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm run seed:admin        # creates the first admin (ADMIN_EMAIL / ADMIN_PASSWORD from .env)
npm run dev               # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### New / notable page endpoints
| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/pages/tree` | All pages as a nested tree (admin) |
| POST | `/api/pages` | Create page — pass `parent: <pageId>` to nest it |
| PATCH | `/api/pages/:id/hide` | Toggle hidden on the website |
| PATCH | `/api/pages/:id/publish` | Toggle draft/published |
| GET | `/api/pages/slug/:slug` | Public page + its visible `children` (sub-pages) |
| GET | `/api/pages/nav` | Public navbar pages with nested children |

Page fields added: `parent`, `isHidden`, `direction` (`ltr`/`rtl`).
Section fields added: `layout` (`ltr`/`rtl`) — the website uses it to flip
image/text order in a section.

Safety rules built in: a page can't be its own parent (or a child of its own
sub-page), the homepage can't be deleted, and a page with sub-pages can't be
deleted until they're moved or removed.

## 2) Admin frontend — `bsis-admin/`

React 19 + Vite + **Tailwind CSS v4** (plus a small design-token layer).
Dev server proxies `/api` → `http://localhost:5000`, so no CORS setup is needed locally.

```bash
cd bsis-admin
npm install
npm run dev               # http://localhost:5173
```

Sign in with the seeded admin (default `admin@bsis.in` / the password in your `.env`).

### Production
```bash
npm run build             # outputs dist/
```
Set `VITE_API_URL=https://api.your-domain.com` in `.env` when the API is on another origin,
and add your admin URL to the backend `CLIENT_URLS`.

## Using the page tree

- **Pages** screen shows the whole site as a tree; sub-pages are indented under parents.
- Row actions: publish · hide/show on site · edit · **＋ add sub-page inside** · duplicate · delete.
- In the editor sidebar you can pick a **Parent page**, switch **Content direction**
  (Left → Right / Right → Left), and tick **Hide from the website**.
- Each section header has an **LTR/RTL** button to flip that section's layout.
