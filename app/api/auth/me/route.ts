import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/types/auth";
import { ROLE_PERMISSIONS } from "@/lib/auth/permissions";
import { isSupabaseAuthConfigured } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Não autenticado" } },
      { status: 401 },
    );
  }

  return NextResponse.json({
    data: {
      ...user,
      roleLabel: ROLE_LABELS[user.role],
      permissions: ROLE_PERMISSIONS[user.role],
      authMode: isSupabaseAuthConfigured() ? "supabase" : "local",
    },
  });
}
