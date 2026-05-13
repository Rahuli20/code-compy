import type { NavItem, NavItemPayload } from "./types";

const API = "https://api.webflow.com/v2";

type WebflowListResponse = {
  items: Array<{
    id: string;
    fieldData: Record<string, unknown>;
  }>;
};

function authHeaders(): HeadersInit {
  const token = process.env.WEBFLOW_SITE_API_TOKEN ?? process.env.WEBFLOW_API_TOKEN;
  if (!token) throw new Error("Missing WEBFLOW_SITE_API_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    accept: "application/json",
  };
}

function collectionId(): string {
  const id = process.env.WEBFLOW_NAV_COLLECTION_ID;
  if (!id) throw new Error("Missing WEBFLOW_NAV_COLLECTION_ID");
  return id;
}

function fromFieldData(id: string, fieldData: Record<string, unknown>): NavItem {
  const name = String(fieldData.name ?? fieldData.Name ?? "link");
  const href = String(fieldData.href ?? "/");
  const sortRaw = fieldData["sort-order"] ?? fieldData.sortOrder ?? 0;
  const sortOrder = typeof sortRaw === "number" ? sortRaw : Number(sortRaw) || 0;
  return { id, label: name, href, sortOrder };
}

export async function cmsList(): Promise<NavItem[]> {
  const res = await fetch(`${API}/collections/${collectionId()}/items?limit=100`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webflow list failed: ${res.status} ${text}`);
  }
  const body = (await res.json()) as WebflowListResponse;
  return body.items
    .map((row) => fromFieldData(row.id, row.fieldData))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function cmsCreate(payload: NavItemPayload): Promise<NavItem> {
  const slug = `nav-${crypto.randomUUID().slice(0, 8)}`;
  const existing = await cmsList();
  const sortOrder =
    payload.sortOrder ?? (existing.length ? Math.max(...existing.map((i) => i.sortOrder)) + 1 : 1);

  const res = await fetch(`${API}/collections/${collectionId()}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      isArchived: false,
      isDraft: false,
      fieldData: {
        name: payload.label,
        slug,
        href: payload.href,
        "sort-order": sortOrder,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webflow create failed: ${res.status} ${text}`);
  }
  const created = (await res.json()) as { id: string; fieldData: Record<string, unknown> };
  return fromFieldData(created.id, created.fieldData);
}

export async function cmsUpdate(id: string, patch: Partial<NavItemPayload>): Promise<NavItem> {
  const currentRes = await fetch(`${API}/collections/${collectionId()}/items/${id}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (!currentRes.ok) {
    const text = await currentRes.text();
    throw new Error(`Webflow read failed: ${currentRes.status} ${text}`);
  }
  const current = (await currentRes.json()) as { id: string; fieldData: Record<string, unknown> };
  const currentNav = fromFieldData(current.id, current.fieldData);

  const res = await fetch(`${API}/collections/${collectionId()}/items/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      fieldData: {
        name: patch.label ?? currentNav.label,
        href: patch.href ?? currentNav.href,
        "sort-order": patch.sortOrder ?? currentNav.sortOrder,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webflow update failed: ${res.status} ${text}`);
  }
  const updated = (await res.json()) as { id: string; fieldData: Record<string, unknown> };
  return fromFieldData(updated.id, updated.fieldData);
}

export async function cmsDelete(id: string): Promise<void> {
  const res = await fetch(`${API}/collections/${collectionId()}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Webflow delete failed: ${res.status} ${text}`);
  }
}
