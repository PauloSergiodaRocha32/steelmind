import { AppShell } from "@/components/layout/app-shell";
import { EngineeringDashboard } from "@/modules/engineering";

export default function EngineeringPage() {
  return (
    <AppShell title="Engenharia">
      <EngineeringDashboard />
    </AppShell>
  );
}
