"use client";

import Image from "next/image";
import { useState } from "react";

import { useHomeDelete } from "@/app/lib/home/hooks/use-home-delete";
import type { HomeTodo } from "@/app/lib/home/types";

interface HomePageListProps {
  todos: HomeTodo[];
}

const HomePageList = ({ todos }: HomePageListProps) => {
  const [todosList, setTodosList] = useState<HomeTodo[]>(todos);
  const { deletePost } = useHomeDelete();

  const handleDelete = async (id: string) => {
    const previousTodos = todosList;

    setTodosList((prev) => prev.filter((todo) => todo.cca3 !== id));

    try {
      await deletePost(id);
    } catch {
      setTodosList(previousTodos);
    }
  };

  if (todosList.length === 0) {
    return <p className="p-5">No todos available.</p>;
  }

  return (
    <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      {todosList.map((country) => {
        const flagImageSrc = country.flags?.svg || country.flags?.png;
        const coatOfArmsSrc =
          country.coatOfArms?.svg || country.coatOfArms?.png;
        const capitals = country.capital?.length
          ? country.capital.join(", ")
          : "N/A";
        const currencies = country.currencies
          ? Object.entries(country.currencies).map(([code, value]) => ({
              code,
              name: value.name,
              symbol: value.symbol,
            }))
          : [];
        const languages = country.languages
          ? Object.values(country.languages)
          : [];
        const nativeNames = country.name.nativeName
          ? Object.values(country.name.nativeName).map((entry) => entry.common)
          : [];
        const translationSamples = country.translations
          ? Object.entries(country.translations).slice(0, 4)
          : [];

        return (
          <article
            key={country.cca3}
            className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  <span className="mr-2 text-2xl">{country.flag}</span>
                  {country.name.common}
                </h2>
                <p className="text-sm text-slate-600">
                  {country.name.official}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                {country.region}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="mb-1 text-xs text-slate-500">Flag Image</p>
                {flagImageSrc ? (
                  <Image
                    src={flagImageSrc}
                    alt={country.flags?.alt || `${country.name.common} flag`}
                    width={320}
                    height={56}
                    className="h-14 w-full rounded-md object-cover"
                  />
                ) : (
                  <p className="text-xs text-slate-500">No image</p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="mb-1 text-xs text-slate-500">Coat of Arms</p>
                {coatOfArmsSrc ? (
                  <Image
                    src={coatOfArmsSrc}
                    alt={`${country.name.common} coat of arms`}
                    width={320}
                    height={56}
                    className="h-14 w-full rounded-md object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-500">No image</p>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Capital</p>
                <p className="font-medium text-slate-900">{capitals}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Population</p>
                <p className="font-medium text-slate-900">
                  {country.population.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Languages
              </p>
              <div className="flex flex-wrap gap-1">
                {languages.length > 0 ? (
                  languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-900"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">N/A</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Currencies
              </p>
              <ul className="space-y-1 text-sm">
                {currencies.length > 0 ? (
                  currencies.map((currency) => (
                    <li
                      key={currency.code}
                      className="rounded-lg bg-emerald-50 p-2"
                    >
                      <span className="font-semibold text-emerald-900">
                        {currency.code}
                      </span>{" "}
                      <span className="text-slate-800">{currency.name}</span>
                      {currency.symbol ? (
                        <span className="ml-1 text-slate-600">
                          ({currency.symbol})
                        </span>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">N/A</li>
                )}
              </ul>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Native Names
              </p>
              <p className="text-sm text-slate-800">
                {nativeNames.length > 0 ? nativeNames.join(" • ") : "N/A"}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                Translation Samples
              </p>
              <div className="space-y-1 text-xs">
                {translationSamples.length > 0 ? (
                  translationSamples.map(([languageCode, translation]) => (
                    <p key={languageCode} className="text-slate-700">
                      <span className="font-semibold uppercase">
                        {languageCode}:
                      </span>{" "}
                      {translation.common}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500">N/A</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {country.maps?.googleMaps ? (
                <a
                  href={country.maps.googleMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-slate-900 px-3 py-1 text-white"
                >
                  Google Maps
                </a>
              ) : null}
              {country.maps?.openStreetMaps ? (
                <a
                  href={country.maps.openStreetMaps}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700"
                >
                  OpenStreetMap
                </a>
              ) : null}
            </div>

            <button
              onClick={() => {
                void handleDelete(country.cca3);
              }}
              className="mt-4 rounded-lg bg-red-500 px-3 py-1 text-xs text-white"
            >
              Delete
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default HomePageList;
