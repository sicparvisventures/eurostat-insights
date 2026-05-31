/** EU country reference data — codes match Eurostat `geo` dimension. */
export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const EU_COUNTRIES: Country[] = [
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "EL", name: "Greece", flag: "🇬🇷" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
];

export const EU_AGGREGATE = { code: "EU27_2020", name: "European Union", flag: "🇪🇺" };

const COUNTRY_BY_CODE = new Map(
  [EU_AGGREGATE, ...EU_COUNTRIES].map((c) => [c.code, c]),
);

export function countryName(code: string): string {
  return COUNTRY_BY_CODE.get(code)?.name ?? code;
}

export function countryFlag(code: string): string {
  return COUNTRY_BY_CODE.get(code)?.flag ?? "🏳️";
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
