import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, CreditCard, Loader2, X } from 'lucide-react';
import { api } from '../../lib/api';
import OnlinePaymentMethod from '../payment/OnlinePaymentMethod';
import PaymentProofUpload, { validateProofFile } from '../payment/PaymentProofUpload';
import { calendarStorageDays } from '../../lib/storageDays';

const manilaToday = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map((item) => [item.type,item.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const peso = (value) => new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP'}).format(Number(value || 0));
const showDate = (value) => value ? new Date(value).toLocaleString('en-PH', {timeZone:'Asia/Manila'}) : '—';
const manilaDate = value => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(part=>[part.type,part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const tomorrow = day => new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0,10);
const scheduledInstant = (day,hour) => day && hour ? new Date(`${day}T${hour}:00+08:00`) : null;

export default function GateOutRequest({booking,onClose,onUpdated}) {
  const [date,setDate] = useState('');
  const [time,setTime] = useState('');
  const [slots,setSlots] = useState([]);
  const [quote,setQuote] = useState(null);
  const [optionalCharges,setOptionalCharges] = useState([]);
  const [transactions,setTransactions] = useState(null);
  const [loadingTransactions,setLoadingTransactions] = useState(true);
  const [transactionError,setTransactionError] = useState('');
  const [quoteError,setQuoteError] = useState('');
  const [selectedOptional,setSelectedOptional] = useState([]);
  const [method,setMethod] = useState('');
  const [reference,setReference] = useState('');
  const [proof,setProof] = useState(null);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [loadingSlots,setLoadingSlots] = useState(false);
  const [loadingQuote,setLoadingQuote] = useState(false);

  // The old modal rendered no transactions until the client chose a slot.
  // Load the matching ACTIVE Gate-out rates immediately; the server remains
  // authoritative for quantities, taxes and the final payment amount.
  useEffect(() => {
    let live = true;
    setTransactions(null); setTransactionError(''); setLoadingTransactions(true);
    api.get(`/gate-out/${booking._id}/transactions`)
      .then(response => {
        if (!live) return;
        const data = response.data?.data?.transactions;
        setTransactions(data || {automatic:[],optional:[],hasBaseCharge:false,hasStorageRate:false});
        setOptionalCharges((data?.optional || []).map(item => ({...item, name:item.name})));
      })
      .catch(cause => {
        if (live) setTransactionError(cause.response?.data?.message || 'Unable to retrieve configured Gate-out rates.');
      })
      .finally(() => {if (live) setLoadingTransactions(false);});
    return () => {live=false;};
  }, [booking._id]);

  useEffect(() => {
    if (!date) {setSlots([]);setTime('');setQuote(null);return;}
    let live = true;
    setTime('');setQuote(null);setError('');setLoadingSlots(true);
    api.get('/pre-advice/availability', {params:{day:date}})
      .then((response) => {if(live)setSlots(response.data?.data?.slots || []);})
      .catch((cause) => {if(live){setSlots([]);setError(cause.response?.data?.message || 'Unable to load available hours.');}})
      .finally(() => {if(live)setLoadingSlots(false);});
    return () => {live=false;};
  }, [date]);

  useEffect(() => {
    if (!date || !time) {setQuote(null);setQuoteError('');return;}
    let live=true;
    setQuote(null);setLoadingQuote(true);setQuoteError('');
    api.get(`/gate-out/${booking._id}/quote`, {params:{date,time,optionalRateIds:selectedOptional.join(',')}})
      .then((response) => {if(live){setQuote(response.data?.data?.quote || null);setOptionalCharges(response.data?.data?.optionalCharges || []);}})
      .catch((cause) => {if(live){setQuote(null);setQuoteError(cause.response?.data?.message || 'Unable to calculate Gate-out billing. Check configured rates and try another time slot.');}})
      .finally(() => {if(live)setLoadingQuote(false);});
    return () => {live=false;};
  }, [booking._id,date,time,selectedOptional]);

  const actualGateIn = booking.gateIn?.actualGateInAt ? new Date(booking.gateIn.actualGateInAt) : null;
  const actualGateInDay = actualGateIn ? manilaDate(actualGateIn) : '';
  const earliestDate = [manilaToday(),actualGateInDay].sort().at(-1);
  const nextMidnight = actualGateInDay ? tomorrow(actualGateInDay) : '';
  const isAfterArrival = (day,hour) => {
    const when=scheduledInstant(day,hour);
    return Boolean(when && Number.isFinite(when.getTime()) && actualGateIn && when > actualGateIn);
  };
  const validSlot = slots.some((slot) => slot.hour === time && slot.remaining > 0 && isAfterArrival(date,time));
  const scheduledStorageDays = date && time && validSlot ? calendarStorageDays(actualGateIn,scheduledInstant(date,time)) : null;
  const canSubmit = Boolean(!busy && !loadingQuote && quote && method && (reference.trim() || proof) && validSlot && !validateProofFile(proof));
  const days = calendarStorageDays(booking.gateIn?.actualGateInAt);
  const bookingDetails = [
    ['Booking reference',booking.bookingReference],
    ['Container',booking.containerNumber],
    ['Type and size',`${booking.containerType || '—'} · ${booking.containerSize || '—'}`],
    ['Actual gate-in',showDate(booking.gateIn?.actualGateInAt)],
    ['Days in storage (so far)',days],
    ['Storage location',[booking.storage?.block?.name || booking.storage?.block,booking.storage?.bay,booking.storage?.row,booking.storage?.tier].filter((item)=>item!==null&&item!==undefined).join(' / ') || '—'],
    ['Truck plate',booking.truckPlateNumber],
    ['Driver name',booking.driverName],
    ...(booking.driverContactNumber || booking.driverContact ? [['Driver contact',booking.driverContactNumber || booking.driverContact]] : []),
    ['Driver licence',booking.driverLicenceNumber],
    ['Hauler',booking.hauler],
    ['Shipping line',booking.shippingLine],
  ];

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);setError('');
    try {
      const form = new FormData();
      form.append('scheduledDate',date);form.append('scheduledTime',time);
      form.append('method',method);form.append('reference',reference.trim());
      form.append('amount',String(quote.total));form.append('optionalRateIds',JSON.stringify(selectedOptional));if(proof)form.append('proof',proof);
      await api.post(`/gate-out/${booking._id}/request`,form);
      await onUpdated?.();
      onClose?.();
    } catch (cause) {setError(cause.response?.data?.message || 'Submission failed. Please try again.');}
    finally {setBusy(false);}
  };

  return <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onMouseDown={(event)=>{if(event.target===event.currentTarget&&!busy)onClose?.();}}>
    <section role="dialog" aria-modal="true" aria-label="Request gate-out" className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface p-5 shadow-xl sm:p-7">
      <header className="mb-5 flex items-start justify-between gap-3 border-b pb-4">
        <div><h2 className="text-xl font-extrabold">Request Gate-out & Payment</h2><p className="mt-1 text-sm text-muted-foreground">Schedule a release and provide a payment reference or proof. Your original booking and driver details are reused.</p></div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close gate-out modal" className="rounded-lg border p-2"><X size={18}/></button>
      </header>
      <div className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">{bookingDetails.map(([label,value])=><div key={label}><span className="block text-xs text-muted-foreground">{label}</span><strong className="break-words">{String(value || '—')}</strong></div>)}</div>
      <form onSubmit={submit} className="mt-6 space-y-5">
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 font-extrabold"><CalendarClock size={18}/> Gate-out Schedule</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">Requested date<input required type="date" min={earliestDate} value={date} onChange={(event)=>setDate(event.target.value)} className="input mt-1 w-full" disabled={busy}/></label>
            <label className="block text-sm">Available time<select required className="input mt-1 w-full" value={time} disabled={busy||loadingSlots||!date} onChange={(event)=>setTime(event.target.value)}>
              <option value="">{loadingSlots?'Checking available hours…':'Select available hour'}</option>
              {slots.map((slot)=><option key={slot.hour} value={slot.hour} disabled={slot.remaining===0 || !isAfterArrival(date,slot.hour)}>{slot.hour} ({slot.remaining ? `${slot.remaining} available` : 'Full'})</option>)}
            </select></label>
          </div>
          {!!date && !loadingSlots && slots.length===0 && <p role="status" className="text-sm text-amber-700">No available hours on the selected date. Select another day.</p>}
          <p className="text-xs text-muted-foreground">Terminal operating schedule: 24 hours daily when enabled in Admin Settings. Only future available hourly slots can be selected. Asia/Manila time.</p>
          {actualGateInDay && <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">Midnight is the <strong>start</strong> of the selected date. To Gate-out at midnight <strong>after</strong> your Gate-in on {actualGateInDay}, select <strong>{nextMidnight} at 00:00</strong>. Both dates count toward storage billing.</p>}
          {date && time && !isAfterArrival(date,time) && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Gate-out must be later than actual physical Gate-in. Select the correct following date for midnight.</p>}
          {scheduledStorageDays != null && <p className="text-sm font-semibold">Estimated storage: {scheduledStorageDays} inclusive Manila calendar day(s) for the selected Gate-out time.</p>}
        </section>
        <section className="space-y-3" aria-label="Gate-out transactions and billing">
          <h3 className="font-extrabold">Gate-out Transactions & Billing</h3>
          <p className="text-xs text-muted-foreground">The transactions below are read from the terminal's active Gate-out rates for this container. Storage is billed per Asia/Manila calendar date, including Gate-in and Gate-out dates. A stay crossing midnight counts as two days.</p>
          {loadingTransactions && <p role="status" className="rounded-lg border p-3 text-sm text-muted-foreground">Loading configured Gate-out transactions…</p>}
          {transactionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{transactionError}</p>}
          {!loadingTransactions && transactions && !quote && <div className="rounded-xl border p-4 text-sm" aria-label="Configured Gate-out transactions">
            <h4 className="mb-2 font-bold">Configured transactions (before scheduling)</h4>
            {transactions.automatic?.length ? transactions.automatic.map(item => <div key={item.id} className="flex justify-between gap-3 border-b py-2 last:border-b-0">
              <span>{item.name}<span className="block text-xs text-muted-foreground">{item.basis === 'PER_CALENDAR_DAY' ? 'Per calendar day · quantity calculated at checkout' : item.basis === 'CONDITIONAL_OVERTIME' ? 'Only for scheduled Gate-out during overtime hours' : 'Fixed per transaction'}</span></span>
              <span className="shrink-0 font-bold">{peso(item.amount)}</span>
            </div>) : <p role="status" className="rounded-lg bg-amber-50 p-3 text-amber-800">No fixed Gate-out transaction matches this container. Ask the terminal administrator to configure active Gate-out Handling, Lift On, or Storage rates in Rate Setup.</p>}
            {!!transactions.optional?.length && <p className="mt-3 text-xs text-muted-foreground">{transactions.optional.length} optional transaction(s) can be added below.</p>}
            <p className="mt-3 text-xs text-muted-foreground">These are unit rates, not the payable total. Select your Gate-out date and time to calculate billable storage days, applicable overtime, VAT, and the official amount.</p>
          </div>}
          {!loadingTransactions && transactions && !transactions.hasStorageRate && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">There is no active Storage transaction configured for this container's classification, category, load, and size. An administrator must add the matching Storage rate under Rate Setup → Collect At: Gate-out before payment can be submitted.</p>}
          <p className="text-xs text-muted-foreground">Automatic fixed charges are added from Rate Setup. Overtime applies from 6:00 PM to 7:59 AM when enabled. Optional charges apply only when selected.</p>
          {!!optionalCharges.length && <div className="rounded-xl border border-slate-200 p-4"><h4 className="mb-2 text-sm font-bold">Optional services (add only when required)</h4><p className="mb-3 text-xs text-muted-foreground">Additional services are priced from Rate Setup. Selecting one recalculates the official Gate-out quote and VAT.</p><div className="space-y-2">{optionalCharges.map(rate=><label key={rate.id} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border bg-surface p-3 text-sm"><span className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={selectedOptional.includes(rate.id)} disabled={busy} onChange={event=>setSelectedOptional(current=>event.target.checked?[...current,rate.id]:current.filter(id=>id!==rate.id))}/><span><strong>{rate.name}</strong>{rate.description&&<span className="block text-xs text-muted-foreground">{rate.description}</span>}</span></span><strong>{peso(rate.amount)}</strong></label>)}</div></div>}
          {quoteError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{quoteError}</p>}
          {loadingQuote ? <div className="animate-pulse space-y-3 rounded-xl border p-4"><div className="h-4 rounded bg-muted"/><div className="h-4 w-3/4 rounded bg-muted"/></div> : quote ? <div className="rounded-xl border p-4 text-sm">
            {quote.lines?.find(line=>line.description==='Storage') && <p className="mb-2 text-sm font-semibold text-brand-700">Estimated storage charge: {quote.lines.find(line=>line.description==='Storage').quantity} calendar day(s) through your scheduled Gate-out date.</p>}
            <h4 className="mb-2 font-bold">Official itemized Gate-out quotation</h4>
            {quote.lines?.length ? quote.lines.map((line,index)=><div key={index} className="flex justify-between gap-3 border-b py-2 last:border-b-0"><span>{line.description} × {line.quantity}<span className="block text-xs text-muted-foreground">{peso(line.unitRate)} per unit</span></span><span className="shrink-0 font-semibold">{peso(line.amount)}</span></div>) : <p className="text-amber-800">No charge lines returned. Please contact the terminal administrator.</p>}
            <div className="mt-2 flex justify-between border-t pt-3"><span>Subtotal</span><strong>{peso(quote.subtotal)}</strong></div>
            <div className="flex justify-between"><span>VAT ({quote.vatRate}%)</span><strong>{peso(quote.vat)}</strong></div>
            <div className="mt-1 flex justify-between text-lg font-extrabold"><span>Total payable</span><span>{peso(quote.total)}</span></div>
          </div> : <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{date && time ? 'The official Gate-out quotation is unavailable. Review the billing warning above.' : 'Select a future date and available hour to calculate all charges, VAT, and total payment.'}</p>}
        </section>
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-extrabold"><CreditCard size={18}/> Online Payment</h3>
          <OnlinePaymentMethod value={method} onChange={setMethod} disabled={busy}/>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">Transaction/reference number (optional when proof uploaded)<input maxLength={120} className="input mt-1 w-full" value={reference} disabled={busy} placeholder="Reference from the bank or e-wallet" onChange={(event)=>setReference(event.target.value)}/></label>
            <label className="block text-sm">Payment amount<input className="input mt-1 w-full" readOnly value={quote ? peso(quote.total) : 'Pending quotation'}/></label>
          </div>
          <PaymentProofUpload value={proof} onChange={setProof} disabled={busy}/>
          <p className="text-xs text-muted-foreground">Submitting a reference or proof does not mark the invoice paid. The administrator must verify your transfer before approving Gate-out.</p>
        </section>
        {error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0"/>{error}</p>}
        <button type="submit" disabled={!canSubmit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy && <Loader2 size={18} className="animate-spin"/>}{busy ? 'Submitting…' : 'Submit Gate-out Request & Payment'}</button>
      </form>
    </section>
  </div>;
}
