export type BusinessUse =
  | "demand"
  | "pricing"
  | "labor"
  | "competition"
  | "macro";

export type BusinessEurostatSignal = {
  id: string;
  datasetCode: string;
  title: string;
  cadence: "monthly" | "quarterly" | "annual";
  naceDefaults?: string[];
  geoLevel: "country" | "nuts2" | "nuts3" | "metro";
  businessUse: BusinessUse;
  freshnessLag: string;
};

export const BUSINESS_EUROSTAT_SIGNALS: BusinessEurostatSignal[] = [
  {
    id: "restaurant-turnover",
    datasetCode: "sts_setu_m",
    title: "Food and beverage turnover",
    cadence: "monthly",
    naceDefaults: ["I56", "I561", "I563"],
    geoLevel: "country",
    businessUse: "demand",
    freshnessLag: "6-10 weeks",
  },
  {
    id: "hotel-nights",
    datasetCode: "tour_occ_nin2m",
    title: "Tourist nights by month and NUTS 2 region",
    cadence: "monthly",
    naceDefaults: ["I551"],
    geoLevel: "nuts2",
    businessUse: "demand",
    freshnessLag: "8-12 weeks",
  },
  {
    id: "hotel-occupancy",
    datasetCode: "tour_occ_anor2",
    title: "Hotel occupancy by NUTS 2 region",
    cadence: "annual",
    naceDefaults: ["I55.1"],
    geoLevel: "nuts2",
    businessUse: "demand",
    freshnessLag: "annual release",
  },
  {
    id: "hicp-restaurants-hotels",
    datasetCode: "prc_hicp_manr",
    title: "Inflation pressure for restaurants and hotels",
    cadence: "monthly",
    geoLevel: "country",
    businessUse: "pricing",
    freshnessLag: "2-5 weeks",
  },
  {
    id: "regional-unemployment",
    datasetCode: "tgs00010",
    title: "Regional unemployment rate",
    cadence: "annual",
    geoLevel: "nuts2",
    businessUse: "labor",
    freshnessLag: "annual release",
  },
  {
    id: "business-demography",
    datasetCode: "bd_hgnace_r",
    title: "Business demography by NACE and NUTS 3 region",
    cadence: "annual",
    naceDefaults: ["I", "I55", "I56"],
    geoLevel: "nuts3",
    businessUse: "competition",
    freshnessLag: "annual release",
  },
  {
    id: "regional-income",
    datasetCode: "nama_10r_2hhinc",
    title: "Household income by NUTS 2 region",
    cadence: "annual",
    geoLevel: "nuts2",
    businessUse: "macro",
    freshnessLag: "annual release",
  },
];

export const BUSINESS_NACE_DEFAULTS = [
  { code: "I", label: "Accommodation and food service" },
  { code: "I55", label: "Accommodation" },
  { code: "I551", label: "Hotels and similar accommodation" },
  { code: "I56", label: "Food and beverage service" },
  { code: "I561", label: "Restaurants and mobile food service" },
  { code: "I562", label: "Event catering and other food service" },
  { code: "I563", label: "Beverage serving activities" },
];
