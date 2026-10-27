import {useCallback,useEffect,useMemo,useState} from 'react';
import {Banknote,RefreshCw,Info,ArrowDownToLine,ArrowUpFromLine} from 'lucide-react';
import {api} from '../../lib/api';
import {resolveDisplayedRates} from '../../lib/overtimeRateSelection.js';
import TableSkeleton from '../../components/ui/TableSkeleton';

const money = new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2});
const display=value=>String(value||'').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,char=>char.toUpperCase());
const basis=rate=>rate.name==='Storage'?'Per billable day':rate.name==='Overtime'?'Per eligible movement':'Per container / transaction';
const tax=rate=>rate.taxTreatment==='EXEMPT'?'VAT exempt':rate.taxTreatment==='ZERO_RATED'?'Zero-rated':'VAT taxable';
const rateDate=rate=>rate.effectiveFrom?new Date(rate.effectiveFrom).toLocaleDateString('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium'}):'Current';

/** Mirrors only active effective rates returned by the Express /api/rates controller. */
export default function Rates(){
  const [rates,setRates]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [classification,setClassification]=useState('LOCAL'),[category,setCategory]=useState('STANDARD'),[load,setLoad]=useState('EMPTY'),[size,setSize]=useState('20FT');
  const refresh=useCallback(async()=>{setLoading(true);setError('');try{const response=await api.get('/rates');const list=response.data?.data;if(!Array.isArray(list))throw new Error('Invalid rate data from server.');setRates(list)}catch(e){setError(e.response?.data?.message||e.message||'Unable to load rate schedule.');setRates([])}finally{setLoading(false)}},[]);
  useEffect(()=>{refresh()},[refresh]);
  useEffect(()=>{if(category==='REEFER')setLoad('EMPTY')},[category]);
  const applicable=useMemo(()=>resolveDisplayedRates(rates,{classification,category,load,size}),[rates,classification,category,load,size]);
  const group=point=>applicable.filter(r=>r.collectionPoint===point);
  return <main className="min-h-[calc(100vh-72px)] bg-background">
    <section className="border-b border-border bg-white"><div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-10"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-red">Current Rate Schedule</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-ink sm:text-5xl">Container Rates</h1><p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Current applicable rates come directly from Admin Rate Setup. Select the container classification, category, condition, and size to see the applicable schedule.</p></div></section>
    <div className="mx-auto max-w-[1480px] space-y-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      {[["Classification",classification,setClassification,[['LOCAL','Local'],['INTERNATIONAL','International']]],["Container category",category,setCategory,[['STANDARD','Standard / Non-reefer'],['REEFER','Reefer']]],["Load status",load,setLoad,[['EMPTY','Empty'],['LOADED','Loaded']]],["Container size",size,setSize,[['20FT','20FT'],['40FT','40FT']]]].map(([label,value,set,options])=><label key={label} className="grid gap-1 text-sm font-semibold"><span>{label}</span><select value={value} onChange={e=>set(e.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3">{options.map(([v,text])=><option key={v} value={v} disabled={category==='REEFER'&&v==='LOADED'}>{text}</option>)}</select></label>)}
      <div className="flex items-end"><button type="button" onClick={refresh} disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 text-sm font-bold text-brand-ink hover:bg-muted disabled:opacity-50"><RefreshCw size={17}/>Refresh Rates</button></div>
      </section>
      {category==='REEFER'&&<p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Reefer rates are available for Empty containers only.</p>}
      {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading?<TableSkeleton rows={7} columns={6}/>:!error&&applicable.length===0?<div className="rounded-2xl border border-dashed bg-white p-10 text-center"><Banknote size={32} className="mx-auto text-muted-foreground"/><h2 className="mt-4 text-xl font-bold">No active rates for this combination</h2><p className="mt-2 text-sm text-muted-foreground">Only active, currently effective rates are shown. Contact the terminal office for any missing classification.</p></div>:['GATE_IN','GATE_OUT'].map(point=><section key={point} className="overflow-hidden rounded-2xl border bg-white shadow-sm"><header className="flex items-center gap-3 border-b bg-slate-50 p-5">{point==='GATE_IN'?<ArrowDownToLine size={22} className="text-brand-700"/>:<ArrowUpFromLine size={22} className="text-brand-700"/>}<div><h2 className="text-xl font-extrabold">{point==='GATE_IN'?'Gate-in charges':'Gate-out charges'}</h2><p className="text-xs text-muted-foreground">{display(classification)} · {display(category)} · {display(load)} · {size}</p></div></header>
       {group(point).length===0?<p className="p-6 text-sm text-muted-foreground">No active rates configured for this collection point.</p>:<><div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b bg-white p-4 text-xs font-extrabold uppercase tracking-wider text-muted-foreground lg:grid"><span>Service</span><span>Rate amount</span><span>Rate basis</span><span>VAT treatment</span><span>Application</span><span>Effective date</span></div><div className="divide-y">{group(point).map(rate=><article key={rate.id} className="grid gap-3 p-4 text-sm lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-4"><div><p className="font-bold text-brand-ink">{rate.name}</p><p className="mt-1 text-xs text-muted-foreground">{rate.name==='Overtime' && ['classification','loadStatus','containerCategory'].some(key=>rate[key]==='ALL')?'Universal / category override · ':''}{rate.containerSize==='ALL'?'Both sizes':rate.containerSize}{rate.description?` · ${rate.description}`:''}</p></div><p className="text-lg font-extrabold text-brand-700">{money.format(Number(rate.amount||0))}</p><p>{basis(rate)}</p><p>{tax(rate)}</p><p><span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">{rate.billingMode==='OPTIONAL'?'Optional / manual':'Fixed / automatic'}</span></p><p className="text-muted-foreground">{rateDate(rate)}</p></article>)}</div></>}
      </section>)}
      <p className="flex items-start gap-3 rounded-xl border bg-white p-4 text-sm leading-6 text-muted-foreground"><Info size={19} className="mt-1 shrink-0"/>Rates shown are the active service amounts before any transaction-specific VAT and overtime conditions. Storage is billed per applicable day; overtime applies automatically at both Gate-in and Gate-out during the configured hours (default 18:00 to 08:00), using the most specific active category rate or the global Settings fee. Optional charges apply only when selected. The confirmed invoice, rather than this rate reference, is the payment amount due.</p>
    </div>
  </main>;
}
