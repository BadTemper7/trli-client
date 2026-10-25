import { ArrowLeft, ArrowRight } from "lucide-react";

export default function HeroSliderControls({ current = 1, total = 1, onPrevious, onNext }) {
  const progress = total > 0 ? Math.max(10, (current / total) * 100) : 100;

  return (
    <div className="absolute bottom-0 right-0 z-20 hidden items-center gap-4 rounded-tl-[30px] bg-white px-5 py-4 text-[#07111f] sm:flex lg:px-6 lg:py-5">
      <button
        type="button"
        aria-label="Previous slide"
        onClick={onPrevious}
        className="grid h-10 w-10 place-items-center rounded-full bg-black text-white transition hover:scale-105"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={onNext}
        className="grid h-10 w-10 place-items-center rounded-full bg-black text-white transition hover:scale-105"
      >
        <ArrowRight size={18} />
      </button>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 lg:w-36">
        <div
          className="h-full rounded-full bg-[#ff111c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="min-w-9 text-right text-2xl font-medium tabular-nums">
        {String(current).padStart(2, "0")}
      </span>
    </div>
  );
}
