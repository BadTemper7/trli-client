import { ArrowRight, CalendarClock, Container, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function PortalHero({ verificationStatus = "PENDING" }) {
  const verified = verificationStatus === "VERIFIED";
  return (
    <section className="relative isolate min-h-[300px] overflow-hidden rounded-2xl border border-brand-100 bg-brand-700">
      <img src="/assets/home-hero.webp" alt="Container logistics operations" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,10,76,.96)_0%,rgba(48,11,196,.84)_38%,rgba(48,11,196,.18)_72%,rgba(0,0,0,.04)_100%)]" />
      <div className="relative z-10 flex min-h-[300px] max-w-[620px] flex-col justify-center p-7 text-white sm:p-9">
        <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] backdrop-blur-sm">
          <ShieldCheck className="size-4" /> Client Operations
        </span>
        <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl lg:text-5xl">Your containers, <span className="text-red-300">one clear view.</span></h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">Manage bookings, schedules, container progress, and yard updates from your Trans Roadway client portal.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {verified ? (
            <Link to="/portal/pre-advice/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50">New Booking <ArrowRight className="size-4" /></Link>
          ) : (
            <Link to="/portal/company" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-brand-700">Verification Status <ArrowRight className="size-4" /></Link>
          )}
          <Link to="/portal/pre-advice" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/15"><Container className="size-4" /> My Bookings</Link>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-white/70">
          <span className="inline-flex items-center gap-2"><CalendarClock className="size-4 text-red-300" /> Hourly gate scheduling</span>
          <span className="inline-flex items-center gap-2"><Container className="size-4 text-red-300" /> Live container progress</span>
        </div>
      </div>
    </section>
  );
}
