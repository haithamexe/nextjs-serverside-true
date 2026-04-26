import CountriesContent from "./_components/CountriesContent";

export default async function CountriesPage() {
  return (
    <div className="p-5">
      <h1 className="mb-4 text-2xl font-bold">All Countries</h1>
      <CountriesContent />
    </div>
  );
}
