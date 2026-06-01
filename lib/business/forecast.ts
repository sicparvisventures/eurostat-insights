/**
 * Config-driven restaurant forecast engine.
 *
 * Everything here is pure and deterministic: given a location's configuration
 * plus optional context modifiers (weather, tourism season, events) it returns
 * a full operating forecast — revenue, covers, dayparts, an hourly curve, the
 * week pattern, labour need and a budget read. No mock data, no randomness that
 * isn't seeded by the inputs.
 */
import type { LocationConfig, PriceTier } from "@/lib/store/business";

export interface WeatherInput {
  tempMax: number;
  tempMin: number;
  precipitation: number; // mm
  windSpeed: number; // km/h
  summary?: string;
}

export interface ForecastModifiers {
  /** Today's weather at the location. */
  weather?: WeatherInput | null;
  /** Tourism season multiplier for the country/month (1 = average month). */
  seasonIndex?: number;
  /** Extra demand from nearby events, 0–0.25. */
  eventUplift?: number;
  /** Override the day being forecast (defaults to now). */
  date?: Date;
}

export interface DaypartForecast {
  id: "lunch" | "dinner" | "late";
  label: string;
  window: string;
  revenue: number;
  covers: number;
  demand: number; // 0–100
  laborHours: number;
  laborCost: number;
  laborRatio: number; // 0–1
}

export interface HourPoint {
  hour: string;
  revenue: number;
  covers: number;
  share: number; // 0–100
}

export interface DayForecast {
  weekday: string;
  index: number; // 0 Mon … 6 Sun
  revenue: number;
  covers: number;
  isToday: boolean;
  isPast: boolean;
  open: boolean;
}

export interface LocationForecast {
  revenue: number;
  covers: number;
  avgTicket: number;
  productivity: number; // EUR / worked hour
  laborHours: number;
  laborCost: number;
  laborRatio: number; // 0–1
  demand: number; // 0–100
  demandBand: string;
  deltaVsNormalPct: number;
  confidence: number; // 0–100
  dayparts: DaypartForecast[];
  hourly: HourPoint[];
  week: DayForecast[];
  weeklyBudget: number;
  weeklyAchieved: number;
  weeklyForecast: number;
  budgetProgressPct: number;
  modifiers: { weather: number; season: number; event: number; weekday: number };
}

const TIER_TURNS: Record<PriceTier, number> = {
  budget: 3.0,
  casual: 2.2,
  premium: 1.7,
  fine: 1.3,
};

// Mon-indexed weekday demand pattern for hospitality (avg ≈ 1 across the week).
const WEEKDAY_MULT = [0.82, 0.85, 0.92, 1.04, 1.26, 1.34, 0.95];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Canonical hourly revenue weights (12:00–23:00) with lunch + dinner peaks.
const HOUR_WEIGHTS: { hour: string; w: number }[] = [
  { hour: "12:00", w: 6 },
  { hour: "13:00", w: 11 },
  { hour: "14:00", w: 9 },
  { hour: "15:00", w: 5 },
  { hour: "16:00", w: 4 },
  { hour: "17:00", w: 5 },
  { hour: "18:00", w: 8 },
  { hour: "19:00", w: 14 },
  { hour: "20:00", w: 15 },
  { hour: "21:00", w: 10 },
  { hour: "22:00", w: 7 },
  { hour: "23:00", w: 5 },
];

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** 0 Mon … 6 Sun from a JS Date (getDay is 0 Sun … 6 Sat). */
function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function demandBand(score: number): string {
  if (score >= 81) return "hotspot";
  if (score >= 64) return "busy";
  if (score >= 44) return "normal";
  if (score >= 24) return "below normal";
  return "quiet";
}

/** Weather → demand multiplier, scaled by the site's sensitivity + terrace mix. */
function weatherFactor(
  w: WeatherInput | null | undefined,
  sensitivity: number,
  terraceShare: number,
): number {
  if (!w) return 1;
  const s = sensitivity / 100;
  const t = w.tempMax;
  const tempComfort = t >= 18 && t <= 27 ? 1 : t >= 12 && t < 32 ? 0.5 : 0;
  const rain = w.precipitation;
  const rainPenalty = rain <= 0.5 ? 0 : rain < 3 ? 0.5 : rain < 8 ? 1 : 1.4;
  const upside = terraceShare * tempComfort * 0.18 * s;
  const downside = (0.1 + terraceShare * 0.12) * rainPenalty * s;
  return clamp(1 + upside - downside, 0.72, 1.25);
}

