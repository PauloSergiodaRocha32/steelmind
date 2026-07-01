import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/types/auth";
import { DEFAULT_TENANT_ID } from "@/types/auth";
import {
  createSessionToken,
  getSessionTokenFromCookies,
  verifySessionToken,
} from "@/lib/auth/session-token";
import { verifyLocalPassword } from "@/lib/auth/local-users";

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Server Component */
          }
        },
      },
    },
  );
}

async function getSupabaseSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseAuthConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const role = (user.app_metadata?.role as UserRole) ?? "viewer";
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.email.split("@")[0] ?? "Usuario",
    role,
    tenantId: (user.app_metadata?.tenant_id as string) ?? DEFAULT_TENANT_ID,
    provider: "supabase",
  };
}

async function getLocalSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isSupabaseAuthConfigured()) {
    const supabaseUser = await getSupabaseSessionUser();
    if (supabaseUser) return supabaseUser;
  }
  return getLocalSessionUser();
}

async function tryLocalCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const local = await verifyLocalPassword(email, password);
  if (!local) return null;

  return {
    id: local.id,
    email: local.email,
    name: local.name,
    role: local.role,
    tenantId: local.tenantId,
    provider: "local",
  };
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<SessionUser> {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user?.email) {
      const role = (data.user.app_metadata?.role as UserRole) ?? "viewer";
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email.split("@")[0] ?? "Usuario",
        role,
        tenantId:
          (data.user.app_metadata?.tenant_id as string) ?? DEFAULT_TENANT_ID,
        provider: "supabase",
      };
    }

    const localFallback = await tryLocalCredentials(email, password);
    if (localFallback) return localFallback;

    throw new Error(error?.message ?? "Credenciais invalidas");
  }

  const localFallback = await tryLocalCredentials(email, password);
  if (localFallback) return localFallback;

  throw new Error("E-mail ou senha incorretos");
}

export async function logoutCurrentUser(): Promise<void> {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
}

export async function buildSessionForUser(user: SessionUser): Promise<string> {
  return createSessionToken(user);
}

export { createSupabaseServerClient };
