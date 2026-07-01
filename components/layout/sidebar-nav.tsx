"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Factory,
  LayoutDashboard,
  PieChart,
  Settings,
  ShoppingCart,
  Sparkles,
  Target,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  NAV_FOOTER_ITEMS,
  NAV_GROUPS,
  type NavIcon,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { canAccessNavHref } from "@/lib/auth/nav-access";
import type { UserRole } from "@/types/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<NavIcon, LucideIcon> = {
  LayoutDashboard,
  Target,
  Wrench,
  PieChart,
  Factory,
  ShoppingCart,
  Warehouse,
  BookOpen,
  Sparkles,
  Settings,
};

interface NavLinkProps {
  href: string;
  title: string;
  icon: NavIcon;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavLink({
  href,
  title,
  icon,
  collapsed,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const Icon = iconMap[icon];

  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ease-shell",
        isActive
          ? "bg-sidebar-accent text-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
    >
      {isActive && (
        <span
          className={cn(
            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-200",
            collapsed && "hidden",
          )}
          aria-hidden="true"
        />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-sidebar-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{title}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json && setRole(json.data.role));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter(
          (item) => !role || canAccessNavHref(role, item.href),
        );
        if (!items.length) return null;
        return (
        <div key={group.label} className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
          )}
          <nav className="flex flex-col gap-0.5 px-2">
            {items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </div>
        );
      })}
    </div>
  );
}

export function SidebarNavFooter({
  collapsed,
  onNavigate,
}: SidebarNavProps) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json && setRole(json.data.role));
  }, []);

  const footerItems = NAV_FOOTER_ITEMS.filter(
    (item) => !role || canAccessNavHref(role, item.href),
  );

  if (!footerItems.length) return null;

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {footerItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          title={item.title}
          icon={item.icon}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
