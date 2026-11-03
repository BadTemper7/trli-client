import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,FileText,Save} from 'lucide-react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {api} from '../../lib/api';
import {useToast} from '../../context/ToastContext';
import {useAuth} from '../../context/AuthContext';
import FileUpload from '../../components/ui/FileUpload';
import HourlySchedulePicker from '../../components/ui/HourlySchedulePicker';
import TableSkeleton from "../../components/ui/TableSkeleton";
const blank={containerNumber:'',containerSize:'20FT',containerType:'DRY CONTAINER',loadStatus:'EMPTY',transactionClassification:'LOCAL',scheduledGateDateIn:'',scheduledGateTimeIn:'',shippingLine:'',truckPlateNumber:'',driverName:'',driverLicenceNumber:'',hauler:'',blNumber:'',vesselVoyage:'',weight:'',cargoDescription:'',remarks:''};
export default function PreAdviceForm(){
 const {id}=useParams(),[form,setForm]=useState(blank),[files,setFiles]=useState({}),[busy,setBusy]=useState(false),[loading,setLoading]=useState(Boolean(id));
 const [reeferRates,setReeferRates]=useState({key:'',statuses:[],loading:false,error:''});const nav=useNavigate(),{toast}=useToast(),{user}=useAuth();
 useEffect(()=>{if(!id)return;api.get(`/pre-advice/${id}`).then(r=>setForm(x=>({...x,...r.data.data.item}))).catch(e=>toast(e.response?.data?.message||'Unable to load booking','error')).finally(()=>setLoading(false))},[id,toast]);

 // Only show Reefer load statuses that are covered by an ACTIVE, effective
 // Reefer tariff for the selected size and classification. Never infer from
 // Standard rates or the universal Overtime fallback.
 useEffect(()=>{
  if(form.containerType!=='REEFER'){
   setReeferRates({key:'',statuses:[],loading:false,error:''});
   return;
  }
  const key=`${form.containerSize}:${form.transactionClassification}`;
  let active=true;
  setReeferRates({key,statuses:[],loading:true,error:''});
  api.get('/rates/load-statuses',{params:{containerType:'REEFER',containerSize:form.containerSize,classification:form.transactionClassification}})
   .then(({data})=>{
    if(!active)return;
    const statuses=(data?.data?.loadStatuses||[]).filter(v=>['EMPTY','LOADED'].includes(v));
    setReeferRates({key,statuses,loading:false,error:''});
    setForm(current=>{
     if(current.containerType!=='REEFER'||`${current.containerSize}:${current.transactionClassification}`!==key)return current;
     // Don't silently alter the saved value of a locked historical booking.
     if(id&&current.workflowStage!=='BOOKING_SUBMITTED')return current;
     return statuses.includes(current.loadStatus)?current:{...current,loadStatus:statuses[0]||''};
    });
   }).catch(error=>{
    if(!active)return;
    setReeferRates({key,statuses:[],loading:false,error:error.response?.data?.message||'Unable to check configured Reefer rates.'});
   });
  return ()=>{active=false};
 },[form.containerType,form.containerSize,form.transactionClassification,id]);

 const locked=useMemo(()=>Boolean(id) && (form.workflowStage!=='BOOKING_SUBMITTED' || !['DRAFT','SUBMITTED'].includes(form.status)),[id,form.workflowStage,form.status]);
 if(user?.company?.verificationStatus!=='VERIFIED')return <div className="card p-7"><h1 className="text-2xl font-bold">Company verification required</h1><p className="mt-2 text-slate-600">Pre-advice booking becomes available after your company is verified.</p><Link to="/portal/company" className="btn-secondary mt-5">View Verification Status</Link></div>;
 if(loading)return <TableSkeleton rows={6} columns={3} />;
 const set=(k,v)=>setForm(x=>({...x,[k]:v,...(x.containerType==='REEFER'&&['containerSize','transactionClassification'].includes(k)?{loadStatus:''}:{})}));
 const reeferKey=`${form.containerSize}:${form.transactionClassification}`;
 const isReefer=form.containerType==='REEFER';
 const reeferReady=!isReefer||(reeferRates.key===reeferKey&&!reeferRates.loading&&!reeferRates.error&&reeferRates.statuses.length>0);
 const changeContainerType=(value)=>setForm(x=>({...x,containerType:value,loadStatus:value==='REEFER'?'':x.loadStatus||'EMPTY'}));
 const errors=()=>{if(isReefer&&!reeferReady)return reeferRates.error||'No active Reefer rates match this container size and classification.';if(isReefer&&!reeferRates.statuses.includes(form.loadStatus))return 'Select an available Reefer load status.';const required=['containerNumber','containerSize','containerType','loadStatus','transactionClassification','scheduledGateDateIn','scheduledGateTimeIn','shippingLine','truckPlateNumber','driverName','driverLicenceNumber','hauler','weight'];const missing=required.filter(k=>String(form[k]??'').trim()==='');if(missing.length)return 'Complete all required booking fields.';if(Number(form.weight)<0)return 'Weight must be zero or greater.';return ''};
 const submit=async e=>{e.preventDefault();const err=errors();if(err)return toast(err,'error');setBusy(true);try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>{if(['_id','company','createdBy','createdAt','updatedAt','documents','statusHistory','storage','bookingReference','__v'].includes(k))return;if(v!==undefined&&v!==null)fd.append(k,String(v))});Object.entries(files).forEach(([k,v])=>v&&fd.append(k,v));const r=id?await api.put(`/pre-advice/${id}`,fd):await api.post('/pre-advice',fd);toast(id?'Pre-advice updated':'Pre-advice created');nav(`/portal/pre-advice/${r.data.data.item._id}`)}catch(e){toast(e.response?.data?.message||'Unable to save Pre-advice','error')}finally{setBusy(false)}};
 const input=(k,label,t='text',required=false)=><div><label className="mb-1.5 block text-sm font-semibold">{label}{required&&' *'}</label><input className="input" type={t} value={form[k]||''} onChange={e=>set(k,e.target.value)} disabled={locked}/></div>;
 return <form onSubmit={submit}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Link to={id?`/portal/pre-advice/${id}`:'/portal/pre-advice'} className="rounded-xl border p-2.5 hover:bg-slate-50"><ArrowLeft size={18}/></Link><div><p className="text-sm text-slate-500">{id?'Update booking details':'Verified Client Booking'}</p><h1 className="text-3xl font-bold">{id?'Edit':'New'} Pre-advice</h1></div></div>{id&&form.bookingReference&&<span className="badge bg-blue-50 text-brand-blue">{form.bookingReference}</span>}</div>{locked&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">This booking can no longer be edited from the Client Portal because it has already been approved or moved into operations.</div>}<div className="mt-6 space-y-6">
 <section className="card p-6"><h2 className="font-bold">Container Details</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{input('containerNumber','Container Number','text',true)}<div><label className="mb-1.5 block text-sm font-semibold">Container Size *</label><select className="input" value={form.containerSize} onChange={e=>set('containerSize',e.target.value)} disabled={locked}><option>20FT</option><option>40FT</option></select></div><div><label className="mb-1.5 block text-sm font-semibold">Container Type *</label><select className="input" value={form.containerType} onChange={e=>changeContainerType(e.target.value)} disabled={locked}>{['DRY CONTAINER','REEFER','TANK CONTAINER','OPEN TOP','FLAT RACK'].map(x=><option key={x}>{x}</option>)}</select></div><div><label className="mb-1.5 block text-sm font-semibold">Load Status *</label><select className="input" value={form.loadStatus} onChange={e=>set('loadStatus',e.target.value)} disabled={locked||(isReefer&&!reeferReady)} required>
  {isReefer?<><option value="">{reeferRates.loading||reeferRates.key!==reeferKey?'Checking available Reefer rates...':reeferRates.statuses.length?'Select available load status':'No configured Reefer load status'}</option>{reeferRates.statuses.map(value=><option key={value} value={value}>{value==='LOADED'?'Loaded':'Empty'}</option>)}{locked&&form.loadStatus&&!reeferRates.statuses.includes(form.loadStatus)&&<option value={form.loadStatus}>{form.loadStatus}</option>}</>:<><option value="EMPTY">Empty</option><option value="LOADED">Loaded</option></>}
 </select>{isReefer&&<p role="status" className={`mt-1.5 text-xs ${reeferRates.error||(!reeferRates.loading&&!reeferRates.statuses.length)?'text-red-600':'text-slate-500'}`}>{reeferRates.error||(!reeferRates.loading&&!reeferRates.statuses.length?'No active Reefer rate matches. Ask the administrator to configure one.':'Only load statuses covered by the configured Reefer rates are available.')}</p>}</div><div><label className="mb-1.5 block text-sm font-semibold">Transaction Classification *</label><select className="input" value={form.transactionClassification} onChange={e=>set('transactionClassification',e.target.value)} disabled={locked}><option>LOCAL</option><option>INTERNATIONAL</option></select></div></div></section>
 <section className="card p-6"><h2 className="font-bold">Gate Schedule</h2><p className="mt-1 text-sm text-slate-500">Choose a gate-in date and an available 1-hour arrival slot.</p><div className="mt-4"><HourlySchedulePicker date={form.scheduledGateDateIn} time={form.scheduledGateTimeIn} onDateChange={value=>set('scheduledGateDateIn',value)} onTimeChange={value=>set('scheduledGateTimeIn',value)} dateLabel="Scheduled Gate Date In" timeLabel="Scheduled Gate Time In" required disabled={locked}/></div><div className="mt-4">{input('shippingLine','Shipping Line','text',true)}</div></section>
 <section className="card p-6"><h2 className="font-bold">Truck & Driver</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{input('truckPlateNumber','Truck Plate Number','text',true)}{input('driverName','Driver Name','text',true)}{input('driverLicenceNumber','Driver Licence Number','text',true)}{input('hauler','Hauler','text',true)}</div></section>
 <section className="card p-6"><h2 className="font-bold">Shipment Information</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{input('blNumber','BL Number')}{input('vesselVoyage','Vessel / Voyage')}{input('weight','Weight','number',true)}{input('cargoDescription','Cargo Description')}<div className="md:col-span-2"><label className="mb-1.5 block text-sm font-semibold">Remarks</label><textarea className="input min-h-24" value={form.remarks||''} onChange={e=>set('remarks',e.target.value)} disabled={locked}/></div></div></section>
 <section className="card p-6"><div className="flex items-center gap-2"><FileText size={19}/><h2 className="font-bold">Pre-advice Documents</h2></div><p className="mt-1 text-sm text-slate-500">Optional supporting documents. Existing documents are retained when editing.</p>{id&&form.documents?.length>0&&<div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">Existing Documents</p><ul className="mt-2 space-y-1 text-sm text-slate-600">{form.documents.map(d=><li key={d._id||d.storedName}>{d.name}</li>)}</ul></div>}<div className="mt-4 grid gap-5 md:grid-cols-2">{[['deliveryOrder','Delivery Order'],['bookingConfirmation','Booking Confirmation'],['packingList','Packing List'],['customClearance','Custom Clearance'],['otherDocument','Other Document']].map(([k,l])=><FileUpload key={k} label={l} name={k} file={files[k]} onChange={v=>setFiles(x=>({...x,[k]:v}))}/>)}</div></section>
 <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><Link to={id?`/portal/pre-advice/${id}`:'/portal/pre-advice'} className="btn btn-secondary min-h-12 w-full rounded-xl border-slate-300 px-6 text-sm font-bold shadow-sm transition-colors hover:border-slate-400 sm:w-auto">Cancel</Link><button type="submit" disabled={busy||locked||(isReefer&&!reeferReady)} className="btn btn-primary min-h-12 w-full rounded-xl px-6 text-sm font-bold shadow-sm transition-colors hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><Save size={17}/>{busy?'Saving...':id?'Save Changes':'Submit Pre-advice'}</button></div></div></form>;
}
