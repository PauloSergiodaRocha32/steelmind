import type { UserRole } from "@/types/auth";
import { canAccessRoute } from "@/lib/auth/permissions";

export function canAccessNavHref(role: UserRole, href: string): boolean {
  return canAccessRoute(role, href);
}
