/**
 * Curated major cities per country (capital first). Used for the location
 * city dropdown so weather geocoding always resolves cleanly — free-text
 * city input is avoided on purpose.
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  AT: ["Vienna", "Graz", "Salzburg", "Innsbruck"],
  BE: [
    "Brussel",
    "Antwerpen",
    "Gent",
    "Brugge",
    "Leuven",
    "Mechelen",
    "Oostende",
    "Kortrijk",
    "Hasselt",
    "Genk",
    "Aalst",
    "Sint-Niklaas",
    "Roeselare",
    "Turnhout",
    "Lier",
    "Dendermonde",
    "Ieper",
    "Knokke-Heist",
    "Blankenberge",
    "Liège",
    "Namur",
    "Charleroi",
  ],
  BG: ["Sofia", "Plovdiv", "Varna"],
  HR: ["Zagreb", "Split", "Dubrovnik"],
  CY: ["Nicosia", "Limassol"],
  CZ: ["Prague", "Brno", "Ostrava"],
  DK: ["Copenhagen", "Aarhus", "Odense"],
  EE: ["Tallinn", "Tartu"],
  FI: ["Helsinki", "Tampere", "Turku"],
  FR: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux", "Lille"],
  DE: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Düsseldorf"],
  EL: ["Athens", "Thessaloniki", "Heraklion"],
  HU: ["Budapest", "Debrecen", "Szeged"],
  IE: ["Dublin", "Cork", "Galway"],
  IT: ["Rome", "Milan", "Florence", "Naples", "Venice", "Turin"],
  LV: ["Riga", "Jurmala"],
  LT: ["Vilnius", "Kaunas", "Klaipeda"],
  LU: ["Luxembourg"],
  MT: ["Valletta", "Sliema"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  PL: ["Warsaw", "Krakow", "Wroclaw", "Gdansk"],
  PT: ["Lisbon", "Porto", "Faro"],
  RO: ["Bucharest", "Cluj-Napoca", "Brasov"],
  SK: ["Bratislava", "Kosice"],
  SI: ["Ljubljana", "Maribor", "Bled"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga", "Bilbao"],
  SE: ["Stockholm", "Gothenburg", "Malmö"],
};

export function citiesForCountry(country: string): string[] {
  return CITIES_BY_COUNTRY[country] ?? ["Brussels"];
}

export interface CityCoordinates {
  lat: number;
  lon: number;
}

const CITY_COORDINATES: Record<string, CityCoordinates> = {
  "BE:BRUSSEL": { lat: 50.8503, lon: 4.3517 },
  "BE:BRUSSELS": { lat: 50.8503, lon: 4.3517 },
  "BE:ANTWERPEN": { lat: 51.2194, lon: 4.4025 },
  "BE:ANTWERP": { lat: 51.2194, lon: 4.4025 },
  "BE:GENT": { lat: 51.0543, lon: 3.7174 },
  "BE:GHENT": { lat: 51.0543, lon: 3.7174 },
  "BE:BRUGGE": { lat: 51.2093, lon: 3.2247 },
  "BE:BRUGES": { lat: 51.2093, lon: 3.2247 },
  "BE:LEUVEN": { lat: 50.8798, lon: 4.7005 },
  "BE:MECHELEN": { lat: 51.0259, lon: 4.4775 },
  "BE:OOSTENDE": { lat: 51.2154, lon: 2.9287 },
  "BE:OSTEND": { lat: 51.2154, lon: 2.9287 },
  "BE:KORTRIJK": { lat: 50.8276, lon: 3.2659 },
  "BE:HASSELT": { lat: 50.9307, lon: 5.3325 },
  "BE:GENK": { lat: 50.965, lon: 5.5008 },
  "BE:AALST": { lat: 50.9383, lon: 4.0392 },
  "BE:SINT-NIKLAAS": { lat: 51.1647, lon: 4.1396 },
  "BE:ROESELARE": { lat: 50.9465, lon: 3.1227 },
  "BE:TURNHOUT": { lat: 51.3225, lon: 4.9447 },
  "BE:LIER": { lat: 51.1313, lon: 4.5704 },
  "BE:DENDERMONDE": { lat: 51.0287, lon: 4.1011 },
  "BE:IEPER": { lat: 50.8511, lon: 2.8857 },
  "BE:YPRES": { lat: 50.8511, lon: 2.8857 },
  "BE:KNOKKE-HEIST": { lat: 51.3404, lon: 3.2853 },
  "BE:BLANKENBERGE": { lat: 51.313, lon: 3.1323 },
  "BE:LIÈGE": { lat: 50.6326, lon: 5.5797 },
  "BE:LIEGE": { lat: 50.6326, lon: 5.5797 },
  "BE:NAMUR": { lat: 50.4674, lon: 4.8718 },
  "BE:CHARLEROI": { lat: 50.4108, lon: 4.4446 },
};

function cityKey(country: string, city: string) {
  return `${country}:${city}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

export function cityCoordinates(
  country: string,
  city: string,
): CityCoordinates | null {
  return CITY_COORDINATES[cityKey(country, city)] ?? null;
}
