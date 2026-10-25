// Hourly local-time scheduling shared by Gate-In and Gate-Out.
export const localDateString = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const isFullHour = value => /^(?:[01]\d|2[0-3]):00$/.test(value);
export const hourOptions = Array.from({length:24}, (_,hour) => ({value:`${String(hour).padStart(2,'0')}:00`,label:new Date(2020,0,1,hour).toLocaleTimeString('en-PH',{hour:'numeric',minute:'2-digit',hour12:true})}));
export function hourIsAvailable(date, time, now = new Date()) {
  if (!date || !isFullHour(time)) return false;
  const candidate = new Date(`${date}T${time}:00`);
  return !Number.isNaN(candidate.getTime()) && candidate.getTime() >= now.getTime();
}
export function hasAvailableHour(date, now = new Date()) {
  return hourOptions.some(option => hourIsAvailable(date, option.value, now));
}
export function firstAvailableDate(now = new Date()) {
  if (hasAvailableHour(localDateString(now), now)) return localDateString(now);
  const tomorrow = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  return localDateString(tomorrow);
}
export function nextHourlySlot(now = new Date()) {
  const date = firstAvailableDate(now);
  return {date, time:hourOptions.find(option => hourIsAvailable(date,option.value,now))?.value || '00:00'};
}
