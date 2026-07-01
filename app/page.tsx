import { AppShell } from "@/components/layout/app-shell";
import { PlatformDashboard } from "@/components/dashboard/platform-dashboard";

export default function HomePage() {
  return (
    <AppShell title="Dashboard">
      <PlatformDashboard />
    </AppShell>
  );
}
