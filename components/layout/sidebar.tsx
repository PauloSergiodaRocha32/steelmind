"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarNav,
  SidebarNavFooter,
} from "@/components/layout/sidebar-nav";

interface SidebarProps {
  className?: string;
}

function LogoMark() {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4 text-primary"
          aria-hidden="true"
        >
          <path
            d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 2V22M4 6.5L20 17.5M20 6.5L4 17.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300 ease-shell md:flex",
        sidebarCollapsed ? "w-[60px]" : "w-[240px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border/80",
          sidebarCollapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 transition-opacity hover:opacity-80",
            sidebarCollapsed && "justify-center",
          )}
        >
          <LogoMark />
          {!sidebarCollapsed && (
            <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <SidebarNav collapsed={sidebarCollapsed} />
      </ScrollArea>

      <div className="mt-auto shrink-0 space-y-2 pb-3">
        <Separator className="bg-sidebar-border/80" />
        <SidebarNavFooter collapsed={sidebarCollapsed} />
        <div className={cn("px-2", sidebarCollapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "sm"}
            className={cn(
              "text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground",
              !sidebarCollapsed && "w-full justify-start gap-2 px-2.5",
            )}
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
