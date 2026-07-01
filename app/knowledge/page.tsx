import { AppShell } from "@/components/layout/app-shell";
import { KnowledgeHub } from "@/modules/knowledge";

export default function KnowledgePage() {
  return (
    <AppShell title="Conhecimento">
      <KnowledgeHub />
    </AppShell>
  );
}
