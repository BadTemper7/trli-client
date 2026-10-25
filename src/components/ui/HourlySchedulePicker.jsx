import { useEffect, useMemo } from "react";
import { Clock3 } from "lucide-react";

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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(`2020-01-01T${value}:00Z`));
  return { value, label };
}

export function getHourlySlotState(selectedDate) {
  const today = todayKey();
  const nowHour = currentHour();
  const isPast = Boolean(selectedDate) && selectedDate < today;
  const isToday = selectedDate === today;

  const slots = Array.from({ length: 24 }, (_, hour) => {
    const slot = formatHour(hour);
    return {
      ...slot,
      disabled: !selectedDate || isPast || (isToday && hour <= nowHour),
    };
  });

  return { today, nowHour, isPast, isToday, slots };
}

export default function HourlySchedulePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Scheduled Date",
  timeLabel = "Scheduled Time",
  disabled = false,
  required = false,
}) {
  const state = useMemo(() => getHourlySlotState(date), [date]);
  const availableSlots = state.slots.filter((slot) => !slot.disabled);

  useEffect(() => {
    if (!time) return;
    const selected = state.slots.find((slot) => slot.value === time);
    if (!selected || selected.disabled) onTimeChange("");
  }, [date, time, state.slots, onTimeChange]);

  const helper = !date
    ? "Select a date first to see available 1-hour slots."
    : state.isPast
      ? "Past dates are not available."
      : state.isToday && availableSlots.length === 0
        ? "No time slots remain today. Please select a future date."
        : state.isToday
          ? "For today, only the next full hour and later can be selected."
          : "Times are available in 1-hour intervals.";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          {dateLabel}{required ? " *" : ""}
        </label>
        <input
          type="date"
          className="input"
          min={state.today}
          value={date || ""}
          onChange={(event) => onDateChange(event.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          {timeLabel}{required ? " *" : ""}
        </label>
        <div className="relative">
          <select
            className="input appearance-none pr-11"
            value={time || ""}
            onChange={(event) => onTimeChange(event.target.value)}
            disabled={disabled || !date || state.isPast || availableSlots.length === 0}
          >
            <option value="">Select hour</option>
            {state.slots.map((slot) => (
              <option key={slot.value} value={slot.value} disabled={slot.disabled}>
                {slot.label}
              </option>
            ))}
          </select>
          <Clock3
            size={18}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
        <p className={`mt-1.5 text-xs ${state.isPast || (state.isToday && availableSlots.length === 0) ? "text-red-600" : "text-slate-500"}`}>
          {helper}
        </p>
      </div>
    </div>
  );
}
