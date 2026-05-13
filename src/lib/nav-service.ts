import type { NavItem, NavItemPayload } from "./types";
import * as memory from "./memory-nav-store";
import * as cms from "./webflow-cms-nav-store";

function useCms(): boolean {
  return Boolean(process.env.WEBFLOW_NAV_COLLECTION_ID && process.env.WEBFLOW_SITE_API_TOKEN);
}

export async function listNavItems(): Promise<NavItem[]> {
  if (useCms()) return cms.cmsList();
  return memory.memoryList();
}

export async function createNavItem(payload: NavItemPayload): Promise<NavItem> {
  if (useCms()) return cms.cmsCreate(payload);
  return memory.memoryCreate(payload);
}

export async function updateNavItem(id: string, patch: Partial<NavItemPayload>): Promise<NavItem> {
  if (useCms()) return cms.cmsUpdate(id, patch);
  return memory.memoryUpdate(id, patch);
}

export async function deleteNavItem(id: string): Promise<void> {
  if (useCms()) return cms.cmsDelete(id);
  return memory.memoryDelete(id);
}

export function assertAdmin(request: Request): void {
  const secret = process.env.NAV_ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NAV_ADMIN_SECRET must be set in production");
    }
    return;
  }
  const header = request.headers.get("x-admin-secret");
  if (header !== secret) throw new Error("UNAUTHORIZED");
}
