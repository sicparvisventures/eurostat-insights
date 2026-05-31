export type RestaurantKpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  detail: string;
  level: "location" | "district";
};

export type HourlyRevenue = {
  hour: string;
  tickets: number;
  revenue: number;
  share: number;
};

export const LOCATION_KPIS: RestaurantKpi[] = [
  {
    id: "location-revenue",
    label: "Revenue ex VAT",
    value: "EUR 13,244",
    delta: "+4.9% vs last week",
    detail: "KM11 yesterday revenue.",
    level: "location",
  },
  {
    id: "location-budget",
    label: "Budget gap",
    value: "-EUR 1,045",
    delta: "-7.3%",
    detail: "Yesterday versus daily budget EUR 14,289.",
    level: "location",
  },
  {
    id: "location-productivity",
    label: "Productivity",
    value: "EUR 95.5/h",
    detail: "Revenue per worked hour.",
    level: "location",
  },
  {
    id: "location-labor",
    label: "Staff cost",
    value: "18.8%",
    detail: "Labor cost ratio; target model uses max 12.5h per EUR 1,000.",
    level: "location",
  },
  {
    id: "location-ticket",
    label: "Avg ticket",
    value: "EUR 35.12",
    detail: "Average sales by guest.",
    level: "location",
  },
  {
    id: "location-guests",
    label: "Guests",
    value: "427",
    delta: "-2.9% vs Y-1 revenue",
    detail: "Reported location guest volume.",
    level: "location",
  },
];

export const DISTRICT_KPIS: RestaurantKpi[] = [
  {
    id: "district-revenue",
    label: "District revenue",
    value: "EUR 49,984",
    delta: "-5.6% vs last week",
    detail: "District total revenue ex VAT.",
    level: "district",
  },
  {
    id: "district-budget",
    label: "District budget gap",
    value: "-EUR 9,440",
    delta: "-15.9%",
    detail: "Yesterday versus district daily budget EUR 59,424.",
    level: "district",
  },
  {
    id: "district-productivity",
    label: "District productivity",
    value: "EUR 83.1/h",
    detail: "601.3 worked hours.",
    level: "district",
  },
  {
    id: "district-labor",
    label: "District staff cost",
    value: "24.1%",
    detail: "Labor cost ratio across the district.",
    level: "district",
  },
];

export const KM11_HOURLY_REVENUE: HourlyRevenue[] = [
  { hour: "12:00", tickets: 1, revenue: 497, share: 3 },
  { hour: "13:00", tickets: 13, revenue: 1416, share: 9 },
  { hour: "14:00", tickets: 25, revenue: 1806, share: 12 },
  { hour: "15:00", tickets: 31, revenue: 1469, share: 10 },
  { hour: "16:00", tickets: 29, revenue: 1218, share: 8 },
  { hour: "17:00", tickets: 37, revenue: 1038, share: 7 },
  { hour: "18:00", tickets: 16, revenue: 1154, share: 8 },
  { hour: "19:00", tickets: 27, revenue: 2634, share: 17 },
  { hour: "20:00", tickets: 33, revenue: 1123, share: 7 },
  { hour: "21:00", tickets: 21, revenue: 1406, share: 9 },
  { hour: "22:00", tickets: 25, revenue: 909, share: 6 },
  { hour: "23:00", tickets: 16, revenue: 548, share: 4 },
];

export const BELGIUM_MVP_SOURCES = [
  {
    source: "NMBS/iRail",
    use: "Station arrival pressure and disruptions near locations.",
    reliability: "High for train schedule presence; medium as footfall proxy.",
  },
  {
    source: "Open-Meteo",
    use: "Rain, temperature, wind and terrace/delivery modifiers.",
    reliability: "High for weather; effect size must be calibrated per site.",
  },
  {
    source: "UiTdatabank / publiq",
    use: "Flanders and Brussels local events.",
    reliability: "High when venue is precise; needs integration credentials.",
  },
  {
    source: "Ticketmaster",
    use: "Concerts, sports and larger event spillover.",
    reliability: "High for listed major events; incomplete for local calendars.",
  },
  {
    source: "OpenStreetMap",
    use: "Competitor, hotel, attraction and station density.",
    reliability: "Medium; static and coverage depends on mapper quality.",
  },
  {
    source: "Eurostat",
    use: "Macro baseline: tourism, turnover, inflation, labor and demography.",
    reliability: "High for official context; too lagged for daily operations.",
  },
];

export const FORECAST_ENGINE_STEPS = [
  {
    step: "Historical KPI baseline",
    detail:
      "Start from location revenue, tickets, guests, average ticket, labor ratio and hourly mix.",
    weight: "45%",
  },
  {
    step: "District benchmark",
    detail:
      "Compare site performance against district revenue, productivity and budget leakage.",
    weight: "20%",
  },
  {
    step: "Local demand modifiers",
    detail:
      "Apply weather, event, transit and holiday adjustments by daypart.",
    weight: "25%",
  },
  {
    step: "Macro and confidence",
    detail:
      "Use Eurostat and source health as context and confidence, not as daily truth.",
    weight: "10%",
  },
];
