import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types/auth";

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth"];
const COOKIE_NAME = "steelmind_session";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

async function verifyLocalToken(token: string): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET ??
        process.env.SUPABASE_JWT_SECRET ??
        "steelmind-dev-secret-change-in-production",
    );
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || !payload.email) return null;
    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name ?? payload.email),
      role: payload.role as SessionUser["role"],
      tenantId: String(payload.tenantId ?? "inglesa-metais"),
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

  let response = NextResponse.next({ request });
  let user: SessionUser | null = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser?.email) {
      user = {
        id: sbUser.id,
        email: sbUser.email,
        name: sbUser.user_metadata?.name ?? sbUser.email,
        role: (sbUser.app_metadata?.role as SessionUser["role"]) ?? "viewer",
        tenantId: (sbUser.app_metadata?.tenant_id as string) ?? "inglesa-metais",
        provider: "supabase",
      };
    }
  }

  if (!user) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) user = await verifyLocalToken(token);
  }

  if (!user && !isPublicPath(pathname)) {
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

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && !canAccessRoute(user.role, pathname)) {
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
