import { NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth/api-guard";
import { buildPlatformWorkflow } from "@/lib/platform/workflow-bridge";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const data = await buildPlatformWorkflow();
  return NextResponse.json({ data });
}
