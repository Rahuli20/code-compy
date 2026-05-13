import { NextResponse } from "next/server";
import { corsPreflight, withCors } from "@/lib/cors";
import { assertAdmin, deleteNavItem, updateNavItem } from "@/lib/nav-service";

export async function OPTIONS(request: Request) {
  return corsPreflight(request) ?? withCors(request, new NextResponse(null, { status: 405 }));
}

export async function PATCH(request: Request, ctx: { params: { id: string } }) {
  const pre = corsPreflight(request);
  if (pre) return pre;
  try {
    assertAdmin(request);
    const { id } = ctx.params;
    const body = (await request.json()) as { label?: string; href?: string; sortOrder?: number };
    const item = await updateNavItem(id, body);
    return withCors(request, NextResponse.json({ item }));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "NOT_FOUND") {
      return withCors(request, NextResponse.json({ error: message }, { status: 404 }));
    }
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return withCors(request, NextResponse.json({ error: message }, { status }));
  }
}

export async function DELETE(request: Request, ctx: { params: { id: string } }) {
  const pre = corsPreflight(request);
  if (pre) return pre;
  try {
    assertAdmin(request);
    const { id } = ctx.params;
    await deleteNavItem(id);
    return withCors(request, new NextResponse(null, { status: 204 }));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return withCors(request, NextResponse.json({ error: message }, { status }));
  }
}
