/**
 * Curated major cities per country (capital first). Used for the location
 * city dropdown so weather geocoding always resolves cleanly — free-text
 * city input is avoided on purpose.
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  AT: ["Vienna", "Graz", "Salzburg", "Innsbruck"],
  BE: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liège", "Leuven"],
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
