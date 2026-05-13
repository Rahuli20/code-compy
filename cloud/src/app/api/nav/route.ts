import { NextResponse } from "next/server";
import { corsPreflight, withCors } from "@/lib/cors";
import { assertAdmin, createNavItem, listNavItems } from "@/lib/nav-service";

export async function OPTIONS(request: Request) {
  return corsPreflight(request) ?? withCors(request, new NextResponse(null, { status: 405 }));
}

export async function GET(request: Request) {
  const pre = corsPreflight(request);
  if (pre) return pre;
  try {
    const items = await listNavItems();
    return withCors(
      request,
      NextResponse.json({ items, source: process.env.WEBFLOW_NAV_COLLECTION_ID ? "cms" : "memory" })
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return withCors(request, NextResponse.json({ error: message }, { status: 500 }));
  }
}

export async function POST(request: Request) {
  const pre = corsPreflight(request);
  if (pre) return pre;
  try {
    assertAdmin(request);
    const body = (await request.json()) as { label?: string; href?: string; sortOrder?: number };
    if (!body.label || !body.href) {
      return withCors(request, NextResponse.json({ error: "label and href are required" }, { status: 400 }));
    }
    const item = await createNavItem({
      label: body.label,
      href: body.href,
      sortOrder: body.sortOrder,
    });
    return withCors(request, NextResponse.json({ item }));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return withCors(request, NextResponse.json({ error: message }, { status }));
  }
}
