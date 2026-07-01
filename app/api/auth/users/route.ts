import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createLocalUser, listLocalUsersPublic } from "@/lib/auth/local-users";
import { hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/auth";
import { isSupabaseAuthConfigured } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "platform:admin")) {
    return NextResponse.json(
      { error: { message: "Sem permissão" } },
      { status: 403 },
    );
  }

  if (isSupabaseAuthConfigured()) {
    return NextResponse.json({
      data: {
        users: [],
        message: "Gerencie usuários no painel Supabase Auth",
        authMode: "supabase",
      },
    });
  }

  return NextResponse.json({
    data: { users: listLocalUsersPublic(), authMode: "local" },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "platform:admin")) {
    return NextResponse.json(
      { error: { message: "Sem permissão" } },
      { status: 403 },
    );
  }

  if (isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: { message: "Use o painel Supabase para criar usuários" } },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      role: UserRole;
    };
    const created = createLocalUser(body);
    const { passwordHash, ...safe } = created;
    void passwordHash;
    return NextResponse.json({ data: safe }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar usuário";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }
}
