"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface CommandMenuTriggerProps {
  className?: string;
}

export function CommandMenuTrigger({ className }: CommandMenuTriggerProps) {
  return (
    <button
      type="button"
      disabled
      aria-label="Command menu (coming soon)"
      className={cn(
        "group flex h-9 w-full items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 text-sm text-muted-foreground transition-all duration-200 ease-shell",
        "hover:border-border hover:bg-muted/40 hover:text-foreground/80",
        "disabled:cursor-default disabled:opacity-100",
        className,
      )}
    >
      <Search
        className="h-4 w-4 shrink-0 transition-colors group-hover:text-foreground/70"
        aria-hidden="true"
      />
      <span className="flex-1 truncate text-left text-[13px]">
        Search or jump to...
      </span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border/80 bg-background/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span>⌘</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