/** Deterministic, seeded event uplift so a location's day is stable. */
export function simulatedEventUplift(loc: LocationConfig, date: Date): number {
  const seed =
    [...loc.id].reduce((a, c) => a + c.charCodeAt(0), 0) +
    date.getDate() * 7 +
    mondayIndex(date) * 13;
  const wave = (Math.sin(seed) + 1) / 2; // 0..1
  // Weekends carry more event spillover.
  const weekendBoost = mondayIndex(date) >= 4 ? 0.06 : 0;
  return Math.round((wave * 0.16 + weekendBoost) * 100) / 100;
}

function roundTo(v: number, step = 1) {
  return Math.round(v / step) * step;
}

export function computeForecast(
  loc: LocationConfig,
  mods: ForecastModifiers = {},
): LocationForecast {
  const date = mods.date ?? new Date();
  const todayIdx = mondayIndex(date);

  const terraceShare =
    loc.terraceSeats / Math.max(1, loc.seats + loc.terraceSeats);
  const wFactor = weatherFactor(mods.weather, loc.weatherSensitivity, terraceShare);
  const season = mods.seasonIndex ?? 1;
  const event = 1 + (mods.eventUplift ?? 0);
  const weekday = WEEKDAY_MULT[todayIdx];

  // Capacity → covers on a normal day for this site.
  const tierTurns = TIER_TURNS[loc.priceTier];
  const totalSeats = loc.seats + loc.terraceSeats;
  const normalCovers = totalSeats * tierTurns;
  const normalRevenue = normalCovers * loc.avgTicket;

  const combined = weekday * wFactor * season * event;
  const revenue = normalRevenue * combined;
  const covers = normalCovers * combined;

  // Daypart split from dinner focus (lunch / dinner / late).
  const dinnerShare = clamp(0.35 + (loc.dinnerFocus / 100) * 0.4, 0.35, 0.75);
  const lateShare =
    loc.businessType === "bar" || loc.businessType === "cafe" ? 0.12 : 0.06;
  const lunchShare = clamp(1 - dinnerShare - lateShare, 0.1, 0.6);
  const splits: { id: DaypartForecast["id"]; label: string; window: string; share: number }[] = [
    { id: "lunch", label: "Lunch", window: "12:00–17:00", share: lunchShare },
    { id: "dinner", label: "Dinner", window: "17:00–22:00", share: dinnerShare },
    { id: "late", label: "Late", window: "22:00–00:00", share: lateShare },
  ];

  const laborTotalHours = (revenue / 1000) * loc.targetStaffHoursPer1000;

  const dayparts: DaypartForecast[] = splits.map((s) => {
    const dpRevenue = revenue * s.share;
    const dpHours = laborTotalHours * s.share;
    const dpLaborCost = dpHours * loc.laborHourCost;
    // Daypart demand: scale the day demand by how loaded the daypart is.
    const dpDemand = clamp(
      Math.round(50 + 50 * (combined - 1) / 0.6 + (s.share - 0.33) * 40),
      0,
      100,
    );
    return {
      id: s.id,
      label: s.label,
      window: s.window,
      revenue: roundTo(dpRevenue),
      covers: Math.round(covers * s.share),
      demand: dpDemand,
      laborHours: Math.round(dpHours * 10) / 10,
      laborCost: roundTo(dpLaborCost),
      laborRatio: dpRevenue ? dpLaborCost / dpRevenue : 0,
    };
  });

  // Hourly curve scaled to the day's revenue.
  const totalW = HOUR_WEIGHTS.reduce((a, h) => a + h.w, 0);
  const hourly: HourPoint[] = HOUR_WEIGHTS.map((h) => {
    const share = h.w / totalW;
    return {
      hour: h.hour,
      revenue: roundTo(revenue * share),
      covers: Math.round(covers * share),
      share: Math.round(share * 100),
    };
  });

  // Week pattern: budget = normal expected week; forecast applies today's context.
  const open = (i: number) => i < loc.openDays;
  const week: DayForecast[] = WEEKDAYS.map((wd, i) => {
    const isToday = i === todayIdx;
    const dayCombined = WEEKDAY_MULT[i] * season * (isToday ? wFactor * event : 1);
    const r = open(i) ? normalRevenue * dayCombined : 0;
    return {
      weekday: wd,
      index: i,
      revenue: roundTo(r),
      covers: open(i) ? Math.round(normalCovers * dayCombined) : 0,
      isToday,
      isPast: i < todayIdx,
      open: open(i),
    };
  });

  const weeklyBudget = roundTo(
    WEEKDAYS.reduce(
      (a, _, i) => a + (open(i) ? normalRevenue * WEEKDAY_MULT[i] * season : 0),
      0,
    ),
  );
  const weeklyForecast = roundTo(week.reduce((a, d) => a + d.revenue, 0));
  const weeklyAchieved = roundTo(
    week.filter((d) => d.isPast).reduce((a, d) => a + d.revenue, 0),
  );

  const laborCost = laborTotalHours * loc.laborHourCost;
  const demand = clamp(Math.round(50 + (50 * (combined - 1)) / 0.6), 2, 99);

  let confidence = 70;
  if (mods.weather) confidence += 9;
  if (mods.seasonIndex != null) confidence += 6;
  confidence = clamp(confidence, 58, 93);

  return {
    revenue: roundTo(revenue),
    covers: Math.round(covers),
    avgTicket: loc.avgTicket,
    productivity: laborTotalHours ? Math.round(revenue / laborTotalHours) : 0,
    laborHours: Math.round(laborTotalHours * 10) / 10,
    laborCost: roundTo(laborCost),
    laborRatio: revenue ? laborCost / revenue : 0,
    demand,
    demandBand: demandBand(demand),
    deltaVsNormalPct: Math.round((combined - 1) * 100),
    confidence,
    dayparts,
    hourly,
    week,
    weeklyBudget,
    weeklyAchieved,
    weeklyForecast,
    budgetProgressPct: weeklyBudget
      ? Math.round((weeklyAchieved / weeklyBudget) * 100)
      : 0,
    modifiers: {
      weather: Math.round((wFactor - 1) * 100),
      season: Math.round((season - 1) * 100),
      event: Math.round((event - 1) * 100),
      weekday: Math.round((weekday - 1) * 100),
    },
  };
}

