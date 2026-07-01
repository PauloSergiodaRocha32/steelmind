import { NextResponse } from "next/server";
import { applyGestioClassification } from "@/providers/gestio/sync";
import { requirePermission, isAuthError } from "@/lib/auth/api-guard";

export async function POST(request: Request) {
  const auth = await requirePermission("gestio:sync");
  if (isAuthError(auth)) return auth;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      apply?: boolean;
    };
    const result = await applyGestioClassification(!body.apply);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Classification failed";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
