import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {api} from '../../lib/api';
import PassPreview from '../../components/booking/PassPreview';
export default function ClientContainerDetails(){
 const {source,id}=useParams(),[record,setRecord]=useState(null),[error,setError]=useState(''),[preview,setPreview]=useState(null);
 useEffect(()=>{api.get(`/client/container-tracking/${source}/${id}`).then(r=>setRecord(r.data.data)).catch(e=>setError(e.response?.data?.message||e.message))},[source,id]);
 const c=record?.container;
 return <div className="space-y-5"><Link className="text-sm font-bold text-brand-700 underline" to="/portal/pre-advice">Back to My Bookings</Link><h1 className="text-2xl font-extrabold">Container Details</h1>
 {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
 {!c?<p>Loading your assigned container…</p>:<>
 <section className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-amber-700">{c.source==='HISTORICAL'?'Imported historical record':'Live booking'}</p><h2 className="text-xl font-extrabold">{c.containerNumber}</h2><p className="text-sm text-slate-500">{c.containerSize} · {c.containerType} · {c.loadStatus} · {c.status}</p><p className="text-sm text-slate-500">Company: {c.companyName}</p></section>
 <div className="grid gap-4 sm:grid-cols-2">{[['Gate-in',c.gateIn?.actualGateInAt,c.gateIn?.remarks],['Storage',c.storage?.storedAt,c.storage?.location],['Gate-out approved',c.gateOut?.approvedAt,c.gateOut?.remarks],['Released',c.gateOut?.releasedAt,'']].map(([label,at,note])=><div className="rounded-xl border bg-white p-4" key={label}><h3 className="font-bold">{label}</h3><p className="mt-2 text-sm">{at?new Date(at).toLocaleString('en-PH',{timeZone:'Asia/Manila'}):'Not recorded'}</p><p className="mt-1 text-xs text-slate-500">{note}</p>{(label==='Gate-in'||label==='Gate-out approved')&&<button type="button" className="mt-3 text-sm font-bold text-brand-700 underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline" disabled={!record.passAvailability?.[label==='Gate-in'?'gateIn':'gateOut']} onClick={()=>setPreview(label==='Gate-in'?'GATE_IN':'GATE_OUT')}>{record.passAvailability?.[label==='Gate-in'?'gateIn':'gateOut']?'View approved pass':'Pass awaiting approval'}</button>}</div>)}</div>
 {preview&&<PassPreview source={source} id={id} type={preview} onClose={()=>setPreview(null)}/>}
 {record.invoices?.length>0&&<section className="rounded-xl border bg-white p-5"><h3 className="mb-3 font-bold">Invoices and Payments</h3>{record.invoices.map(i=><p key={i._id} className="border-b py-2 text-sm">{i.number} · {i.type} · {i.status} · PHP {i.total?.toFixed?.(2)||i.total}</p>)}</section>}
 </>}
 </div>;
}
