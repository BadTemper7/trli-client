import { ArrowRight, ArrowUpFromLine, ArrowDownToLine, Container, ShieldCheck, Truck, UsersRound, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

const services = [
  { title: "Lift On", text: "Container lifting and handling for outbound movement.", Icon: ArrowUpFromLine },
  { title: "Lift Off", text: "Efficient unloading and yard placement for arriving containers.", Icon: ArrowDownToLine },
  { title: "Container Storage", text: "Organized yard storage with operational visibility.", Icon: Warehouse },
];

const money = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(Number(value || 0));

export default function Home() {
  const [rates, setRates] = useState([]);
  useEffect(() => {
    let active = true;
    api.get("/rates").then((response) => { if (active) setRates(response.data?.data?.items || response.data?.data?.rates || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <main className="bg-background">
      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-border bg-white lg:min-h-[660px]">
        <img src="/assets/home-hero.webp" alt="Trans Roadway logistics terminal" className="absolute inset-0 h-full w-full object-cover object-[68%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.98)_0%,rgba(255,255,255,.95)_27%,rgba(255,255,255,.64)_45%,rgba(255,255,255,.08)_75%,rgba(255,255,255,0)_100%)]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1480px] items-center px-5 py-16 sm:px-8 lg:min-h-[660px] lg:px-10">
          <div className="max-w-[650px]">
            <span className="text-xs font-extrabold uppercase tracking-[.2em] text-brand-700">Trans Roadway Logistics Inc.</span>
            <h1 className="mt-4 text-5xl font-extrabold leading-[.96] tracking-[-.055em] text-foreground sm:text-6xl lg:text-7xl">One yard.<br /><span className="text-brand-600">One clear view.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Smarter container handling, storage, and client booking tools for businesses that keep moving.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/services" className="btn btn-primary !rounded-full !px-6">Explore Services <ArrowRight className="size-4" /></Link><Link to="/rates" className="btn btn-secondary !rounded-full !px-6">View Rates</Link></div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-border pt-5">
              {[[Container, "Container", "Handling"], [Warehouse, "Secure", "Storage"], [Truck, "Reliable", "Logistics"]].map(([Icon, top, bottom]) => <div key={top} className="flex items-center gap-2 text-xs font-bold text-foreground"><Icon className="size-5 text-brand-600" /><span>{top}<br /><span className="text-muted-foreground">{bottom}</span></span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-danger-600">// About us</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-.045em] text-foreground sm:text-5xl">Moving businesses forward through <span className="text-brand-600">smarter logistics.</span></h2></div>
        <div><p className="text-base leading-8 text-muted-foreground">Trans Roadway Logistics Inc. combines reliable container handling and yard operations with a client portal for booking, verification, schedules, and container progress.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[Container,"Container","Handling"],[Warehouse,"Yard","Operations"],[ShieldCheck,"Secure","Storage"],[UsersRound,"Client","Support"]].map(([Icon,a,b])=><div key={a} className="rounded-2xl border border-border bg-surface p-4 shadow-sm"><Icon className="size-5 text-brand-600"/><strong className="mt-3 block text-sm">{a}<br/>{b}</strong></div>)}</div></div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-danger-600">// Our services</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-.045em] text-foreground sm:text-5xl">Everything your container needs, <span className="text-brand-600">in one place.</span></h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{services.map(({title,text,Icon}, index)=><Link key={title} to="/services" className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-border shadow-sm"><img src="/assets/home-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{objectPosition:`${45+index*12}% center`}}/><div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(23,14,57,.96),rgba(48,11,196,.30)_55%,transparent)]"/><div className="absolute inset-x-0 bottom-0 p-6 text-white"><Icon className="size-7"/><h3 className="mt-4 text-2xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/75">{text}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1"/></span></div></Link>)}</div>
        </div>
      </section>

      <section className="section grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-brand-700">// Our rates</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-.045em] text-foreground sm:text-5xl">Clear rates for <span className="text-brand-600">every container.</span></h2><p className="mt-4 max-w-lg leading-7 text-muted-foreground">Active rates configured by our operations team are published directly to the client site.</p><Link to="/rates" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand-700">Explore all rates <ArrowRight className="size-4"/></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{(rates.length ? rates.slice(0,6) : [{name:"Lift On"},{name:"Lift Off"},{name:"Storage"}]).map((rate,index)=><div key={rate._id || `${rate.name}-${index}`} className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{rate.classification || "Rate"}</span><h3 className="mt-1 text-lg font-extrabold text-foreground">{rate.name}</h3></div><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-brand-700">{rate.containerSize || ""}</span></div>{rate.amount != null && <p className="mt-5 text-2xl font-extrabold text-brand-700">{money(rate.amount)}</p>}<p className="mt-2 text-xs text-muted-foreground">{[rate.loadStatus,rate.collectAt].filter(Boolean).join(" · ") || "View full rate details"}</p></div>)}</div>
      </section>

      <section className="border-t border-border bg-brand-700 text-white"><div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-9 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10"><div><strong className="text-xl">One yard. One connected platform.</strong><p className="mt-1 text-sm text-white/70">Register your company to manage bookings and container progress online.</p></div><Link to="/register" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-brand-700">Create account <ArrowRight className="size-4"/></Link></div></section>
    </main>
  );
}
