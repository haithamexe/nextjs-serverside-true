import DashboardNav from "./DashboardNav";

export default function DashboardSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-gray-50">
      <div className="p-4 text-sm font-semibold text-gray-700">Dashboard</div>
      <DashboardNav />
    </aside>
  );
}
