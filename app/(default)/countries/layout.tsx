export default function CountriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav className="border-b px-5 py-2 text-sm text-gray-500">
        Countries &rsaquo;
      </nav>
      {children}
    </section>
  );
}
