import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroContent() {
  return (
    <div id="about" className="max-w-[720px] text-white">
      <h1 className="text-[clamp(2.65rem,5vw,5.15rem)] font-extrabold leading-[1.02] tracking-[-0.04em] drop-shadow-[0_4px_18px_rgba(0,0,0,0.22)]">
        Moving Business Forward.
        <br />
        Reliable Delivery <span className="text-[#ff111c]">Nationwide.</span>
      </h1>
      <p className="mt-6 max-w-[650px] text-base leading-relaxed text-white/82 sm:text-lg lg:text-xl xl:text-[22px]">
        Reliable transport and logistics solutions designed for safe, efficient, and on-time
        deliveries across the Philippines.
      </p>
      <Link
        to="/services"
        className="group mt-7 inline-flex items-center gap-6 rounded-2xl bg-white px-6 py-3.5 font-bold text-[#07111f] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
      >
        View Our Services
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#07111f] text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight size={16} strokeWidth={2.5} />
        </span>
      </Link>
    </div>
  );
}
