/**
 * Connector inventory + health for Business Mode. The actual demand signals are
 * computed live by the forecast engine; this file only describes the data
 * sources the model can draw on and their connection status.
 */
export type SourceHealth = {
  source: string;
  status: "ok" | "degraded" | "missing_credentials" | "unavailable";
  freshness?: string;
};

export const BUSINESS_SIGNAL_SOURCES = [
  {
    id: "weather",
    title: "Open-Meteo",
    description: "Live hourly weather, rain risk and terrace comfort.",
    icon: "CloudSun",
  },
  {
    id: "eurostat",
    title: "Eurostat baseline",
    description: "Tourism seasonality, catering inflation and sector context.",
    icon: "Database",
  },
  {
    id: "osm",
    title: "OpenStreetMap",
    description: "Competitors, attractions, stations and local POI density.",
    icon: "MapPinned",
  },
  {
    id: "events",
    title: "Events",
    description: "Ticketmaster, UiTdatabank and curated city calendars.",
    icon: "CalendarDays",
  },
  {
    id: "transport",
    title: "Transit",
    description: "iRail, STIB/MIVB, De Lijn and station arrival pressure.",
    icon: "Train",
  },
  {
    id: "counters",
    title: "Counters",
    description: "Brussels Mobility, Telraam and city pedestrian counters.",
    icon: "Activity",
  },
];

export const SOURCE_HEALTH: SourceHealth[] = [
  { source: "Open-Meteo", status: "ok", freshness: "hourly" },
  { source: "Eurostat", status: "ok", freshness: "monthly/annual" },
  { source: "OpenStreetMap", status: "ok", freshness: "cached weekly" },
  { source: "Events", status: "missing_credentials" },
  { source: "Transit", status: "degraded", freshness: "coverage-dependent" },
  { source: "Counters", status: "missing_credentials" },
];
