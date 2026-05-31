import { BUSINESS_EUROSTAT_SIGNALS } from "@/lib/business/sources/eurostat";

export type BusinessSignal = {
  source: string;
  signal: string;
  locationId: string;
  timestamp: string;
  horizon: "now" | "today" | "7d" | "30d" | "monthly" | "annual";
  geography: {
    lat?: number;
    lon?: number;
    radiusMeters?: number;
    geoCode?: string;
    nutsCode?: string;
  };
  value: number;
  unit: string;
  confidence: number;
  direction: "positive" | "negative" | "neutral";
  explanation: string;
  rawRef?: string;
};

export type HotspotEstimate = {
  id: string;
  label: string;
  center: { lat: number; lon: number };
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  score: number;
  confidence: number;
  reasons: string[];
  sources: string[];
  businessImpact: "covers" | "delivery" | "terrace" | "staffing" | "stock";
};

export type DaypartForecast = {
  id: "breakfast" | "lunch" | "afternoon" | "dinner" | "late";
  label: string;
  window: string;
  demand: number;
  delta: number;
  confidence: number;
  staff: string;
  stock: string;
};

export type SourceHealth = {
  source: string;
  status: "ok" | "degraded" | "missing_credentials" | "unavailable";
  freshness?: string;
};

export const BUSINESS_SIGNAL_SOURCES = [
  {
    id: "weather",
    title: "Open-Meteo",
    description: "Hourly weather, rain risk and terrace comfort.",
    access: "Open API",
    priority: "Very high",
    icon: "CloudSun",
  },
  {
    id: "osm",
    title: "OpenStreetMap",
    description: "Competitors, attractions, stations and local POI density.",
    access: "Fair-use open data",
    priority: "Very high",
    icon: "MapPinned",
  },
  {
    id: "events",
    title: "Events",
    description: "Ticketmaster, UiTdatabank and curated city calendars.",
    access: "Connector/API key",
    priority: "Very high",
    icon: "CalendarDays",
  },
  {
    id: "transport",
    title: "Transit",
    description: "iRail, STIB/MIVB, De Lijn and station arrival pressure.",
    access: "Open or registered APIs",
    priority: "High",
    icon: "Train",
  },
  {
    id: "counters",
    title: "Counters",
    description: "Brussels Mobility, Telraam and city pedestrian counters.",
    access: "City-dependent",
    priority: "High",
    icon: "Activity",
  },
  {
    id: "news",
    title: "News and buzz",
    description: "GDELT, RSS and local disruption/event signals.",
    access: "Open, noisy proxy",
    priority: "Medium",
    icon: "Newspaper",
  },
  {
    id: "eurostat",
    title: "Eurostat baseline",
    description: "Tourism, turnover, inflation, labour and demography context.",
    access: "Open API",
    priority: "High",
    icon: "Database",
  },
];

export const DAYPART_FORECASTS: DaypartForecast[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    window: "07:00-10:30",
    demand: 48,
    delta: -4,
    confidence: 69,
    staff: "Lean floor team",
    stock: "Normal bakery prep",
  },
  {
    id: "lunch",
    label: "Lunch",
    window: "11:30-14:30",
    demand: 64,
    delta: 9,
    confidence: 76,
    staff: "Add 1 runner",
    stock: "Prep quick-turn tables",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    window: "14:30-17:30",
    demand: 52,
    delta: 2,
    confidence: 63,
    staff: "Terrace flexible",
    stock: "Watch dessert stock",
  },
  {
    id: "dinner",
    label: "Dinner",
    window: "18:00-22:00",
    demand: 78,
    delta: 18,
    confidence: 82,
    staff: "Schedule peak cover",
    stock: "Increase mains by 12%",
  },
  {
    id: "late",
    label: "Late",
    window: "22:00-02:00",
    demand: 58,
    delta: 7,
    confidence: 61,
    staff: "Keep bar coverage",
    stock: "Normal beverage buffer",
  },
];

