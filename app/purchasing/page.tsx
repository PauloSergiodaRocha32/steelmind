import { AppShell } from "@/components/layout/app-shell";
import { PurchasingDashboard } from "@/modules/purchasing";

export default function PurchasingPage() {
  return (
    <AppShell title="Compras">
      <PurchasingDashboard />
    </AppShell>
  );
}
