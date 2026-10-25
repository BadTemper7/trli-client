import HeroContent from "./HeroContent";
import HeroStats from "./HeroStats";

export default function HeroSection() {
  return (
    <section className="bg-background p-3 sm:p-4 lg:p-5" aria-label="Trans Roadway Logistics Inc. hero">
      <div className="relative isolate min-h-[640px] overflow-hidden rounded-[28px] border border-border bg-[#020b1a] lg:min-h-[720px]">
        <div className="absolute inset-0 bg-cover bg-[72%_center] bg-no-repeat lg:bg-center" style={{ backgroundImage: "url(/assets/home-hero.webp)" }} aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,12,28,.96)_0%,rgba(2,12,28,.80)_36%,rgba(2,12,28,.24)_66%,rgba(2,12,28,.04)_100%)]" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-[640px] max-w-[1600px] flex-col px-7 pb-10 pt-12 sm:px-10 lg:min-h-[720px] lg:px-14 lg:pb-12">
          <div className="my-auto flex items-center py-8"><HeroContent /></div>
          <HeroStats />
        </div>
      </div>
    </section>
  );
}
