import type { UserRole } from "@/types/auth";

export type Permission =
  | "warehouse:read"
  | "warehouse:write"
  | "warehouse:move"
  | "purchasing:read"
  | "purchasing:write"
  | "engineering:read"
  | "engineering:write"
  | "commercial:read"
  | "commercial:write"
  | "budget:read"
  | "budget:write"
  | "platform:admin"
  | "gestio:sync";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "warehouse:read",
    "warehouse:write",
    "warehouse:move",
    "purchasing:read",
    "purchasing:write",
    "engineering:read",
    "engineering:write",
    "commercial:read",
    "commercial:write",
    "budget:read",
    "budget:write",
    "platform:admin",
    "gestio:sync",
  ],
  manager: [
    "warehouse:read",
    "warehouse:write",
    "warehouse:move",
    "purchasing:read",
    "purchasing:write",
    "engineering:read",
    "engineering:write",
    "commercial:read",
    "commercial:write",
    "budget:read",
    "budget:write",
    "gestio:sync",
  ],
  warehouse: ["warehouse:read", "warehouse:write", "warehouse:move"],
  purchasing: ["warehouse:read", "purchasing:read", "purchasing:write"],
  engineering: ["warehouse:read", "engineering:read", "engineering:write"],
  viewer: [
    "warehouse:read",
    "purchasing:read",
    "engineering:read",
    "commercial:read",
    "budget:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/settings")) {
    return hasPermission(role, "platform:admin");
  }
  if (role === "admin" || role === "manager") return true;

  if (pathname.startsWith("/warehouse")) {
    return hasPermission(role, "warehouse:read");
  }
  if (pathname.startsWith("/purchasing")) {
    return hasPermission(role, "purchasing:read");
  }
  if (pathname.startsWith("/engineering")) {
    return hasPermission(role, "engineering:read");
  }
  if (pathname.startsWith("/budget")) {
    return hasPermission(role, "budget:read");
  }
  if (pathname.startsWith("/opportunities")) {
    return hasPermission(role, "commercial:read");
  }
  return true;
}

export { ROLE_PERMISSIONS };
