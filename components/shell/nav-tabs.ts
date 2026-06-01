export interface NavTab {
  href: string;
  label: string;
  icon: string;
}

export const CONSUMER_TABS: NavTab[] = [
  { href: "/home", label: "Home", icon: "Home" },
  { href: "/topics", label: "Topics", icon: "LayoutGrid" },
  { href: "/explore", label: "Explore", icon: "Compass" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export const BUSINESS_TABS: NavTab[] = [
  { href: "/business/home", label: "Command", icon: "Activity" },
  { href: "/business/forecast", label: "Forecast", icon: "LineChart" },
  { href: "/business/signals", label: "Signals", icon: "Radar" },
  { href: "/business/locations", label: "Locations", icon: "Store" },
  { href: "/business/settings", label: "Settings", icon: "Settings" },
];
