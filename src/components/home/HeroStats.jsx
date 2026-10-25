const stats = [
  { title: "Nationwide", description: "Delivery Coverage" },
  { title: "Reliable", description: "Transport Solutions" },
  { title: "Fast", description: "Shipment Processing" },
];

export default function HeroStats() {
  return (
    <div className="flex max-w-3xl flex-wrap items-stretch gap-y-5 text-white sm:flex-nowrap">
      {stats.map((item, index) => (
        <div
          key={item.title}
          className={`min-w-[145px] pr-6 sm:min-w-0 sm:flex-1 sm:px-7 ${
            index === 0 ? "sm:pl-0" : "border-l border-white/30"
          }`}
        >
          <p className="text-xl font-extrabold tracking-tight sm:text-2xl xl:text-[30px]">
            {item.title}
          </p>
          <p className="mt-1 text-sm text-white/75 sm:text-base xl:text-lg">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
