import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Search, Truck, Clock3, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import GateOutRequest from '../../components/booking/GateOutRequest';
import { bookingNextAction, isGateOutEligible, isGateOutRelated } from '../../lib/bookingJourney';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import Pagination from '../../components/ui/Pagination';
import TableSkeleton from '../../components/ui/TableSkeleton';

const formatDate = date => date ? new Intl.DateTimeFormat('en-PH', { timeZone:'Asia/Manila', year:'numeric', month:'short', day:'numeric' }).format(new Date(date)) : '—';

/** Existing client booking GET /pre-advice and POST /gate-out/:id/request only. */
export default function GateOutRequests() {
  const [items, setItems] = useState([]), [pagination, setPagination] = useState({page:1,limit:50,total:0,totalPages:1});
  const [page, setPage] = useState(1), [query, setQuery] = useState(''), [search, setSearch] = useState(''), [loading,setLoading]=useState(true);
  const [selected, setSelected] = useState(null), [filter,setFilter] = useState('all');
  const {toast} = useToast(); const {socket} = useSocket(); const current = useRef(0);
  useEffect(()=>{const t=setTimeout(()=>{setSearch(query.trim());setPage(1)},300);return ()=>clearTimeout(t)},[query]);
  const load = useCallback(async()=>{
    const id=++current.current;setLoading(true);
    try {const r=await api.get('/pre-advice',{params:{page,limit:50,search:search||undefined}});if(id!==current.current)return;setItems(r.data?.data?.items||[]);setPagination(r.data?.data?.pagination||{page,limit:50,total:0,totalPages:1});}
    catch(e){if(id===current.current)toast(e.response?.data?.message||'Unable to load your bookings.','error')}
    finally{if(id===current.current)setLoading(false)}
  },[page,search,toast]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{const refresh=()=>load();socket.on('pre-advice:workflow-updated',refresh);socket.on('connect',refresh);return()=>{socket.off('pre-advice:workflow-updated',refresh);socket.off('connect',refresh)}},[socket,load]);
  const shown=items.filter(item=>isGateOutRelated(item)).filter(item=>filter==='all'||(filter==='eligible'?isGateOutEligible(item):filter==='pending'?['GATE_OUT_REQUESTED','GATE_OUT_PAYMENT_SUBMITTED'].includes(item.workflowStage):['GATE_OUT_APPROVED','READY_FOR_RELEASE','CONTAINER_RELEASED'].includes(item.workflowStage)));
  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">Container release</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Gate-Out Requests</h1><p className="mt-1 text-sm text-muted-foreground">Request gate-out directly from your booking. Track payment review and physical release separately.</p></div><Link className="btn btn-primary" to="/portal/pre-advice">All My Bookings <ArrowRight size={16}/></Link></header>
    <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-sm"><p className="font-bold text-foreground">Your booking information is reused.</p><p className="mt-1 text-muted-foreground">Select a stored container to open the same request-and-payment modal used in My Bookings. Truck, driver, and shipment information are read-only.</p></div>
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input className="input pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search booking, container or shipping line" aria-label="Search gate-out bookings"/></div><div className="flex flex-wrap gap-2" role="group" aria-label="Gate-out view">{[['all','All'],['eligible','Ready to request'],['pending','Under review'],['released','Approved / released']].map(([value,label])=><button type="button" key={value} onClick={()=>setFilter(value)} aria-pressed={filter===value} className={`rounded-lg border px-3 py-2 text-xs font-bold ${filter===value?'border-brand-700 bg-brand-700 text-white':'border-border bg-surface text-foreground'}`}>{label}</button>)}</div></div>
      {loading?<div className="mt-4"><TableSkeleton rows={5} columns={4}/></div>:shown.length?<div className="mt-4 space-y-3">{shown.map(item=>{const next=bookingNextAction(item);return <article key={item._id} className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Truck size={19}/></span><div><Link to={`/portal/pre-advice/${item._id}`} className="font-extrabold text-brand-700">{item.bookingReference}</Link><p className="text-sm font-semibold">{item.containerNumber} · {item.containerSize}</p><p className="mt-1 text-xs text-muted-foreground">Gate-in: {formatDate(item.gateIn?.actualGateInAt)} · {next.title}</p><p className="mt-1 text-xs text-muted-foreground">Next: {next.owner}</p></div></div><div className="flex flex-wrap items-center gap-2">{isGateOutEligible(item)?<button type="button" className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white" onClick={()=>setSelected(item)}>Request Gate-out</button>:<span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-bold"><Clock3 size={14}/>{next.status}</span>}<Link to={`/portal/pre-advice/${item._id}`} className="rounded-lg border px-3 py-2 text-xs font-bold">Details</Link></div></article>})}</div>:<div className="grid min-h-[200px] place-items-center text-center"><div><PackageCheck className="mx-auto size-9 text-muted-foreground/60"/><p className="mt-3 font-bold">No matching Gate-out requests on this page</p><p className="mt-1 text-xs text-muted-foreground">Check the next page or view all bookings. Only gated-in and stored containers can request release.</p></div></div>}
      {!loading&&<div className="mt-4 border-t border-border pt-4"><Pagination {...pagination} onPage={setPage}/></div>}
      <p className="mt-3 text-xs text-muted-foreground">Results use the existing paginated Booking API. Filters apply to the loaded page; other bookings may appear on subsequent pages.</p>
    </section>
    {selected&&<GateOutRequest booking={selected} onClose={()=>setSelected(null)} onUpdated={load}/>}
  </div>;
}
