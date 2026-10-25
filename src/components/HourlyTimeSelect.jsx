import {useEffect,useState} from 'react';
import {hourOptions,hourIsAvailable,firstAvailableDate} from '../utils/hourlySchedule';

// Refresh the available options while the form is open (including across midnight).
export function useCurrentMinute(){
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const id=setInterval(()=>setNow(new Date()),15000);return ()=>clearInterval(id)},[]);
  return now;
}
export default function HourlyTimeSelect({date,value,onChange,id,required=false,now:providedNow}){
  const liveNow=useCurrentMinute();
  const now=providedNow||liveNow;
  const available=hourOptions.filter(option=>hourIsAvailable(date,option.value,now));
  return <select id={id} required={required} value={available.some(option=>option.value===value)?value:''} onChange={e=>onChange(e.target.value)} disabled={!date||!available.length} aria-label="Available hourly time slot">
    <option value="">{!date?'Select date first':available.length?'Select available hour':'No hours remaining; select another date'}</option>
    {hourOptions.map(option=><option key={option.value} value={option.value} disabled={!hourIsAvailable(date,option.value,now)}>{option.label}</option>)}
  </select>;
}
export {firstAvailableDate,hourIsAvailable};
