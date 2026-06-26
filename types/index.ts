export type ModuleName = "commercial" | "engineering" | "budget";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  module?: ModuleName;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  module: ModuleName | "system";
}
