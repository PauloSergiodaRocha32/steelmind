import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types/auth";

export async function requireAuth(): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Não autenticado", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }
  return user;
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionUser | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (!hasPermission(result.role, permission)) {
    return NextResponse.json(
      { error: { message: "Sem permissão", code: "FORBIDDEN" } },
      { status: 403 },
    );
  }
  return result;
}

export function isAuthError(
  result: SessionUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