export const HOTSPOT_ESTIMATES: HotspotEstimate[] = [
  {
    id: "central-station",
    label: "Central station walk-in corridor",
    center: { lat: 50.8467, lon: 4.3572 },
    radiusMeters: 650,
    startsAt: "18:00",
    endsAt: "20:30",
    score: 82,
    confidence: 78,
    reasons: [
      "High transit arrival pressure",
      "Dry weather after 18:00",
      "Strong hotel and attraction density",
    ],
    sources: ["iRail", "Open-Meteo", "OpenStreetMap"],
    businessImpact: "covers",
  },
  {
    id: "event-venue",
    label: "Evening event spillover",
    center: { lat: 50.8441, lon: 4.3497 },
    radiusMeters: 900,
    startsAt: "19:30",
    endsAt: "22:30",
    score: 74,
    confidence: 68,
    reasons: [
      "Concert category multiplier",
      "Venue within dinner catchment",
      "Nearby bars increase late demand",
    ],
    sources: ["Ticketmaster", "OSM", "GDELT"],
    businessImpact: "staffing",
  },
  {
    id: "terrace-cluster",
    label: "Terrace and cafe cluster",
    center: { lat: 50.8489, lon: 4.3525 },
    radiusMeters: 420,
    startsAt: "12:00",
    endsAt: "16:30",
    score: 66,
    confidence: 72,
    reasons: [
      "Low rain probability",
      "Dense cafe and tourist POIs",
      "School-holiday uplift",
    ],
    sources: ["Open-Meteo", "OpenHolidays", "OpenStreetMap"],
    businessImpact: "terrace",
  },
];

export const BUSINESS_SIGNALS: BusinessSignal[] = [
  {
    source: "Open-Meteo",
    signal: "Terrace comfort",
    locationId: "primary",
    timestamp: "today",
    horizon: "today",
    geography: { lat: 50.8467, lon: 4.3525, radiusMeters: 500 },
    value: 72,
    unit: "score",
    confidence: 83,
    direction: "positive",
    explanation: "Dry early evening window supports outdoor seating.",
  },
  {
    source: "OpenStreetMap",
    signal: "Competitor cluster heat",
    locationId: "primary",
    timestamp: "latest",
    horizon: "30d",
    geography: { lat: 50.8467, lon: 4.3525, radiusMeters: 500 },
    value: 61,
    unit: "score",
    confidence: 70,
    direction: "neutral",
    explanation: "Dense restaurant/cafe area raises footfall and competition.",
  },
  {
    source: "Events",
    signal: "Dinner event gravity",
    locationId: "primary",
    timestamp: "today",
    horizon: "today",
    geography: { lat: 50.8467, lon: 4.3525, radiusMeters: 3000 },
    value: 18,
    unit: "% uplift",
    confidence: 68,
    direction: "positive",
    explanation: "Nearby evening event likely lifts pre-show and post-show demand.",
  },
  {
    source: "Transit",
    signal: "Arrival pressure",
    locationId: "primary",
    timestamp: "next 90m",
    horizon: "now",
    geography: { lat: 50.8467, lon: 4.3525, radiusMeters: 1000 },
    value: 77,
    unit: "score",
    confidence: 74,
    direction: "positive",
    explanation: "Station frequency is above normal for the next dinner window.",
  },
  ...BUSINESS_EUROSTAT_SIGNALS.slice(0, 4).map<BusinessSignal>((signal) => ({
    source: "Eurostat",
    signal: signal.title,
    locationId: "primary",
    timestamp: signal.freshnessLag,
    horizon: signal.cadence === "annual" ? "annual" : "monthly",
    geography: { geoCode: "BE" },
    value: signal.businessUse === "pricing" ? 4.1 : 57,
    unit: signal.businessUse === "pricing" ? "% y/y" : "index",
    confidence: 66,
    direction: signal.businessUse === "pricing" ? "negative" : "neutral",
    explanation: `${signal.datasetCode} gives the macro baseline, not live street-level truth.`,
    rawRef: signal.datasetCode,
  })),
];

export const SOURCE_HEALTH: SourceHealth[] = [
  { source: "Open-Meteo", status: "ok", freshness: "hourly" },
  { source: "OpenStreetMap", status: "ok", freshness: "cached weekly" },
  { source: "Eurostat", status: "ok", freshness: "monthly/annual" },
  { source: "Ticketmaster", status: "missing_credentials" },
  { source: "UiTdatabank", status: "missing_credentials" },
  { source: "iRail", status: "ok", freshness: "liveboard window" },
  { source: "Brussels counters", status: "degraded", freshness: "coverage-dependent" },
  { source: "BestTime", status: "missing_credentials" },
];

export function demandBand(score: number) {
  if (score >= 81) return "hotspot";
  if (score >= 61) return "busy";
  if (score >= 41) return "normal";
  if (score >= 21) return "below normal";
  return "quiet";
}
