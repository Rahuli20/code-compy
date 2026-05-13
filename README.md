# Nuchu navbar + Webflow Cloud API

This repo contains:

- **Next.js (repo root)** — Webflow Cloud app with JSON APIs under `/api/nav` (served under your Cloud mount, e.g. `/app`).
- **`code-components/`** — two **Webflow Code Components**:
  - **Nuchu Navbar** — blue pill layout; left links load from the API.
  - **Navbar Link Manager** — compact, Webflow-flavored table UI to add/edit/remove links (same API).

> **Webflow Cloud:** the builder clones the repo and expects `package.json` and `webflow.json` at the **repository root**, so the Next app lives at the root (not in a `cloud/` subfolder).

## How syncing works

1. The Cloud app is the **HTTP API** your components call.
2. For durable storage in production, the API reads/writes a **Webflow CMS collection** via the **Webflow Data API** (the reliable “database” on the Webflow side).
3. If CMS env vars are not set, the API falls back to an **in-memory** store (fine for local demos, **not** for production).

## 1) Create the CMS collection (Designer)

Create a collection (example name: **Navbar links**) with:

- **Name** (default) — used as the pill label (example: `story`).
- **Slug** (default) — required by Webflow; the API will generate unique slugs for new items.
- **Plain text** field, slug **`href`** — URL or path (example: `/story`).
- **Number** field, slug **`sort-order`** — controls ordering (lower first).

Copy the **Collection ID** from the Webflow UI (or API).

## 2) Configure environment variables

Create `.env.local` in the **repo root** (for local dev):

```bash
NAV_ADMIN_SECRET=choose-a-long-random-secret

WEBFLOW_SITE_API_TOKEN=...   # Site token with CMS read + write scopes
WEBFLOW_NAV_COLLECTION_ID=... # The collection ID from step 1
```

Optional:

```bash
NAV_ALLOWED_ORIGIN=https://your-published-domain.com
```

In **Webflow Cloud** project settings, set the same secrets (and optionally `COSMIC_MOUNT_PATH` if your mount is not injected into the build; the builder often sets this automatically).

## 3) Run locally

```bash
npm install
npm run dev
```

Try:

- `GET http://localhost:3000/api/nav`
- `POST http://localhost:3000/api/nav` with header `x-admin-secret: <same as NAV_ADMIN_SECRET>` and JSON body `{ "label": "blog", "href": "/blog" }`

To simulate the mounted production URL locally:

```bash
COSMIC_MOUNT_PATH=/app npm run dev
```

Then open `http://localhost:3000/app/api/nav`.

## 4) Deploy to Webflow Cloud

From the repo root (after `webflow auth login`):

```bash
npm run build
webflow cloud deploy --mount /app --skip-mount-path-check
```

`next.config.mjs` reads **`COSMIC_MOUNT_PATH`** (set by the Webflow Cloud build in many setups) and applies `basePath` / `assetPrefix` so routes and static assets resolve under your mount.

Use the mount path you deploy with (example `/app`). Your **API base URL** for Code Components becomes:

`https://<your-site>.webflow.io/app`

## 5) Code Components library

The `code-components/webflow.json` manifest includes a `library.id` placeholder so **Webflow CLI 1.21+** can bundle non-interactively. After your first successful `webflow library share`, Webflow may replace this id—commit whatever the CLI writes back.

```bash
cd code-components
npm install
npm run build
webflow library bundle --public-path https://example.webflow.io/app --no-input --skip-update-check
```

When you are ready to upload the library to a workspace:

```bash
webflow library share
```

In Webflow Designer, set **API base URL** on both components to the deployed base **including the mount**, e.g. `https://your-site.webflow.io/app` (no trailing slash).

Set **Admin secret** on **Navbar Link Manager** to match `NAV_ADMIN_SECRET`.

## Security notes

- Treat `NAV_ADMIN_SECRET` like a password. Anyone who knows it can modify links.
- The manager component stores the secret in a prop (visible to anyone who can view published HTML). Prefer placing the manager on **password-protected** or **internal** pages, or evolve this to OAuth / Designer-only tooling later.
