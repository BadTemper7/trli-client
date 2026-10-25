import { useEffect, useMemo, useState } from "react";
import { Banknote, MapPin, PackageCheck, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import TableSkeleton from "../../components/ui/TableSkeleton";

const classificationOptions = ["ALL", "LOCAL", "INTERNATIONAL"];
const loadOptions = ["ALL", "EMPTY", "LOADED"];

const money = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const label = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function Rates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classification, setClassification] = useState("ALL");
  const [loadStatus, setLoadStatus] = useState("ALL");

  const loadRates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/rates");
      setRates(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rates right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const filtered = useMemo(
    () =>
      rates.filter((rate) => {
        if (classification !== "ALL" && rate.classification !== classification) return false;
        if (loadStatus !== "ALL" && rate.loadStatus !== loadStatus) return false;
        return true;
      }),
    [rates, classification, loadStatus],
  );

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const rate of filtered) {
      const key = rate.name || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(rate);
    }
    return [...groups.entries()];
  }, [filtered]);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-background">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-red">Rate Schedule</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-brand-ink sm:text-5xl">
              Current Container Rates
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Review the active rates configured by Trans Roadway Logistics Inc. Rates are organized by transaction classification, load status, container size, and collection point.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-4 rounded-[22px] border border-border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {classificationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setClassification(option)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  classification === option
                    ? "bg-brand-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-brand-ink"
                }`}
              >
                {option === "ALL" ? "All Classifications" : label(option)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {loadOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLoadStatus(option)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  loadStatus === option
                    ? "bg-brand-red text-white"
                    : "bg-muted text-muted-foreground hover:text-brand-ink"
                }`}
              >
                {option === "ALL" ? "All Load Status" : label(option)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8"><TableSkeleton rows={6} columns={5} /></div>
        ) : error ? (
          <div className="mt-8 rounded-[22px] border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-bold text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadRates}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-4 py-2.5 font-bold text-white"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : grouped.length === 0 ? (
          <div className="mt-8 rounded-[22px] border border-dashed border-border bg-white p-12 text-center">
            <Banknote className="mx-auto text-muted-foreground" size={34} />
            <h2 className="mt-4 text-xl font-extrabold text-brand-ink">No active rates found</h2>
            <p className="mt-2 text-sm text-muted-foreground">There are no rates matching the selected filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            {grouped.map(([name, rows]) => (
              <section key={name} className="overflow-hidden rounded-[24px] border border-border bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-border bg-muted px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-red">Rate Name</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-brand-ink">{name}</h2>
                  </div>
                  <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground ring-1 ring-inset ring-border">
                    {rows.length} {rows.length === 1 ? "rate" : "rates"}
                  </span>
                </div>

                <div className="hidden grid-cols-[1.1fr_1fr_0.8fr_1fr_1fr] gap-4 border-b border-border px-6 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground md:grid">
                  <span>Classification</span>
                  <span>Load Status</span>
                  <span>Container</span>
                  <span>Amount</span>
                  <span>Collection</span>
                </div>

                <div className="divide-y divide-border">
                  {rows.map((rate) => (
                    <article
                      key={rate.id}
                      className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_1fr_0.8fr_1fr_1fr] md:items-center"
                    >
                      <div>
                        <span className="md:hidden text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Classification</span>
                        <p className="mt-1 font-bold text-brand-ink md:mt-0">{label(rate.classification)}</p>
                      </div>
                      <div>
                        <span className="md:hidden text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Load Status</span>
                        <p className="mt-1 font-semibold text-brand-ink md:mt-0">{label(rate.loadStatus)}</p>
                      </div>
                      <div>
                        <span className="md:hidden text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Container</span>
                        <p className="mt-1 font-semibold text-brand-ink md:mt-0">{rate.containerSize === "ALL" ? "All Sizes" : rate.containerSize}</p>
                      </div>
                      <div>
                        <span className="md:hidden text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Amount</span>
                        <p className="mt-1 text-lg font-extrabold text-brand-600 md:mt-0">{money.format(Number(rate.amount || 0))}</p>
                      </div>
                      <div>
                        <span className="md:hidden text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Collection</span>
                        <div className="mt-1 flex items-center gap-2 font-semibold text-brand-ink md:mt-0">
                          <MapPin size={16} className="text-brand-red" />
                          {rate.collectionPoint === "GATE_IN" ? "Gate-in" : "Gate-out"}
                        </div>
                      </div>
                      {rate.description && (
                        <p className="text-sm leading-6 text-muted-foreground md:col-span-5">
                          {rate.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {!loading && !error && rates.length > 0 && (
          <div className="mt-8 flex items-start gap-3 rounded-[20px] border border-border bg-white p-5 text-sm leading-6 text-muted-foreground">
            <PackageCheck className="mt-0.5 shrink-0 text-brand-600" size={20} />
            <p>
              Only currently active rates are displayed here. Final charges are based on the applicable transaction details and the configured collection point.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
