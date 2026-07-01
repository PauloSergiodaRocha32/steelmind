import { AppShell } from "@/components/layout/app-shell";
import { ProductionDashboard } from "@/modules/production";

export default function ProductionPage() {
  return (
    <AppShell title="Produção">
      <ProductionDashboard />
    </AppShell>
  );
}
