/** EU country reference data — codes match Eurostat `geo` dimension. */
export interface Country {
  code: string;
  name: string;
  displayCode: string;
}

export const EU_COUNTRIES: Country[] = [
  { code: "AT", name: "Austria", displayCode: "AT" },
  { code: "BE", name: "Belgium", displayCode: "BE" },
  { code: "BG", name: "Bulgaria", displayCode: "BG" },
  { code: "HR", name: "Croatia", displayCode: "HR" },
  { code: "CY", name: "Cyprus", displayCode: "CY" },
  { code: "CZ", name: "Czechia", displayCode: "CZ" },
  { code: "DK", name: "Denmark", displayCode: "DK" },
  { code: "EE", name: "Estonia", displayCode: "EE" },
  { code: "FI", name: "Finland", displayCode: "FI" },
  { code: "FR", name: "France", displayCode: "FR" },
  { code: "DE", name: "Germany", displayCode: "DE" },
  { code: "EL", name: "Greece", displayCode: "GR" },
  { code: "HU", name: "Hungary", displayCode: "HU" },
  { code: "IE", name: "Ireland", displayCode: "IE" },
  { code: "IT", name: "Italy", displayCode: "IT" },
  { code: "LV", name: "Latvia", displayCode: "LV" },
  { code: "LT", name: "Lithuania", displayCode: "LT" },
  { code: "LU", name: "Luxembourg", displayCode: "LU" },
  { code: "MT", name: "Malta", displayCode: "MT" },
  { code: "NL", name: "Netherlands", displayCode: "NL" },
  { code: "PL", name: "Poland", displayCode: "PL" },
  { code: "PT", name: "Portugal", displayCode: "PT" },
  { code: "RO", name: "Romania", displayCode: "RO" },
  { code: "SK", name: "Slovakia", displayCode: "SK" },
  { code: "SI", name: "Slovenia", displayCode: "SI" },
  { code: "ES", name: "Spain", displayCode: "ES" },
  { code: "SE", name: "Sweden", displayCode: "SE" },
];

export const EU_AGGREGATE = {
  code: "EU27_2020",
  name: "European Union",
  displayCode: "EU",
};

const COUNTRY_BY_CODE = new Map(
  [EU_AGGREGATE, ...EU_COUNTRIES].map((c) => [c.code, c]),
);

export function countryName(code: string): string {
  return COUNTRY_BY_CODE.get(code)?.name ?? code;
}

export function countryDisplayCode(code: string): string {
  return COUNTRY_BY_CODE.get(code)?.displayCode ?? code;
}

export const EU_COUNTRY_CODES = new Set(EU_COUNTRIES.map((c) => c.code));

/** Eurostat aggregate codes that should be excluded from country comparisons. */
export const AGGREGATE_CODES = new Set([
  "EU27_2020",
  "EU28",
  "EU27_2007",
  "EU15",
  "EA",
  "EA21",
  "EA20",
  "EA19",
  "EA18",
  "EA12",
]);
