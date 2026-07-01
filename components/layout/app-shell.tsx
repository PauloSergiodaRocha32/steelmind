import { SteelAICopilot } from "@/components/ai/steel-ai-copilot";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface AppShellProps {
  children?: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title = "Dashboard" }: AppShellProps) {
  const showPageHeading = title !== "Dashboard";

  return (
    <div className="relative flex h-screen overflow-hidden bg-background shell-gradient">
      <div
        className="pointer-events-none absolute inset-0 shell-grid opacity-40"
        aria-hidden="true"
      />

      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
            {showPageHeading && (
              <h1 className="mb-8 hidden animate-fade-in text-2xl font-semibold tracking-tight text-foreground md:block">
                {title}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>

      <SteelAICopilot />
    </div>
  );
}
