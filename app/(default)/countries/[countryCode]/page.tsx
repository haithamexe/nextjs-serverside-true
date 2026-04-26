import CountryDetail from "./_components/CountryDetail";

export default async function CountryPage({
  params,
}: {
  params: Promise<{ countryCode: string }>;
}) {
  const { countryCode } = await params;

  return <CountryDetail countryCode={countryCode} />;
}
