export type RangePreset =
  | "last-month"
  | "last-year"
  | "ytd"
  | "3y"
  | "5y"
  | "custom";

export type DataRange = {
  preset: RangePreset;
  start?: string;
  end?: string;
};

export const DEFAULT_DATA_RANGE: DataRange = { preset: "5y" };

export const RANGE_PRESETS: {
  value: RangePreset;
  label: string;
  description: string;
}[] = [
  {
    value: "last-month",
    label: "Last month",
    description: "Most recent monthly point, or one period for annual data.",
  },
  {
    value: "last-year",
    label: "Last year",
    description: "12 months, 4 quarters or one annual point.",
  },
  {
    value: "ytd",
    label: "YTD",
    description: "From January to the latest available period.",
  },
  {
    value: "3y",
    label: "3 years",
    description: "Enough history to compare recent movement.",
  },
  {
    value: "5y",
    label: "5 years",
    description: "Longer structural trend.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Choose start and end months.",
  },
];

export function periodsForRange(
  range: DataRange,
  frequency: "A" | "M" | "Q" = "M",
) {
  if (range.preset === "last-month") return 1;
  if (range.preset === "last-year") {
    if (frequency === "A") return 1;
    if (frequency === "Q") return 4;
    return 12;
  }
  if (range.preset === "3y") {
    if (frequency === "A") return 3;
    if (frequency === "Q") return 12;
    return 36;
  }
  if (range.preset === "5y") {
    if (frequency === "A") return 5;
    if (frequency === "Q") return 20;
    return 60;
  }
  if (range.preset === "ytd") {
    if (frequency === "A") return 1;
    if (frequency === "Q") return Math.ceil((new Date().getMonth() + 1) / 3);
    return new Date().getMonth() + 1;
  }
  return undefined;
}

export function rangeToFetchParams(
  range: DataRange,
  frequency: "A" | "M" | "Q" = "M",
): {
  lastTimePeriod?: number;
  sinceTimePeriod?: string;
  untilTimePeriod?: string;
} {
  if (range.preset === "custom" && (range.start || range.end)) {
    return {
      sinceTimePeriod: range.start,
      untilTimePeriod: range.end,
    };
  }
  return { lastTimePeriod: periodsForRange(range, frequency) ?? 12 };
}

export function rangeLabel(range: DataRange) {
  if (range.preset === "custom") {
    if (range.start && range.end) return `${range.start} - ${range.end}`;
    if (range.start) return `From ${range.start}`;
    if (range.end) return `Until ${range.end}`;
    return "Custom range";
  }
  return RANGE_PRESETS.find((preset) => preset.value === range.preset)?.label;
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}
