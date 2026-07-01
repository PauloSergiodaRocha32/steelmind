export type UserRole =
  | "admin"
  | "manager"
  | "warehouse"
  | "purchasing"
  | "engineering"
  | "viewer";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  provider: "supabase" | "local";
}

export interface LocalUserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  passwordHash: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  warehouse: "Almoxarifado",
  purchasing: "Compras",
  engineering: "Engenharia",
  viewer: "Visualizador",
};

export const DEFAULT_TENANT_ID = "inglesa-metais";
