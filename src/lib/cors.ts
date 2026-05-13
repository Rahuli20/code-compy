import { NextResponse } from "next/server";

const DEFAULT_ALLOWED = [
  "https://webflow.com",
  "https://*.webflow.com",
  "https://*.webflow.io",
  "http://localhost:3000",
];

export function withCors(
  request: Request,
  response: NextResponse,
  extraOrigins: string[] = []
): NextResponse {
  const origin = request.headers.get("origin") ?? "";
  const allowed = [...DEFAULT_ALLOWED, ...extraOrigins, process.env.NAV_ALLOWED_ORIGIN].filter(
    Boolean
  ) as string[];

  const isAllowed =
    !origin ||
    allowed.some((pattern) => {
      if (!pattern.includes("*")) return pattern === origin;
      const escaped = pattern.replace(/\./g, "\\.").replace("*", ".*");
      return new RegExp(`^${escaped}$`).test(origin);
    });

  if (isAllowed && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  } else if (!origin) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-admin-secret"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function corsPreflight(request: Request): NextResponse | null {
  if (request.method !== "OPTIONS") return null;
  return withCors(request, new NextResponse(null, { status: 204 }));
}
