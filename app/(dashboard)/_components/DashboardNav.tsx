import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardNav() {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
