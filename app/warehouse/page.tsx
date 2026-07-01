import { AppShell } from "@/components/layout/app-shell";
import { WarehouseDashboard } from "@/modules/warehouse";

export default function WarehousePage() {
  return (
    <AppShell title="Almoxarifado">
      <WarehouseDashboard />
    </AppShell>
  );
}
