import { CheckCircle2, Container, Truck } from "lucide-react";

export default function About() {
  return (
    <main>
      <section className="bg-[#071a30] text-white">
        <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-red-400">About us</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">Trans Roadway Logistics Inc.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">A logistics-focused operation built around organized client coordination, container movement, booking visibility, and terminal workflow support.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1480px] gap-8 px-5 py-20 sm:px-8 lg:grid-cols-3 lg:px-10">
        {[
          [Truck, "Reliable movement", "Structured coordination for transport and terminal activities."],
          [Container, "Container visibility", "Clear information for bookings, storage, and operational status."],
          [CheckCircle2, "Client-first workflow", "A digital client portal designed to make business processes easier to follow."],
        ].map(([Icon, title, text]) => (
          <article key={title} className="rounded-[24px] border border-slate-200 p-7">
            <Icon size={25} className="text-[#1d4f91]" />
            <h2 className="mt-5 text-xl font-extrabold text-[#07111f]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
