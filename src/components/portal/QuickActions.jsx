import { ArrowRight, FilePlus2, ListChecks, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { title: "New Container Booking", text: "Create a new booking with container and gate schedule details.", to: "/portal/pre-advice/new", Icon: FilePlus2, pos: "center 58%" },
  { title: "My Bookings", text: "Review booking status, container progress, and updates.", to: "/portal/pre-advice", Icon: ListChecks, pos: "center 46%" },
  { title: "Payments & Receipts", text: "Check invoices, submit payment proof and download receipts.", to: "/portal/invoices", Icon: MapPinned, pos: "center 63%" },
];

export default function QuickActions({ canCreate = true }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-extrabold tracking-[-.02em] text-foreground">Quick Actions</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((item, index) => {
          const disabled = index === 0 && !canCreate;
          const content = (
            <>
              <img src="/assets/home-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: item.pos }} />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(21,12,55,.96)_0%,rgba(48,11,196,.55)_48%,rgba(48,11,196,.06)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 text-white">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm"><item.Icon className="size-5" /></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm font-extrabold">{item.title}</strong><small className="mt-1 block text-[11px] leading-4 text-white/70">{disabled ? "Available after company verification." : item.text}</small></span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/25"><ArrowRight className="size-4" /></span>
              </div>
            </>
          );
          return disabled ? <div key={item.title} className="relative min-h-[160px] overflow-hidden rounded-2xl opacity-70">{content}</div> : <Link key={item.title} to={item.to} className="relative min-h-[160px] overflow-hidden rounded-2xl border border-border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">{content}</Link>;
        })}
      </div>
    </section>
  );
}
