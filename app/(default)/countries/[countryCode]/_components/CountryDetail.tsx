import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCountryFromApi } from "@/app/_lib/countries/server-api";

export default async function CountryDetail({
  countryCode,
}: {
  countryCode: string;
}) {
  const country = await getCountryFromApi(countryCode).catch(() => notFound());

  const currencies = country.currencies
    ? Object.values(country.currencies)
    : [];
  const languages = country.languages ? Object.values(country.languages) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/countries"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; Back to Countries
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {country.flags.svg && (
          <div className="relative h-56 w-full bg-gray-100">
            <Image
              src={country.flags.svg}
              alt={country.flags.alt ?? `Flag of ${country.name.common}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="mb-1 text-3xl font-bold">{country.name.common}</h1>
          <p className="mb-4 text-sm text-gray-500">{country.name.official}</p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-400">Region</dt>
              <dd>{country.region}</dd>
            </div>
            {country.subregion && (
              <div>
                <dt className="font-medium text-gray-400">Subregion</dt>
                <dd>{country.subregion}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-400">Population</dt>
              <dd>{country.population.toLocaleString()}</dd>
            </div>
            {country.capital && country.capital.length > 0 && (
              <div>
                <dt className="font-medium text-gray-400">Capital</dt>
                <dd>{country.capital.join(", ")}</dd>
              </div>
            )}
            {currencies.length > 0 && (
              <div>
                <dt className="font-medium text-gray-400">Currencies</dt>
                <dd>
                  {currencies
                    .map((c) => `${c.name}${c.symbol ? ` (${c.symbol})` : ""}`)
                    .join(", ")}
                </dd>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <dt className="font-medium text-gray-400">Languages</dt>
                <dd>{languages.join(", ")}</dd>
              </div>
            )}
            {country.area !== undefined && (
              <div>
                <dt className="font-medium text-gray-400">Area</dt>
                <dd>{country.area.toLocaleString()} km²</dd>
              </div>
            )}
            {country.timezones && country.timezones.length > 0 && (
              <div>
                <dt className="font-medium text-gray-400">Timezones</dt>
                <dd className="truncate">{country.timezones.join(", ")}</dd>
              </div>
            )}
          </dl>

          {country.maps?.googleMaps && (
            <a
              href={country.maps.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View on Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
