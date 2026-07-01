import { NextResponse } from "next/server";
import { getGestioDepartmentAudit } from "@/departments/gestio";
import { isAuthError, requirePermission } from "@/lib/auth/api-guard";

export async function GET() {
  const auth = await requirePermission("platform:admin");
  if (isAuthError(auth)) return auth;

  return NextResponse.json({
    data: getGestioDepartmentAudit(),
  });
}
