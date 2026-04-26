export interface HomeTodo {
  cca3: string;
  flag: string;
  flags?: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  coatOfArms?: {
    png?: string;
    svg?: string;
  };
  name: {
    common: string;
    official: string;
    nativeName?: Record<
      string,
      {
        official: string;
        common: string;
      }
    >;
  };
  currencies?: Record<
    string,
    {
      name: string;
      symbol?: string;
    }
  >;
  languages?: Record<string, string>;
  translations?: Record<
    string,
    {
      official: string;
      common: string;
    }
  >;
  capital?: string[];
  region: string;
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  population: number;
  latlng?: number[];
}

export interface HomeMutationPayload {
  id?: number;
  title: string;
  completed?: boolean;
  userId?: number;
}

export interface HomeDeletePayload {
  countryCode: string;
}

export interface HomeApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}
