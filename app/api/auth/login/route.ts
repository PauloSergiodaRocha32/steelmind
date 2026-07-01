import { NextResponse } from "next/server";
import {
  loginWithCredentials,
  logoutCurrentUser,
  buildSessionForUser,
} from "@/lib/auth/session";
import {
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session-token";
import { isSupabaseAuthConfigured } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: { message: "E-mail e senha são obrigatórios" } },
        { status: 400 },
      );
    }

    const user = await loginWithCredentials(body.email, body.password);

    if (!isSupabaseAuthConfigured()) {
      const token = await buildSessionForUser(user);
      await setSessionCookie(token);
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        provider: user.provider,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no login";
    return NextResponse.json({ error: { message } }, { status: 401 });
  }
}

export async function DELETE() {
  await logoutCurrentUser();
  await clearSessionCookie();
  return NextResponse.json({ data: { ok: true } });
}
