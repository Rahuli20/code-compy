# Nuchu navbar + Webflow Cloud API

This repo contains:

- `cloud/` — a **Next.js** app meant for **Webflow Cloud** with JSON APIs under `/api/nav`.
- `code-components/` — two **Webflow Code Components**:
  - **Nuchu Navbar** — matches the blue pill layout; left links load from the API.
  - **Navbar Link Manager** — a compact, Webflow-flavored table UI to add/edit/remove links (same API).

## How syncing works

1. The Cloud app is the **HTTP API** your components call.
2. For durable storage in production, the API reads/writes a **Webflow CMS collection** via the **Webflow Data API** (this is the reliable “database” on the Webflow side).
3. If CMS env vars are not set, the API falls back to an **in-memory** store (fine for local demos, **not** for production).

## 1) Create the CMS collection (Designer)

Create a collection (example name: **Navbar links**) with:

- **Name** (default) — used as the pill label (example: `story`).
- **Slug** (default) — required by Webflow; the API will generate unique slugs for new items.
- **Plain text** field, slug **`href`** — URL or path (example: `/story`).
- **Number** field, slug **`sort-order`** — controls ordering (lower first).

Copy the **Collection ID** from the Webflow UI (or API).

## 2) Configure the Cloud app

Create `cloud/.env.local`:

```bash
NAV_ADMIN_SECRET=choose-a-long-random-secret

WEBFLOW_SITE_API_TOKEN=...   # Site token with CMS read + write scopes
WEBFLOW_NAV_COLLECTION_ID=... # The collection ID from step 1
```

Optional:

```bash
NAV_ALLOWED_ORIGIN=https://your-published-domain.com
```

## 3) Run locally

```bash
cd cloud
npm install
npm run dev
```

Try:

- `GET http://localhost:3000/api/nav`
- `POST http://localhost:3000/api/nav` with header `x-admin-secret: <same as NAV_ADMIN_SECRET>` and JSON body `{ "label": "blog", "href": "/blog" }`

## 4) Deploy to Webflow Cloud

`webflow cloud init` requires a site id when run non-interactively. If you do not already have a bootstrapped Cloud folder from the CLI, run (from `cloud/` after `webflow auth login`):

```bash
webflow cloud init -f nextjs -m /app -s <YOUR_SITE_ID> --no-input
```

That command is normally used to **create** a fresh template; since this folder already contains a Next app, you may instead keep this `cloud/` project, ensure `webflow.json` contains the `cloud` section, connect auth, then:

```bash
cd cloud
npm run build
webflow cloud deploy --mount /app --skip-mount-path-check
```

Use the mount path you deploy with (example `/app`). Your API base for components becomes:

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
