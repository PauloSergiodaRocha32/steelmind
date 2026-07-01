import { AppShell } from "@/components/layout/app-shell";
import { PipelineDashboard } from "@/modules/commercial";

export default function OpportunitiesPage() {
  return (
    <AppShell title="Oportunidades">
      <PipelineDashboard />
    </AppShell>
  );
}
