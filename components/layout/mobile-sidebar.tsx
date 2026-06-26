"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  SidebarNav,
  SidebarNavFooter,
} from "@/components/layout/sidebar-nav";

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const close = () => setMobileSidebarOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] border-border/60 bg-sidebar p-0"
        >
          <SheetHeader className="border-b border-sidebar-border px-5 py-4 text-left">
            <SheetTitle className="text-[15px] font-semibold tracking-tight">
              <Link href="/" onClick={close}>
                {APP_NAME}
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-4rem)] flex-col py-4">
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={close} />
            </div>
            <Separator className="my-2 bg-sidebar-border" />
            <SidebarNavFooter onNavigate={close} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
