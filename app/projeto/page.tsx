import { AppShell } from "@/components/layout/app-shell";
import { ProjectWizard } from "@/modules/demo/components/project-wizard";

export default function ProjetoPage() {
  return (
    <AppShell title="Projeto Demo">
      <ProjectWizard />
    </AppShell>
  );
}
