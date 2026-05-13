import type { NavItem, NavItemPayload } from "./types";

const items = new Map<string, NavItem>();

function seedIfEmpty() {
  if (items.size > 0) return;
  const seed: NavItem[] = [
    { id: "seed-1", label: "story", href: "/story", sortOrder: 1 },
    { id: "seed-2", label: "science", href: "/science", sortOrder: 2 },
    { id: "seed-3", label: "impact", href: "/impact", sortOrder: 3 },
    { id: "seed-4", label: "blog", href: "/blog", sortOrder: 4 },
  ];
  seed.forEach((i) => items.set(i.id, i));
}

export async function memoryList(): Promise<NavItem[]> {
  seedIfEmpty();
  return [...items.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function memoryCreate(payload: NavItemPayload): Promise<NavItem> {
  seedIfEmpty();
  const id = `mem-${crypto.randomUUID()}`;
  const sortOrder =
    payload.sortOrder ??
    Math.max(0, ...[...items.values()].map((i) => i.sortOrder), 0) + 1;
  const item: NavItem = { id, label: payload.label, href: payload.href, sortOrder };
  items.set(id, item);
  return item;
}

export async function memoryUpdate(id: string, patch: Partial<NavItemPayload>): Promise<NavItem> {
  const existing = items.get(id);
  if (!existing) throw new Error("NOT_FOUND");
  const next: NavItem = {
    ...existing,
    label: patch.label ?? existing.label,
    href: patch.href ?? existing.href,
    sortOrder: patch.sortOrder ?? existing.sortOrder,
  };
  items.set(id, next);
  return next;
}

export async function memoryDelete(id: string): Promise<void> {
  items.delete(id);
}
