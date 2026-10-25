import Skeleton from '../components/ui/Skeleton';
import ManualPaymentModal from '../components/payment/ManualPaymentModal';
import {useMemo,useState,useRef,useEffect} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {ArrowLeft,ArrowRight,Search,MapPin,CalendarDays,LayoutGrid,List as ListIcon,ChevronLeft,ChevronRight,Clock3,Container,ClipboardList,CheckCircle2,PackageSearch,SearchX,ArrowUpRight,UploadCloud,FileText,X,CheckCircle2 as UploadCheck} from 'lucide-react';
import {clientApi,bookingLabel,dateLabel,statusLabel,peso,canRequestGateOut,canPayGateOut} from '../api/client';
import useClientData from '../api/useClientData';
import {loadRates} from '../data/ratesSource';
import HourlyTimeSelect, {firstAvailableDate,hourIsAvailable} from '../components/HourlyTimeSelect';
import {localDateString,isFullHour} from '../utils/hourlySchedule';
const validHour=isFullHour;
const today=localDateString;
const toGateOutISO=value=>{
 const match=/^(\d{4}-\d{2}-\d{2})T((?:[01]\d|2[0-3]):00)$/.exec(value);
 if(!match||!hourIsAvailable(match[1],match[2]))throw new Error('Select a future time on a full-hour interval.');
 return new Date(`${value}:00`).toISOString();
};
function OutDateTime({value,onChange}){
 const [date='',time='']=value.split('T');
 const minDate=firstAvailableDate();
 return <div className="gate-hour-fields"><label>Date Out<input required type="date" min={minDate} value={date} onChange={e=>{
  const nextDate=e.target.value;
  onChange(nextDate?`${nextDate}T${hourIsAvailable(nextDate,time)?time:''}`:'');
 }}/></label><label>Time Out (hourly)<HourlyTimeSelect required id="gate-out-hour" date={date} value={time} onChange={next=>onChange(date?`${date}T${next}`:'')}/></label></div>;
}
const validFutureOut = value => {const [date,time]=value.split('T');return hourIsAvailable(date,time)};
function Title({title,subtitle}){return <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>}
function Feedback({loading,error,onRetry}){return loading?<div role="status"><Skeleton variant="bookings" rows={4}/></div>:error?<div className="panel empty-state" role="alert">{error} <button type="button" className="outline-button" onClick={onRetry}>Try again</button></div>:null}
function Empty({title,description,search=false,action=false}){const Icon=search?SearchX:PackageSearch;return <section className="live-empty-state" aria-live="polite"><div className="live-empty-icon"><Icon size={28}/></div><h2>{title}</h2><p>{description}</p>{action&&<Link className="lime-button" to="/pre-advice">Create Pre-Advice <ArrowUpRight size={17}/></Link>}</section>}
function Status({value}){return <span className={`status-badge booking-state ${String(value||'pending').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{statusLabel(value)}</span>}
function Card({b}){return <Link className="booking-card" to={`/bookings/${b.id}`}><div className="booking-card-body"><div className="booking-card-title"><strong>{bookingLabel(b)}</strong><Status value={b.status}/></div><p>{b.containerNumber} · {b.containerSize}FT {b.containerType}</p><small><MapPin size={13}/>{b.assignedAreaName||'Awaiting yard assignment'}</small><small><CalendarDays size={13}/>{dateLabel(b.createdAt||b.submittedAt||b.inDate)}</small></div><ArrowRight size={19}/></Link>}
const BOOKING_PAGE_SIZE=8;
const normalizeBookingStatus=value=>String(value||'').toLowerCase().replace(/[\s-]+/g,'_');
function bookingGroup(value){const status=normalizeBookingStatus(value);if(/cancel|reject/.test(status))return 'Cancelled';if(/complete|done|released/.test(status))return 'Completed';if(/stored|yard|inventory|gate_in/.test(status))return 'In Yard';if(/approved/.test(status))return 'Approved';return 'Pending'}
function bookingSchedule(b){return b.scheduledGateOutDate||b.scheduledDateOut||b.requestedGateOutDate||b.inDate||b.expectedArrivalDate||b.arrivalDate||b.createdAt}
function BookingStats({rows,filter,onFilter}){const counts=[['Total Bookings','All','booking-total'],['Pending Approval','Pending','booking-pending'],['Active / In Yard','In Yard','booking-yard'],['Completed','Completed','booking-complete']];return <div className="booking-summary-grid">{counts.map(([label,key,style])=><button type="button" className={`booking-summary-tile ${style}${filter===key?' is-active':''}`} key={key} onClick={()=>onFilter(key)}><span className="booking-summary-icon">{key==='Pending'?<Clock3/>:key==='Completed'?<CheckCircle2/>:key==='In Yard'?<Container/>:<ClipboardList/>}</span><span className="booking-summary-copy"><strong>{key==='All'?rows.length:rows.filter(b=>bookingGroup(b.status)===key).length}</strong><small>{label}</small></span><ChevronRight size={17}/></button>)}</div>}
export function BookingsPage(){
 const [params,setParams]=useSearchParams();const [q,setQ]=useState(params.get('q')||'');const [filter,setFilter]=useState(params.get('status')||'All');const [sort,setSort]=useState('newest');const [view,setView]=useState('list');const [page,setPage]=useState(1);const [from,setFrom]=useState('');const [to,setTo]=useState('');
 const {data,loading,error,refresh}=useClientData(clientApi.bookings);const rows=data?.bookings||[];
 const groups=['All','Pending','Approved','In Yard','Completed','Cancelled'];
 const displayed=useMemo(()=>rows.filter(b=>{const category=bookingGroup(b.status);const label=statusLabel(b.status);const statusMatch=filter==='All'||filter===category||filter===label;const searchText=`${bookingLabel(b)} ${b.containerNumber||''} ${b.assignedAreaName||''}`.toLowerCase();const date=new Date(b.createdAt||b.submittedAt||b.inDate||0);return statusMatch&&searchText.includes(q.toLowerCase().trim())&&(!from||date>=new Date(`${from}T00:00:00`))&&(!to||date<=new Date(`${to}T23:59:59`))}).sort((a,b)=>{const aa=new Date(a.createdAt||a.submittedAt||a.inDate||0).getTime();const bb=new Date(b.createdAt||b.submittedAt||b.inDate||0).getTime();return sort==='oldest'?aa-bb:bb-aa}),[rows,q,filter,sort,from,to]);
 useEffect(()=>setPage(1),[q,filter,sort,from,to]);const totalPages=Math.max(1,Math.ceil(displayed.length/BOOKING_PAGE_SIZE));const currentPage=Math.min(page,totalPages);const visible=displayed.slice((currentPage-1)*BOOKING_PAGE_SIZE,currentPage*BOOKING_PAGE_SIZE);
 const selectFilter=value=>{setFilter(value);setParams(value==='All'?{}:{status:value})};
 return <div className="bookings-redesign"><div className="bookings-topline"><Title title="My Bookings" subtitle="Track, manage, and review all your container pre-advices and yard transactions."/><Link className="lime-button bookings-new-action" to="/pre-advice">+ New Pre-Advice <ArrowRight size={17}/></Link></div>
 {!loading&&!error&&<BookingStats rows={rows} filter={filter} onFilter={selectFilter}/>}
 <section className="booking-list-panel"><div className="booking-list-heading"><div><h2>All Bookings</h2><p>View and manage your pre-advice requests and container movements.</p></div><small>Switches to cards on mobile</small></div>
 <div className="booking-tools"><label className="page-search unified-search booking-search"><Search size={17}/><input aria-label="Search booking reference or container number" placeholder="Search booking reference or container number..." value={q} onChange={e=>setQ(e.target.value)}/></label><select aria-label="Filter by booking status" value={filter} onChange={e=>selectFilter(e.target.value)}><option value="All">All Statuses</option>{groups.slice(1).map(g=><option key={g} value={g}>{g}</option>)}</select><div className="booking-date-filter"><input type="date" aria-label="From date" value={from} onChange={e=>setFrom(e.target.value)}/><span>–</span><input type="date" aria-label="To date" min={from||undefined} value={to} onChange={e=>setTo(e.target.value)}/></div><select aria-label="Sort bookings" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select><div className="booking-view-switch"><button aria-label="Table view" aria-pressed={view==='list'} className={view==='list'?'active':''} onClick={()=>setView('list')}><ListIcon size={18}/></button><button aria-label="Card view" aria-pressed={view==='grid'} className={view==='grid'?'active':''} onClick={()=>setView('grid')}><LayoutGrid size={18}/></button></div></div>
 <div className="booking-tabs" role="group" aria-label="Booking statuses">{groups.map(group=><button type="button" key={group} className={filter===group?'active':''} onClick={()=>selectFilter(group)}>{group} ({group==='All'?rows.length:rows.filter(b=>bookingGroup(b.status)===group).length})</button>)}</div>
 <Feedback loading={loading} error={error} onRetry={refresh}/>
 {!loading&&!error&&visible.length>0&&<><div className={`booking-table-wrap ${view==='grid'?'show-card-view':''}`}><table className="booking-table"><thead><tr><th>Booking Reference</th><th>Container Details</th><th>Transaction Type</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(b=><tr key={b.id}><td><strong>{bookingLabel(b)}</strong><small>{dateLabel(b.createdAt||b.submittedAt)}</small></td><td><div className="booking-container-cell"><Container size={20}/><div><strong>{b.containerNumber||'—'}</strong><small>{b.containerSize?`${b.containerSize}FT `:''}{b.containerType||''}</small></div></div></td><td>{/gate_out/.test(normalizeBookingStatus(b.status))?'Gate-Out':/stored|inventory/.test(normalizeBookingStatus(b.status))?'Storage / In Yard':'Gate-In'}</td><td><CalendarDays size={15}/> {dateLabel(bookingSchedule(b))}</td><td><Status value={b.status}/></td><td><Link className="booking-view-detail" to={`/bookings/${b.id}`}>View Details <ArrowRight size={15}/></Link></td></tr>)}</tbody></table></div><div className="booking-mobile-cards">{visible.map(b=><Card b={b} key={b.id}/>)}</div><div className="booking-pagination"><small>Showing {(currentPage-1)*BOOKING_PAGE_SIZE+1}–{Math.min(currentPage*BOOKING_PAGE_SIZE,displayed.length)} of {displayed.length} bookings</small><div><button disabled={currentPage===1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={15}/> Previous</button>{Array.from({length:totalPages},(_,i)=><button key={i} className={currentPage===i+1?'active':''} onClick={()=>setPage(i+1)}>{i+1}</button>)}<button disabled={currentPage===totalPages} onClick={()=>setPage(p=>p+1)}>Next <ChevronRight size={15}/></button></div></div></>}
 {!loading&&!error&&!displayed.length&&<Empty search={!!q||filter!=='All'} action={rows.length===0} title={rows.length?'No matching bookings':'No bookings yet'} description={rows.length?'Try adjusting the search, status or dates.':'Your bookings will appear after you submit your first pre-advice.'}/>}
 </section></div>
}
const BOOKING_MILESTONES = [
 {label:'Pre-Advice Submitted',statuses:['pending','pending_approval','pre_advice_submitted','submitted','approved','gate_in_approved','gate_in_completed','stored_in_assigned_area','gate_out_requested','gate_out_approved','completed_gate_out_done'],dates:['submittedAt','createdAt']},
 {label:'Approved',statuses:['approved','gate_in_approved','gate_in_completed','stored_in_assigned_area','gate_out_requested','gate_out_approved','completed_gate_out_done'],dates:['approvedAt']},
 {label:'Gate-In',statuses:['gate_in_approved','gate_in_completed','stored_in_assigned_area','gate_out_requested','gate_out_approved','completed_gate_out_done'],dates:['gateInApprovedAt']},
 {label:'In Yard',statuses:['stored_in_assigned_area','gate_out_requested','gate_out_approved','completed_gate_out_done'],dates:['storedAt']},
 {label:'Gate-Out Requested',statuses:['gate_out_requested','gate_out_approved','completed_gate_out_done'],dates:['gateOutRequestedAt']},
 {label:'Completed',statuses:['completed_gate_out_done'],dates:['releasedAt']},
];
const normalizeTimelineStatus=value=>String(value||'').trim().toLowerCase().replace(/[\s-]+/g,'_');
function BookingActivityTimeline({booking}){
 const history=Array.isArray(booking.statusHistory)?booking.statusHistory:[];
 const current=normalizeTimelineStatus(booking.status);
 const isCancelled=/cancel|reject/.test(current);
 const milestones=BOOKING_MILESTONES.map((step,index)=>{
  const matching=history.filter(event=>step.statuses.includes(normalizeTimelineStatus(event.status)));
  const exact=history.find(event=>normalizeTimelineStatus(event.status)===step.statuses[0]);
  const date=step.dates.map(k=>booking[k]).find(Boolean)||exact?.changedAt||matching[0]?.changedAt||null;
  const complete=Boolean(date)||step.statuses.includes(current)||(!isCancelled&&BOOKING_MILESTONES.some((later,i)=>i>index&&later.statuses[0]===current));
  return {...step,date,complete};
 });
 const formatTime=value=>{
  if(!value)return null;
  const parsed=new Date(value);
  return Number.isNaN(parsed.getTime())?null:parsed.toLocaleString('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
 };
 return <section className="panel detail-timeline booking-activity-timeline" aria-label="Booking Activity Timeline">
  <h2><Clock3 size={19} aria-hidden="true"/> Booking Activity Timeline</h2>
  <ol className="booking-timeline-list">{milestones.map((step,i)=><li className={`booking-timeline-item ${step.complete?'is-complete':'is-upcoming'}`} key={step.label}>
    <span className="booking-timeline-marker" aria-hidden="true">{step.complete?<CheckCircle2 size={21}/>:<span/>}</span>
    <div className="booking-timeline-description"><strong>{step.label}</strong>{formatTime(step.date)&&<time dateTime={new Date(step.date).toISOString()}>{formatTime(step.date)}</time>}</div>
   </li>)}
   {isCancelled&&<li className="booking-timeline-item is-cancelled"><span className="booking-timeline-marker" aria-hidden="true"><X size={19}/></span><div className="booking-timeline-description"><strong>{statusLabel(booking.status)}</strong></div></li>}
  </ol>
  {booking.rejectionReason&&<p className="field-error">{booking.rejectionReason}</p>}
  <Link className="outline-button" to="/payments">Payments &amp; Billing <ArrowRight size={17}/></Link>
 </section>;
}
export function BookingDetails(){
 const {id}=useParams();const {data,loading,error,refresh}=useClientData(()=>clientApi.booking(id),[id]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');const [outDate,setOutDate]=useState('');const [paymentOpen,setPaymentOpen]=useState(false);const b=data?.booking;
 const submitGateOut=async e=>{e.preventDefault();if(!b||!canRequestGateOut(b)||!outDate||!validFutureOut(outDate))return;setBusy(true);setMessage('');try{await clientApi.gateOut(id,toGateOutISO(outDate));setMessage('Gate-out request submitted. The yard must approve the release.');await refresh()}catch(e){setMessage(e.message)}finally{setBusy(false)}};
 return <><Link className="back-link" to="/bookings"><ArrowLeft size={18}/> My Bookings</Link><Title title="Container Details" subtitle="Live booking and container lifecycle"/><Feedback loading={loading} error={error} onRetry={refresh}/>{b&&<div className="detail-grid"><div className="panel detail-panel"><div className="detail-title"><div><h2>{b.containerNumber}</h2><p>{b.containerSize}FT {b.containerType}</p></div><Status value={b.status}/></div><div className="detail-info">{[['Booking Reference',bookingLabel(b)],['Shipping Line',b.shippingLine],['Truck Plate',b.truckPlateNumber],['Driver',b.driverName],['Yard',b.assignedAreaName],['Block',b.assignedBlockName],['Expected Arrival',dateLabel(b.inDate||b.expectedArrivalDate)],['Gate-In Billing',peso(b.gateInBillingTotal)],['Gate-Out Billing',peso(b.gateOutBillingTotal)],['Payment Status',statusLabel(b.billingStatus)]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v||'—'}</strong></div>)}</div>
 {canRequestGateOut(b)?<form onSubmit={submitGateOut} className="gate-out-inline"><OutDateTime value={outDate} onChange={setOutDate}/><button type="submit" className="lime-button" disabled={busy||!validFutureOut(outDate)}>{busy?'Submitting…':'Request Gate-Out'} <ArrowRight size={17}/></button></form>:<p className="info-note">{String(b.status).includes('cancel')?'Cancelled containers cannot request gate-out because they did not arrive.':b.status==='gate_out_requested'?'Gate-out requested. Please submit your non-cash payment reference and proof below. Admin approval will be available once payment is verified.':b.status==='gate_out_approved'?'Gate-out approved. Awaiting scheduled physical release.':'Gate-out is available only once the container is recorded as stored in its assigned yard area.'}</p>}
 {b.status==='gate_out_requested'&&['payment_submitted','payment_under_review'].includes(b.billingStatus)&&<p className="info-note" role="status">Payment proof submitted. Awaiting administrator payment verification before Gate-Out approval.</p>}
 {b.status==='gate_out_requested'&&b.billingStatus==='paid_approved'&&<p className="info-note" role="status">Payment approved. Your Gate-Out request is now ready for administrator approval.</p>}
 {canPayGateOut(b)&&<button type="button" className="lime-button" onClick={()=>setPaymentOpen(true)}>Submit Payment Reference <ArrowRight size={17}/></button>}
 {message&&<p role="status" className="info-note">{message}</p>}</div><BookingActivityTimeline booking={b}/></div>}
 {paymentOpen&&b&&<ManualPaymentModal booking={b} onClose={()=>setPaymentOpen(false)} onSuccess={async()=>{setPaymentOpen(false);setMessage('Payment reference and proof submitted for administrator review.');await refresh()}}/>}</>;
}
export function DemoPage({title,subtitle,filter}){const {data,loading,error,refresh}=useClientData(clientApi.bookings);const rows=(data?.bookings||[]).filter(filter?b=>filter({status:statusLabel(b.status),rawStatus:b.status,container:b.containerNumber}):()=>true);return <><Title title={title} subtitle={subtitle}/><Feedback loading={loading} error={error} onRetry={refresh}/>{!loading&&!error&&<div className="booking-grid">{rows.map(b=><Card b={b} key={b.id}/>)}</div>}{!loading&&!error&&!rows.length&&<Empty title="No containers to display" description="Containers associated with your bookings will appear here once available from yard operations." action/>}</>}
export function GateInPage(){const [q,setQ]=useState('');const {data,loading,error,refresh}=useClientData(clientApi.bookings);const rows=(data?.bookings||[]).filter(b=>/gate.in|stored|assigned|pending/.test(String(b.status))&&`${bookingLabel(b)} ${b.containerNumber}`.toLowerCase().includes(q.toLowerCase()));return <><Title title="Gate-In" subtitle="Current arrival and gate-in records. Yard approval is handled by administrators."/><label className="page-search unified-search"><Search size={17}/><input aria-label="Search bookings" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search reference or container…"/></label><Feedback loading={loading} error={error} onRetry={refresh}/>{!loading&&!error&&<div className="booking-grid">{rows.map(b=><Card b={b} key={b.id}/>)}</div>}{!loading&&!error&&!rows.length&&<Empty title="No gate-in records yet" description="Your gate-in records will appear here when yard operations have processed your container."/>}</>}
const adviceInitial = {containerNumber:'',containerSize:'',containerType:'',containerStatus:'',rateType:'',shippingLine:'',arrivalDate:'',scheduledTimeIn:'',truckPlateNumber:'',driverName:'',driverLicenseNumber:'',hauler:'',blNumber:'',vesselVoyage:'',cargoDescription:'',weight:'',remarks:''};
const documentFields = [['deliveryOrder','Delivery Order',true],['bookingConfirmation','Booking Confirmation',false],['packingList','Packing List',false],['customsClearance','Customs Clearance',false],['otherDocument','Other Document',false]];
function AdviceSelect({label,name,value,onChange,options,required=false}){return <label><span className="advice-label-text">{label}{required&&<span className="required-mark"> *</span>}</span><select required={required} name={name} value={value} onChange={e=>onChange(name,e.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>}
function AdviceBillingPreview({values}){
 const [state,setState]=useState({loading:false,rates:[],error:''});
 const classification=values.rateType==='international'?'International':'Domestic';
 useEffect(()=>{if(!values.rateType)return;let active=true;loadRates(classification).then(({rates})=>{if(active)setState({loading:false,rates,error:''})}).catch(err=>{if(active)setState({loading:false,rates:[],error:err.message||'Rates unavailable'})});setState({loading:true,rates:[],error:''});return()=>{active=false}},[classification,values.rateType]);
 const load=values.containerStatus==='laden'?'Loaded':'Empty';
 const size=values.containerSize?`${values.containerSize}ft`:'';
 const selected=state.rates.find(rate=>rate.trade===classification&&rate.load===load&&rate.size===size);
 const amount=value=>Number.isFinite(value)?peso(value):'Not configured';
 const total=selected&&Number.isFinite(selected.liftOn)&&Number.isFinite(selected.liftOff)?selected.liftOn+selected.liftOff:null;
 return <section className="advice-billing-preview" aria-label="Billing preview"><div className="advice-billing-preview-header"><h3>Billing preview</h3><span>From current backend rates</span></div>
 <p>Lift On and Lift Off charges are payable during Gate-In. Storage and additional applicable charges will be assessed and payable during the Gate-Out request, once storage duration is known.</p>
 {!values.rateType||!values.containerSize||!values.containerStatus?<div className="advice-billing-muted">Select transaction classification, container size and load status to view applicable charges.</div>:state.loading?<div className="advice-billing-muted" role="status">Loading configured rates…</div>:state.error?<div className="advice-billing-muted" role="alert">Unable to retrieve rates: {state.error}</div>:!selected?<div className="advice-billing-muted">No configured rate matches this selection. Ask the yard administrator for pricing.</div>:<><div className="advice-billing-line"><span>Lift Off (Gate-In)</span><strong>{amount(selected.liftOff)}</strong></div><div className="advice-billing-line"><span>Lift On (Gate-In)</span><strong>{amount(selected.liftOn)}</strong></div><div className="advice-billing-line advice-billing-total"><span>Estimated Gate-In handling</span><strong>{total===null?'Unavailable':peso(total)}</strong></div><div className="advice-billing-line"><span>Storage (rate per billable day)</span><strong>{amount(selected.storage)}</strong></div></>}
 <div className="advice-billing-muted">Storage total and other Gate-Out fees: To be determined. This is a rate preview, not a final invoice or payment request.</div></section>
}
export function PreAdvicePage(){
 const [values,setValues]=useState(adviceInitial),[files,setFiles]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 const [step,setStep]=useState(0);const scrollRef=useRef(null);
 const steps=['Container Details','Driver & Truck','Documents','Review & Submit'];
 const update=(name,value)=>{setError('');setValues(prev=>({...prev,[name]:value}))};
 const field=(name,label,{required=false,type='text',placeholder='',min,step:inputStep}={})=><label key={name}><span className="advice-label-text">{label}{required&&<span className="required-mark"> *</span>}</span><input name={name} required={required} type={type} placeholder={placeholder} min={min} step={inputStep} value={values[name]} onChange={e=>update(name,e.target.value)}/></label>;
 const [fileError,setFileError]=useState('');
 const handleFile=(key,file)=>{if(!file)return;const allowed=['application/pdf','image/jpeg','image/png'];const extension=/\.(pdf|jpe?g|png)$/i.test(file.name);if(!allowed.includes(file.type)||!extension){setFileError('Only PDF, JPG, and PNG documents are supported.');return}if(file.size>10*1024*1024){setFileError('Each document must be 10 MB or smaller.');return}setFileError('');setError('');setFiles(prev=>({...prev,[key]:file}));};
 const removeFile=key=>setFiles(prev=>{const next={...prev};delete next[key];return next});
 const requiredFields=[['containerNumber','Container Number'],['containerSize','Container Size'],['containerType','Container Type'],['containerStatus','Load Status'],['rateType','Transaction Classification'],['arrivalDate','Scheduled Date In'],['shippingLine','Shipping Line']];
 const driverFields=[['truckPlateNumber','Truck Plate Number'],['driverName','Driver Name'],['driverLicenseNumber','Driver License Number'],['hauler','Hauler'],['weight','Weight (kg)']];
 const validateStep=(current)=>{
  if(current===0){const missing=requiredFields.find(([key])=>!String(values[key]||'').trim());if(missing)return `${missing[1]} is required.`;
   if(!values.arrivalDate||values.arrivalDate<firstAvailableDate())return 'Choose a date with available future hourly slots.';if(values.scheduledTimeIn&&!hourIsAvailable(values.arrivalDate,values.scheduledTimeIn))return 'Choose a future time on a full-hour interval.';}
  if(current===1){const missing=driverFields.find(([key])=>!String(values[key]||'').trim());if(missing)return `${missing[1]} is required.`;
   if(!Number.isFinite(Number(values.weight))||Number(values.weight)<0)return 'Enter a valid weight in kilograms.';}
  if(current===2){if(!files.deliveryOrder)return 'Delivery Order or an equivalent supporting delivery document is required.';if(fileError)return fileError;}
  return '';
 };
 const moveTo=(next)=>{setError('');setFileError('');setStep(next);scrollRef.current?.scrollTo({top:0,behavior:'instant'});};
 const next=()=>{const issue=validateStep(step);if(issue){setError(issue);return;}moveTo(Math.min(steps.length-1,step+1));};
 const submittingRef=useRef(false);
 const submit=async ()=>{if(submittingRef.current||busy||step!==3)return;
  for(let i=0;i<3;i++){const issue=validateStep(i);if(issue){setStep(i);setError(issue);scrollRef.current?.scrollTo({top:0});return;}}
  submittingRef.current=true;setBusy(true);setError('');try{const fd=new FormData();Object.entries(values).forEach(([k,v])=>fd.append(k,v));Object.entries(files).forEach(([k,v])=>{if(v)fd.append(k,v)});setResult((await clientApi.createPreAdvice(fd)).preAdvice)}catch(err){setError(err.message||'Unable to submit pre-advice. Please try again.')}finally{submittingRef.current=false;setBusy(false)};
 };
 const summary=(entries)=>entries.map(([label,value])=><div className="advice-review-item" key={label}><span>{label}</span><strong>{value===undefined||value===null||value===''?'—':value}</strong></div>);
 return <div className="pre-advice-screen"><header className="pre-advice-header"><Link to="/bookings" className="pre-advice-close" aria-label="Back to bookings"><ArrowLeft size={21}/></Link><div><h1>New Pre-Advice</h1><p>Submit container, driver and document details for yard verification.</p></div></header>
 <div className="pre-advice-scroll" ref={scrollRef}>{result?<div className="panel"><h2>Pre-Advice Submitted</h2><p>Reference: <strong>{result.preAdviceNumber}</strong></p><Status value={result.status}/><p>Your request is awaiting administrator confirmation.</p><Link to="/bookings" className="lime-button">View bookings</Link></div>:<>
 <nav className="advice-stepper" aria-label="Pre-Advice steps">{steps.map((name,index)=><button key={name} type="button" className={`advice-step ${step===index?'current':''} ${index<step?'completed':''}`} aria-current={step===index?'step':undefined} onClick={()=>{if(index<=step)moveTo(index)}} disabled={index>step}><span className="advice-step-number">{index<step?<CheckCircle2 size={18}/>:index+1}</span><span>{name}</span></button>)}</nav>
 <form id="live-pre-advice" className="advice-form" noValidate onSubmit={e=>e.preventDefault()}>
 {step===0&&(
 <section className="advice-section"><div className="advice-section-heading"><PackageSearch size={24}/><div><h2>Container Details</h2><p>Enter the container information</p></div></div><div className="advice-grid">
 {field('containerNumber','Container Number',{required:true,placeholder:'Enter container number'})}
 <AdviceSelect label="Container Size" name="containerSize" value={values.containerSize} onChange={update} required options={[["20","20 ft"],["40","40 ft"]]}/>
 <AdviceSelect label="Container Type" name="containerType" value={values.containerType} onChange={update} required options={[["dry","Dry Container"],["reefer","Reefer (Refrigerated)"],["tank","Tank Container"],["open_top","Open Top"],["flat_rack","Flat Rack"]]}/>
 <AdviceSelect label="Load Status" name="containerStatus" value={values.containerStatus} onChange={update} required options={[["empty","Empty"],["laden","Laden (Loaded)"]]}/>
 <AdviceSelect label="Transaction Classification" name="rateType" value={values.rateType} onChange={update} required options={[["local","Local Transaction"],["international","International Transaction"]]}/>

 {field('arrivalDate','Scheduled Date In',{required:true,type:'date',min:firstAvailableDate()})}
 <label><span className="advice-label-text">Scheduled Time In</span><HourlyTimeSelect date={values.arrivalDate} value={values.scheduledTimeIn} onChange={value=>update("scheduledTimeIn",value)} id="scheduled-gate-in-time"/></label>
 {field('shippingLine','Shipping Line',{required:true,placeholder:'Enter shipping line'})}
 </div><AdviceBillingPreview values={values}/></section>

 )}
 {step===1&&(
 <section className="advice-section"><div className="advice-section-heading"><MapPin size={24}/><div><h2>Driver and Truck Details</h2><p>Enter the driver and truck information</p></div></div><div className="advice-grid">
 {field('truckPlateNumber','Truck Plate Number',{required:true,placeholder:'Enter truck plate number'})}
 {field('driverName','Driver Name',{required:true,placeholder:'Enter driver name'})}
 {field('driverLicenseNumber','Driver License Number',{required:true,placeholder:'Enter driver license number'})}
 {field('hauler','Hauler',{required:true,placeholder:'Enter hauler company'})}
 {field('blNumber','BL Number',{placeholder:'Enter BL number'})}
 {field('vesselVoyage','Vessel / Voyage',{placeholder:'Enter vessel / voyage'})}
 {field('weight','Weight (kg)',{required:true,type:'number',min:'0',step:'any',placeholder:'Enter weight in kg'})}
 <label><span className="advice-label-text">Cargo Description</span><textarea rows="2" value={values.cargoDescription} onChange={e=>update('cargoDescription',e.target.value)} placeholder="Enter cargo description"/></label>
 <label><span className="advice-label-text">Remarks</span><textarea rows="2" value={values.remarks} onChange={e=>update('remarks',e.target.value)} placeholder="Additional remarks"/></label>
 </div></section>

 )}
 {step===2&&(
 <section className="advice-section"><div className="advice-section-heading"><PackageSearch size={24}/><div><h2>Pre-Advice Documents</h2><p>Upload documents for administrator verification.</p></div></div><p className="advice-hint advice-doc-intro">Upload a Delivery Order or equivalent supporting delivery document. Files stay attached to this pre-advice until submission.</p>
 <div className="advice-documents-grid">{documentFields.map(([key,label,required])=><div className="advice-document-field" key={key}>
 <div className="advice-document-title"><span>{label}{required&&<span className="required-mark"> *</span>}</span><span className="advice-document-optional">{required?'Required':'Optional'}</span></div>
 <label className={`advice-upload-card ${files[key]?'has-file':''}`}>
 <input type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label={`Choose ${label}`} onChange={e=>{handleFile(key,e.target.files?.[0]);e.target.value=''}}/>
 {files[key]?<><UploadCheck size={25} aria-hidden="true"/><strong>File attached</strong><span className="advice-upload-action">Click to replace file</span></>:<><UploadCloud size={26} aria-hidden="true"/><strong>Choose file or drop here</strong><span className="advice-upload-action">Browse files</span></>}
 <small>PDF, JPG or PNG · Max 10 MB</small></label>
 {files[key]&&<div className="advice-attached-file"><FileText size={16} aria-hidden="true"/><span title={files[key].name}>{files[key].name}</span><button type="button" aria-label={`Remove ${label}`} title="Remove file" onClick={()=>removeFile(key)}><X size={16}/></button></div>}
 </div>)}</div>
 {fileError&&<p className="field-error" role="alert">{fileError}</p>}
 <p className="advice-doc-footnote">Documents will be available to authorized administrators for verification after submission.</p></section>

 )}
 {step===3&&<section className="advice-section"><div className="advice-section-heading"><CheckCircle2 size={24}/><div><h2>Review Your Pre-Advice</h2><p>Check everything carefully before submitting for yard verification.</p></div></div>
 <div className="advice-review-block"><div className="advice-review-title"><h3>Container Details</h3><button type="button" onClick={()=>moveTo(0)}>Edit</button></div><div className="advice-review-grid">{summary([['Container Number',values.containerNumber],['Size',values.containerSize?`${values.containerSize} ft`:null],['Type',values.containerType],['Load Status',values.containerStatus],['Transaction Classification',values.rateType],['Scheduled Date In',values.arrivalDate],['Scheduled Time In',values.scheduledTimeIn],['Shipping Line',values.shippingLine]])}</div><AdviceBillingPreview values={values}/></div>
 <div className="advice-review-block"><div className="advice-review-title"><h3>Driver and Truck Details</h3><button type="button" onClick={()=>moveTo(1)}>Edit</button></div><div className="advice-review-grid">{summary([['Truck Plate Number',values.truckPlateNumber],['Driver Name',values.driverName],['Driver License Number',values.driverLicenseNumber],['Hauler',values.hauler],['BL Number',values.blNumber],['Vessel / Voyage',values.vesselVoyage],['Weight (kg)',values.weight],['Cargo Description',values.cargoDescription],['Remarks',values.remarks]])}</div></div>
 <div className="advice-review-block"><div className="advice-review-title"><h3>Pre-Advice Documents</h3><button type="button" onClick={()=>moveTo(2)}>Edit</button></div><div className="advice-review-grid">{summary(documentFields.map(([key,label])=>[label,files[key]?.name||'Not attached']))}</div></div>
 <p className="advice-doc-footnote">Submitting sends your information and attached documents to yard administrators for verification. Your booking is not automatically approved.</p>
 </section>}
 {error&&<p className="field-error advice-step-error" role="alert">{error}</p>}
 </form></>}</div>
 {!result&&<footer className="pre-advice-footer"><div className="pre-advice-footer-inner">{step===0?<Link to="/bookings" className="outline-button"><ArrowLeft size={17}/> Back</Link>:<button type="button" className="outline-button" onClick={()=>moveTo(step-1)} disabled={busy}><ArrowLeft size={17}/> Back</button>}<span className="form-progress-label">Step {step+1} of {steps.length}</span>{step===3?<button type="button" onClick={submit} className="lime-button" disabled={busy}>{busy?'Submitting…':'Submit Pre-Advice'} <ArrowRight size={18}/></button>:<button type="button" className="lime-button" onClick={next}>{step===2?'Review Pre-Advice':'Next'} <ArrowRight size={18}/></button>}</div></footer>}
 </div>;
}
export function GateOutPage(){const [params]=useSearchParams();const {data,loading,error,refresh}=useClientData(clientApi.bookings);const eligible=(data?.bookings||[]).filter(canRequestGateOut);const [selection,setSelection]=useState(params.get('booking')||'');const [outDate,setOutDate]=useState('');const [busy,setBusy]=useState(false),[message,setMessage]=useState('');const submit=async e=>{e.preventDefault();if(!eligible.some(b=>b.id===selection)||!outDate||!validFutureOut(outDate))return;setBusy(true);setMessage('');try{await clientApi.gateOut(selection,toGateOutISO(outDate));setMessage('Gate-out request submitted for yard approval.');setSelection('');await refresh()}catch(e){setMessage(e.message)}finally{setBusy(false)}};return <><Title title="Request Gate-Out" subtitle="Only containers in assigned storage can request gate-out."/><Feedback loading={loading} error={error} onRetry={refresh}/>{!loading&&!error&&(eligible.length?<form className="panel form-panel demo-form" onSubmit={submit}><label className="form-full">Stored Container<select required value={eligible.some(b=>b.id===selection)?selection:''} onChange={e=>setSelection(e.target.value)}><option value="">Select a stored container</option>{eligible.map(b=><option key={b.id} value={b.id}>{b.containerNumber} — {bookingLabel(b)}</option>)}</select></label><div className="form-full"><OutDateTime value={outDate} onChange={setOutDate}/></div>{message&&<p role="status" className="form-full info-note">{message}</p>}<p className="form-full info-note">After submitting this request, open the booking details and pay using a configured bank or e-wallet method. Enter your payment reference and upload proof. An administrator must verify payment before approving Gate-Out.</p><button className="lime-button form-full" disabled={!eligible.some(b=>b.id===selection)||!validFutureOut(outDate)||busy}>{busy?'Submitting…':'Submit Gate-Out Request'} <ArrowRight size={17}/></button></form>:<Empty title="No containers eligible for gate-out" description="Only containers marked as stored in their assigned area can request gate-out. Cancelled and pending arrivals cannot request release."/>)}{!eligible.length&&message&&<p role="status" className="info-note">{message}</p>}</>}
