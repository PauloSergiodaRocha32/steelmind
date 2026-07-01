import { NextResponse, type NextRequest } from "next/server";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types/auth";

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth"];
const COOKIE_NAME = "steelmind_session";
const SUPABASE_SESSION_COOKIE_RE = /^sb-.*-auth-token(\.\d+)?$/;
const USER_ROLES = new Set([
  "admin",
  "manager",
  "warehouse",
  "purchasing",
  "engineering",
  "viewer",
]);
let signingKeyPromise: Promise<CryptoKey> | null = null;

type LocalJwtPayload = {
  sub?: unknown;
  email?: unknown;
  name?: unknown;
  role?: unknown;
  tenantId?: unknown;
  exp?: unknown;
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    return atob(`${normalized}${padding}`);
  } catch {
    return null;
  }
}

function parseJwtPart<T>(encoded: string): T | null {
  const decoded = decodeBase64Url(encoded);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function getSigningKey(): Promise<CryptoKey> {
  if (!signingKeyPromise) {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ??
        process.env.SUPABASE_JWT_SECRET ??
        "steelmind-dev-secret-change-in-production",
    );
    signingKeyPromise = crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return signingKeyPromise;
}

async function signHs256(value: string): Promise<string> {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function secureStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => SUPABASE_SESSION_COOKIE_RE.test(cookie.name) && cookie.value.length > 0);
}

function isSessionRole(role: unknown): role is SessionUser["role"] {
  return typeof role === "string" && USER_ROLES.has(role);
}

async function verifyLocalToken(token: string): Promise<SessionUser | null> {
  try {
    const [encodedHeader, encodedPayload, tokenSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !tokenSignature) return null;

    const header = parseJwtPart<{ alg?: string }>(encodedHeader);
    if (!header || header.alg !== "HS256") return null;

    const payload = parseJwtPart<LocalJwtPayload>(encodedPayload);
    if (!payload) return null;

    const expectedSignature = await signHs256(`${encodedHeader}.${encodedPayload}`);
    if (!secureStringEqual(expectedSignature, tokenSignature)) return null;

    const expiresAtMs =
      typeof payload.exp === "number" ? payload.exp * 1000 : Number.NaN;
    if (!Number.isFinite(expiresAtMs) || Date.now() >= expiresAtMs) return null;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !isSessionRole(payload.role)
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name:
        typeof payload.name === "string" && payload.name.trim().length > 0
          ? payload.name
          : payload.email,
      role: payload.role,
      tenantId:
        typeof payload.tenantId === "string" && payload.tenantId.trim().length > 0
          ? payload.tenantId
          : "inglesa-metais",
      provider: "local",
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const localUser = token ? await verifyLocalToken(token) : null;
  const hasSupabaseSession = !localUser && hasSupabaseSessionCookie(request);
  const isAuthenticated = Boolean(localUser) || hasSupabaseSession;

  if (!isAuthenticated && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { message: "Não autenticado", code: "UNAUTHORIZED" } },
        { status: 401 },
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (localUser && !canAccessRoute(localUser.role, pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { message: "Sem permissão", code: "FORBIDDEN" } },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
