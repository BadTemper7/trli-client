import { ArrowRight, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { bookingNextAction } from "../../lib/bookingJourney";

export default function QuickReview({ booking }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div><h2 className="text-lg font-extrabold tracking-[-.02em] text-foreground">Quick Review</h2><p className="mt-1 text-xs text-muted-foreground">Your latest container</p></div>
      {booking ? (
        <>
          <div className="mt-4 overflow-hidden rounded-xl bg-brand-700">
            <div className="relative h-28"><img src="/assets/home-hero.webp" alt="Container logistics" className="h-full w-full object-cover object-[center_58%] opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 to-transparent" /><div className="absolute bottom-3 left-3 text-white"><strong className="block text-lg font-extrabold">{booking.containerNumber}</strong><span className="text-xs text-white/75">{booking.containerSize} · {booking.containerType}</span></div></div>
          </div>
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border px-3">
            {[["Booking Reference", booking.bookingReference], ["Status", booking.status?.replaceAll("_", " ")], ["Shipping Line", booking.shippingLine], ["Storage Position", booking.storage?.block?.name ? `${booking.storage.block.name} / B${booking.storage.bay}-R${booking.storage.row}-T${booking.storage.tier}` : "Not assigned"]].map(([label, value]) => <div key={label} className="grid grid-cols-[42%_1fr] gap-3 py-2.5 text-xs"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-bold text-foreground">{value || "—"}</dd></div>)}
          </dl>
          <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3 text-xs"><p className="font-extrabold text-brand-700">Next step: {bookingNextAction(booking).title}</p><p className="mt-1 text-muted-foreground">Responsible: {bookingNextAction(booking).owner}</p></div>
          <Link to={`/portal/pre-advice/${booking._id}`} className="btn btn-primary mt-4 w-full">View Container Details <ArrowRight className="size-4" /></Link>
        </>
      ) : (
        <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-5 text-center"><PackageSearch className="size-8 text-brand-600" /><strong className="mt-3 text-sm">No container to review</strong><span className="mt-1 text-xs text-muted-foreground">Your latest booking will appear here.</span><Link to="/portal/pre-advice/new" className="mt-4 text-xs font-bold text-brand-700">Create booking <ArrowRight className="inline size-3" /></Link></div>
      )}
    </section>
  );
}
