export const APP_NAME = "SteelMind";
export const APP_DESCRIPTION =
  "Enterprise SaaS platform for steel industry operations";

export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/", icon: "LayoutDashboard" as const },
      { title: "Opportunities", href: "/opportunities", icon: "Target" as const },
      { title: "Engineering", href: "/engineering", icon: "Wrench" as const },
      { title: "Budget", href: "/budget", icon: "PieChart" as const },
      { title: "Production", href: "/production", icon: "Factory" as const },
      { title: "Almoxarifado", href: "/warehouse", icon: "Warehouse" as const },
      { title: "Purchasing", href: "/purchasing", icon: "ShoppingCart" as const },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Knowledge", href: "/knowledge", icon: "BookOpen" as const },
      { title: "AI", href: "/ai", icon: "Sparkles" as const },
    ],
  },
] as const;

export const NAV_FOOTER_ITEMS = [
  { title: "Settings", href: "/settings", icon: "Settings" as const },
] as const;

export type NavIcon =
  | "LayoutDashboard"
  | "Target"
  | "Wrench"
  | "PieChart"
  | "Factory"
  | "ShoppingCart"
  | "Warehouse"
  | "BookOpen"
  | "Sparkles"
  | "Settings";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIcon;
};

function toNavItems(
  items: ReadonlyArray<{ title: string; href: string; icon: string }>,
): NavItem[] {
  return items.map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon as NavIcon,
  }));
}

export const ALL_NAV_ITEMS: NavItem[] = [
  ...toNavItems(NAV_GROUPS[0].items),
  ...toNavItems(NAV_GROUPS[1].items),
  ...toNavItems(NAV_FOOTER_ITEMS),
];

export function getPageTitle(pathname: string): string {
  const item = ALL_NAV_ITEMS.find((nav) =>
    nav.href === "/" ? pathname === "/" : pathname.startsWith(nav.href),
  );
  return item?.title ?? "Dashboard";
}
