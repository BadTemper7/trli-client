/** Calendar dates touched in Asia/Manila, inclusive. Not 24-hour rounding. */
export function calendarStorageDays(gateInAt, gateOutAt = new Date()) {
  if (!gateInAt) return 0;
  const start = new Date(gateInAt);
  const end = new Date(gateOutAt);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) return 0;
  const day = date => Math.floor((date.getTime() + 8 * 60 * 60 * 1000) / 86400000);
  return day(end) - day(start) + 1;
}
