import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const dateLabel = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(d);
};

export default function RecentActivity({ bookings = [] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-extrabold tracking-[-.02em] text-foreground">Recent Activity</h2><Link to="/portal/pre-advice" className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">See all <ArrowRight className="size-4" /></Link></div>
      <div className="overflow-hidden rounded-xl border border-border">
        {bookings.length ? bookings.slice(0, 5).map((item) => (
          <Link key={item._id} to={`/portal/pre-advice/${item._id}`} className="flex min-h-[72px] items-center gap-3 border-b border-border px-3 py-3 last:border-b-0 hover:bg-muted/60">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><FileText className="size-5" /></span>
            <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-foreground">{item.status?.replaceAll("_", " ") || "Booking updated"}</strong><small className="mt-1 block truncate text-xs text-muted-foreground">{item.bookingReference} · {item.containerNumber}</small></span>
            <span className="hidden text-xs text-muted-foreground sm:block">{dateLabel(item.updatedAt || item.createdAt)}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        )) : <div className="px-5 py-10 text-center text-sm text-muted-foreground">No booking activity yet.</div>}
      </div>
    </section>
  );
}
