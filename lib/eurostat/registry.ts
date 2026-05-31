/**
 * Curated catalogue of Eurostat datasets, grouped into themed dashboards.
 * Every dataset code + dimension filter here is verified against the live API.
 */

export type MetricFormat =
  | "compact"
  | "percent"
  | "decimal"
  | "currency"
  | "years";

export interface Metric {
  id: string;
  datasetCode: string;
  title: string;
  short: string;
  description: string;
  /** Fixed dimension filters (excludes `geo` and `time`). */
  filters: Record<string, string>;
  unit: string;
  format: MetricFormat;
  decimals?: number;
  /** Multiply raw value before display (e.g. €millions → €). */
  scale?: number;
  frequency: "A" | "M" | "Q";
  /** For KPI trend colouring: is an increase good, bad, or neutral? */
  trend: "up-good" | "down-good" | "neutral";
}

export interface Topic {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name
  /** Single solid accent colour (no gradients anywhere in the app). */
  accent: string;
  metrics: Metric[];
}

export const TOPICS: Topic[] = [
  {
    slug: "population",
    title: "Population & Society",
    tagline: "Who Europeans are",
    description:
      "How many we are, how long we live, and how our societies are changing.",
    icon: "Users",
    accent: "#3f5a8a",
    metrics: [
      {
        id: "population",
        datasetCode: "demo_pjan",
        title: "Total population",
        short: "Population",
        description: "Population on 1 January.",
        filters: { freq: "A", unit: "NR", age: "TOTAL", sex: "T" },
        unit: "people",
        format: "compact",
        frequency: "A",
        trend: "neutral",
      },
      {
        id: "life-expectancy",
        datasetCode: "demo_mlexpec",
        title: "Life expectancy at birth",
        short: "Life expectancy",
        description: "Expected years of life at birth, both sexes.",
        filters: { sex: "T", age: "Y_LT1" },
        unit: "years",
        format: "years",
        decimals: 1,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "fertility",
        datasetCode: "demo_find",
        title: "Total fertility rate",
        short: "Fertility rate",
        description: "Average number of children per woman.",
        filters: { indic_de: "TOTFERRT" },
        unit: "per woman",
        format: "decimal",
        decimals: 2,
        frequency: "A",
        trend: "neutral",
      },
      {
        id: "median-age",
        datasetCode: "demo_pjanind",
        title: "Median age of population",
        short: "Median age",
        description: "Age dividing the population into two equal halves.",
        filters: { indic_de: "MEDAGEPOP" },
        unit: "years",
        format: "years",
        decimals: 1,
        frequency: "A",
        trend: "neutral",
      },
    ],
  },
  {
    slug: "economy",
    title: "Economy & Labour",
    tagline: "The engine of Europe",
    description:
      "Growth, jobs and prices — the indicators that shape everyday life.",
    icon: "TrendingUp",
    accent: "#2f6e52",
    metrics: [
      {
        id: "gdp",
        datasetCode: "nama_10_gdp",
        title: "Gross domestic product",
        short: "GDP",
        description: "GDP at current market prices.",
        filters: { na_item: "B1GQ", unit: "CP_MEUR" },
        unit: "€",
        format: "currency",
        scale: 1_000_000,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "gdp-growth",
        datasetCode: "tec00115",
        title: "Real GDP growth",
        short: "GDP growth",
        description: "Annual change in GDP volume.",
        filters: { na_item: "B1GQ", unit: "CLV_PCH_PRE" },
        unit: "%",
        format: "percent",
        decimals: 1,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "unemployment",
        datasetCode: "une_rt_m",
        title: "Unemployment rate",
        short: "Unemployment",
        description: "Share of the labour force without work (seasonally adj.).",
        filters: {
          freq: "M",
          s_adj: "SA",
          age: "TOTAL",
          unit: "PC_ACT",
          sex: "T",
        },
        unit: "%",
        format: "percent",
        decimals: 1,
        frequency: "M",
        trend: "down-good",
      },
      {
        id: "inflation",
        datasetCode: "prc_hicp_manr",
        title: "Inflation (HICP)",
        short: "Inflation",
        description: "Annual rate of change of consumer prices.",
        filters: { coicop: "CP00" },
        unit: "%",
        format: "percent",
        decimals: 1,
        frequency: "M",
        trend: "neutral",
      },
    ],
  },
  {
    slug: "digital",
    title: "Digital & Innovation",
    tagline: "Europe online",
    description:
      "Connectivity, research and the technologies driving the future.",
    icon: "Wifi",
    accent: "#9a6a2e",
    metrics: [
      {
        id: "internet-use",
        datasetCode: "isoc_ci_ifp_iu",
        title: "Internet users",
        short: "Internet use",
        description: "Individuals who used the internet in the last 3 months.",
        filters: { indic_is: "I_IU3", ind_type: "IND_TOTAL", unit: "PC_IND" },
        unit: "% of people",
        format: "percent",
        decimals: 0,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "rd-expenditure",
        datasetCode: "rd_e_gerdtot",
        title: "R&D expenditure",
        short: "R&D spending",
        description: "Gross domestic spending on research & development.",
        filters: { sectperf: "TOTAL", unit: "PC_GDP" },
        unit: "% of GDP",
        format: "percent",
        decimals: 2,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "household-internet",
        datasetCode: "tin00134",
        title: "Households with internet",
        short: "Home internet",
        description: "Share of households with internet access at home.",
        filters: {},
        unit: "% of households",
        format: "percent",
        decimals: 0,
        frequency: "A",
        trend: "up-good",
      },
    ],
  },
  {
    slug: "hospitality",
    title: "Hospitality & Tourism",
    tagline: "The accommodation sector",
    description:
      "Demand, occupancy and capacity across Europe's hotels and tourist accommodation — for operators and analysts.",
    icon: "BedDouble",
    accent: "#a14a3a",
    metrics: [
      {
        id: "nights-spent",
        datasetCode: "tour_occ_nim",
        title: "Nights spent at hotels",
        short: "Nights spent",
        description: "Guest nights at hotels and similar accommodation.",
        filters: { freq: "M", c_resid: "TOTAL", unit: "NR", nace_r2: "I551" },
        unit: "nights",
        format: "compact",
        frequency: "M",
        trend: "up-good",
      },
      {
        id: "arrivals",
        datasetCode: "tour_occ_arm",
        title: "Guest arrivals at hotels",
        short: "Arrivals",
        description: "Guests arriving at hotels and similar accommodation.",
        filters: { freq: "M", c_resid: "TOTAL", unit: "NR", nace_r2: "I551" },
        unit: "guests",
        format: "compact",
        frequency: "M",
        trend: "up-good",
      },
      {
        id: "occupancy-rate",
        datasetCode: "tour_occ_anor",
        title: "Bed-place occupancy rate",
        short: "Occupancy",
        description: "Net occupancy rate of bed-places in hotels.",
        filters: { accomunit: "BEDPL", hotelsize: "TOTAL", unit: "PC" },
        unit: "%",
        format: "percent",
        decimals: 1,
        frequency: "A",
        trend: "up-good",
      },
      {
        id: "bed-capacity",
        datasetCode: "tour_cap_nat",
        title: "Bed-place capacity",
        short: "Capacity",
        description: "Number of bed-places in hotels and similar accommodation.",
        filters: { accomunit: "BEDPL", unit: "NR", nace_r2: "I551" },
        unit: "bed-places",
        format: "compact",
        frequency: "A",
        trend: "neutral",
      },
    ],
  },
];

export const TOPIC_BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));

export const ALL_METRICS: (Metric & { topicSlug: string })[] = TOPICS.flatMap(
  (t) => t.metrics.map((m) => ({ ...m, topicSlug: t.slug })),
);

export function findMetric(id: string) {
  return ALL_METRICS.find((m) => m.id === id);
}

/** Format a metric value for display using its format spec. */
export function formatMetricValue(
  metric: Pick<Metric, "format" | "decimals" | "scale" | "unit">,
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "–";
  const v = metric.scale ? value * metric.scale : value;

  switch (metric.format) {
    case "percent":
      return `${v.toFixed(metric.decimals ?? 1)}%`;
    case "years":
      return `${v.toFixed(metric.decimals ?? 1)}`;
    case "decimal":
      return v.toFixed(metric.decimals ?? 2);
    case "currency":
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(v);
    case "compact":
    default:
      return new Intl.NumberFormat("en-GB", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(v);
  }
}
