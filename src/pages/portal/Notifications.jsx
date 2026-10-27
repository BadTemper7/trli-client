import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useSocket } from '../../context/SocketContext';

const formatTime = value => value ? new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value)) : '';

export default function Notifications(){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const {socket}=useSocket();
  const load=useCallback(async()=>{setError('');try{const r=await api.get('/notifications');setItems(r.data?.data?.items||[])}catch(e){setError(e.response?.data?.message||'Unable to load notifications')}finally{setLoading(false)}},[]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{const handler=item=>setItems(existing=>existing.some(i=>i._id===item?._id)?existing:[item,...existing]);socket.on('notification:new',handler);socket.on('connect',load);return()=>{socket.off('notification:new',handler);socket.off('connect',load)}},[socket,load]);
  const mark=async id=>{setBusy(true);try{await api.patch(id?`/notifications/${id}/read`:'/notifications/read-all');setItems(existing=>existing.map(i=>!id||i._id===id?{...i,isRead:true}:i))}catch(e){setError(e.response?.data?.message||'Unable to mark as read')}finally{setBusy(false)}};
  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">Updates</p><h1 className="mt-1 text-3xl font-extrabold">Notifications</h1><p className="mt-1 text-sm text-muted-foreground">Booking, payment, and container updates from the terminal.</p></div><button type="button" onClick={()=>mark()} disabled={busy||!items.some(i=>!i.isRead)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold disabled:opacity-50"><CheckCheck size={17}/>Mark all read</button></header>
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
   <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">{loading?<div className="space-y-3 p-5">{Array.from({length:4},(_,i)=><div key={i} className="h-20 animate-pulse rounded-xl bg-muted"/>)}</div>:items.length?<div className="divide-y divide-border">{items.map(item=><article key={item._id} className={`flex gap-3 p-4 sm:p-5 ${item.isRead?'':'bg-brand-50/40'}`}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Bell size={19}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-foreground">{item.title||'Booking update'}</h2><time className="text-xs text-muted-foreground">{formatTime(item.createdAt)}</time></div><p className="mt-1 text-sm text-muted-foreground">{item.message||'Your transaction was updated.'}</p>{!item.isRead&&<button type="button" disabled={busy} onClick={()=>mark(item._id)} className="mt-2 text-xs font-bold text-brand-700">Mark as read</button>}</div></article>)}</div>:<div className="p-12 text-center text-sm text-muted-foreground">No notifications yet.</div>}</section>
 </div>;
}
