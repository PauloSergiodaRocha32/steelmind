import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { UsersAdminPanel } from "@/modules/platform/components/users-admin-panel";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings");
  if (!hasPermission(user.role, "platform:admin")) redirect("/");

  return (
    <AppShell title="Configurações">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Usuários, perfis de acesso e autenticação da plataforma SteelMind.
          </p>
        </div>
        <UsersAdminPanel />
      </div>
    </AppShell>
  );
}
