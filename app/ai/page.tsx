import { AppShell } from "@/components/layout/app-shell";
import { AIHub } from "@/modules/ai";

export default function AIPage() {
  return (
    <AppShell title="IA">
      <AIHub />
    </AppShell>
  );
}
