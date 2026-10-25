import { ArrowRight, Boxes, ChevronRight, Clock3, Container } from "lucide-react";
import { Link } from "react-router-dom";

export default function OverviewMetrics({ bookings = [] }) {
  const active = bookings.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)).length;
  const yard = bookings.filter((item) => ["GATED_IN", "INVENTORY", "STORED"].includes(item.status) || ["GATE_IN", "INVENTORY", "STORAGE"].includes(item.workflowStage)).length;
  const pending = bookings.filter((item) => ["DRAFT", "SUBMITTED"].includes(item.status)).length;
  const stats = [
    { label: "Active Bookings", value: active, Icon: Container, cls: "border-brand-100 bg-gradient-to-br from-brand-50 to-white text-brand-700" },
    { label: "Containers In Yard", value: yard, Icon: Boxes, cls: "border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-700" },
    { label: "Pending Approvals", value: pending, Icon: Clock3, cls: "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-700" },
  ];
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-[-.02em] text-foreground">Container Overview</h2>
        <Link to="/portal/pre-advice" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-600">See all <ArrowRight className="size-4" /></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, Icon, cls }) => (
          <Link key={label} to="/portal/pre-advice" className={`group flex min-h-[118px] items-center gap-4 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cls}`}>
            <span className="grid size-11 place-items-center rounded-2xl bg-white/75 shadow-sm"><Icon className="size-6" /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-3xl font-extrabold tracking-[-.04em] text-foreground">{value}</strong>
              <span className="mt-1 block text-xs font-bold text-muted-foreground">{label}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
