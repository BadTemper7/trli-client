// Shared dark page intro with a subtle "route line" motif.
export default function PageHero({ title, text, children }) {
  return (
    <section className="px-2.5 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[30px] bg-[#0B1F36] text-white">
        <svg aria-hidden className="absolute inset-0 -z-10 h-full w-full opacity-[0.18]" preserveAspectRatio="none" viewBox="0 0 1200 320">
          <path d="M-20 260 C 220 260, 260 90, 520 120 S 860 250, 1220 60" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 10" strokeLinecap="round" />
          <path d="M-20 300 C 260 300, 380 170, 640 190 S 980 280, 1220 150" fill="none" stroke="#E11D2A" strokeWidth="2" strokeDasharray="3 10" strokeLinecap="round" />
        </svg>
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-[#174A7E]/50 blur-3xl" />
        <div className="mx-auto max-w-[1480px] px-6 pb-14 pt-10 sm:px-10 lg:px-12 lg:pb-20">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">{text}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
