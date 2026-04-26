export interface Country {
  cca3: string;
  name: {
    common: string;
    official: string;
  };
  flags: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  region: string;
  population: number;
}

export interface CountryDetail extends Country {
  subregion?: string;
  capital?: string[];
  currencies?: Record<string, { name: string; symbol?: string }>;
  languages?: Record<string, string>;
  coatOfArms?: { png?: string; svg?: string };
  maps?: { googleMaps?: string; openStreetMaps?: string };
  latlng?: number[];
  timezones?: string[];
  area?: number;
}

export interface CountriesApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
