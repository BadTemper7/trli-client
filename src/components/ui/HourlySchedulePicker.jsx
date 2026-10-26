import { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";
import { api } from "../../lib/api";

const TIME_ZONE = "Asia/Manila";

function zonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function todayKey() {
  const p = zonedParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function currentHour() {
  return Number(zonedParts().hour);
}

function formatHour(hour) {
  const value = `${String(hour).padStart(2, "0")}:00`;
  const label = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
  }).format(new Date(`2020-01-01T${value}:00Z`));
  return { value, label };
}

export function getHourlySlotState(selectedDate) {
  const today = todayKey();
  const nowHour = currentHour();
  const isPast = Boolean(selectedDate) && selectedDate < today;
  const isToday = selectedDate === today;
  const slots = Array.from({ length: 24 }, (_, hour) => ({
    ...formatHour(hour),
    disabled: !selectedDate || isPast || (isToday && hour <= nowHour),
  }));
  return { today, nowHour, isPast, isToday, slots };
}

export default function HourlySchedulePicker({
  date, time, onDateChange, onTimeChange,
  dateLabel = "Scheduled Date", timeLabel = "Scheduled Time",
  disabled = false, required = false,
}) {
  const state = useMemo(() => getHourlySlotState(date), [date]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setAvailability(null);
    setError("");
    if (!date || state.isPast) { setLoading(false); return () => { active = false; }; }
    setLoading(true);
    api.get("/pre-advice/availability", { params: { day: date } })
      .then(({ data }) => { if (active) setAvailability(data?.data?.slots ?? []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || "Could not load available slots."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, state.isPast]);

  const availabilityMap = useMemo(() => new Map((availability || []).map((slot) => [slot.hour, slot.remaining])), [availability]);
  const slots = useMemo(() => state.slots.map((slot) => ({
    ...slot,
    remaining: availabilityMap.get(slot.value) || 0,
    disabled: slot.disabled || !availabilityMap.has(slot.value) || (availabilityMap.get(slot.value) || 0) <= 0,
  })), [state.slots, availabilityMap]);
  const availableSlots = slots.filter((slot) => !slot.disabled);

  useEffect(() => {
    if (!time || availability === null || loading || error) return;
    const selected = slots.find((slot) => slot.value === time);
    if (!selected || selected.disabled) onTimeChange("");
  }, [time, availability, loading, error, slots, onTimeChange]);

  const helper = !date ? "Select a date to check available one-hour slots."
    : state.isPast ? "Past dates are not available."
      : loading ? "Checking operational hours and remaining capacity..."
        : error || (availability && availableSlots.length === 0 ? "No slots available on this date. Please choose another day." : "Only open, available one-hour booking slots are shown.");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">{dateLabel}{required ? " *" : ""}</label>
        <input type="date" className="input" min={state.today} value={date || ""}
          onChange={(event) => onDateChange(event.target.value)} disabled={disabled} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">{timeLabel}{required ? " *" : ""}</label>
        <div className="relative">
          <select className="input appearance-none pr-11" value={time || ""}
            onChange={(event) => onTimeChange(event.target.value)}
            disabled={disabled || !date || loading || Boolean(error) || !availability || availableSlots.length === 0}>
            <option value="">{loading ? "Loading slots..." : "Select available hour"}</option>
            {slots.filter((slot) => !slot.disabled).map((slot) => (
              <option key={slot.value} value={slot.value}>{slot.label} ({slot.remaining} left)</option>
            ))}
          </select>
          <Clock3 size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <p className={`mt-1.5 text-xs ${state.isPast || error || (availability && !availableSlots.length) ? "text-red-600" : "text-slate-500"}`}>{helper}</p>
      </div>
    </div>
  );
}
