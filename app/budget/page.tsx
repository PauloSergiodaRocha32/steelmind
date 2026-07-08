import { AppShell } from "@/components/layout/app-shell";
import { BudgetCopilot } from "@/modules/budget/components/budget-copilot";

export default function BudgetPage() {
  return (
    <AppShell title="Orçamentos">
      <BudgetCopilot />
    </AppShell>
  );
}
