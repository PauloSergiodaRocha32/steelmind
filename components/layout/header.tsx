"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommandMenuTrigger } from "@/components/layout/command-menu-trigger";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/modules/platform/components/user-menu";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 md:gap-4 md:px-6">
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 md:hidden">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">
            {title}
          </h1>
        </div>

        <div className="hidden min-w-0 flex-1 md:block lg:max-w-xl">
          <CommandMenuTrigger />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          disabled
        >
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <UserMenu />
      </div>
    </header>
  );
}
