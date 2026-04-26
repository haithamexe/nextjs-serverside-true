import Image from "next/image";
import Link from "next/link";

import { getCountriesFromApi } from "../../../_lib/countries/server-api";

export default async function CountriesContent() {
  const countries = await getCountriesFromApi();

  const sorted = [...countries].sort((a, b) =>
    a.name.common.localeCompare(b.name.common),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Countries</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((country) => (
          <li key={country.cca3}>
            <Link
              href={`/countries/${country.cca3}`}
              className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {country.flags.svg ? (
                <div className="relative h-40 w-full bg-gray-100">
                  <Image
                    src={country.flags.svg}
                    alt={country.flags.alt ?? `Flag of ${country.name.common}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-4xl">
                  🏳
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold">{country.name.common}</p>
                <p className="text-sm text-gray-500">{country.region}</p>
                <p className="text-xs text-gray-400">
                  {country.population.toLocaleString()} people
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