/** Roll several location forecasts into a group/district total. */
export interface GroupForecast {
  revenue: number;
  covers: number;
  laborCost: number;
  laborRatio: number;
  weeklyBudget: number;
  weeklyForecast: number;
  avgTicket: number;
  byLocation: { id: string; name: string; forecast: LocationForecast }[];
}

export function computeGroupForecast(
  rows: { location: LocationConfig; forecast: LocationForecast }[],
): GroupForecast {
  const revenue = rows.reduce((a, r) => a + r.forecast.revenue, 0);
  const covers = rows.reduce((a, r) => a + r.forecast.covers, 0);
  const laborCost = rows.reduce((a, r) => a + r.forecast.laborCost, 0);
  return {
    revenue: roundTo(revenue),
    covers,
    laborCost: roundTo(laborCost),
    laborRatio: revenue ? laborCost / revenue : 0,
    weeklyBudget: roundTo(
      rows.reduce((a, r) => a + r.forecast.weeklyBudget, 0),
    ),
    weeklyForecast: roundTo(
      rows.reduce((a, r) => a + r.forecast.weeklyForecast, 0),
    ),
    avgTicket: covers ? Math.round((revenue / covers) * 100) / 100 : 0,
    byLocation: rows.map((r) => ({
      id: r.location.id,
      name: r.location.name,
      forecast: r.forecast,
    })),
  };
}

/** Templated agent briefing generated from the numbers, in the email's voice. */
export function buildBriefing(
  loc: LocationConfig,
  f: LocationForecast,
): string {
  const dinner = f.dayparts.find((d) => d.id === "dinner")!;
  const lunch = f.dayparts.find((d) => d.id === "lunch")!;
  const lead =
    f.deltaVsNormalPct >= 8
      ? `${loc.name || "This site"} is set up for a strong day — demand reads ${f.demandBand} and sits clearly above a normal ${WEEKDAYS[mondayIndex(new Date())]}.`
      : f.deltaVsNormalPct <= -8
        ? `${loc.name || "This site"} looks softer than normal today, so steer from control rather than chasing volume.`
        : `${loc.name || "This site"} should land close to a normal day, so keep the operation clean and predictable.`;
  const block =
    dinner.revenue >= lunch.revenue
      ? `Dinner carries the weight (€${dinner.revenue.toLocaleString("en-GB")} of the day), so keep prep short and only add pace when guest flow is clearly visible.`
      : `Lunch is the bigger block today, so front-load prep and keep the turn fast.`;
  const labor = `Labour lands at ${(f.laborRatio * 100).toFixed(1)}% with about ${f.laborHours}h planned; productivity is €${f.productivity}/h.`;
  const weather =
    f.modifiers.weather >= 4
      ? "Weather is working for the terrace — push outdoor inflow and door visibility."
      : f.modifiers.weather <= -4
        ? "Weather is a drag on walk-in, so protect the inside path and lean on delivery."
        : "Weather is roughly neutral today.";
  return `${lead} ${block} ${labor} ${weather}`;
}
