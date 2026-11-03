import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useNavigate} from 'react-router-dom';
import {Ban,FileText,MoreVertical,Pencil,Truck,Eye,Receipt} from 'lucide-react';
import {isGateOutEligible} from '../../lib/bookingJourney';
/** Clipped table wrappers cannot obscure menu because actions render into the document body. */
export default function BookingActions({booking,onCancel,onGateOut,onPass}){
  const [open,setOpen]=useState(false),[position,setPosition]=useState(null);
  const trigger=useRef(null),menu=useRef(null),navigate=useNavigate();
  useEffect(()=>{if(!open)return;
    const outside=e=>{if(!menu.current?.contains(e.target)&&!trigger.current?.contains(e.target))setOpen(false)};
    const close=()=>setOpen(false),escape=e=>{if(e.key==='Escape')close()};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    window.addEventListener('scroll',close,true);window.addEventListener('resize',close);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('scroll',close,true);window.removeEventListener('resize',close)};
  },[open]);
  const toggle=()=>{if(!open){const box=trigger.current?.getBoundingClientRect();if(box)setPosition({top:Math.min(box.bottom+6,window.innerHeight-14),left:Math.max(8,Math.min(box.right-216,window.innerWidth-224))});}setOpen(x=>!x)};
  const canEdit=booking.workflowStage==='BOOKING_SUBMITTED'&&['DRAFT','SUBMITTED'].includes(booking.status);
  const gateIn=Boolean(booking.gateIn?.actualGateInAt&&booking.gateIn?.inspection?.status==='ACCEPTED');
  const gateOut=Boolean(booking.gateOut?.approvedAt&&['APPROVED','RELEASED'].includes(booking.gateOut?.approvalStatus));
  const actions=[
    {name:'View details',icon:Eye,run:()=>navigate(`/portal/pre-advice/${booking._id}`)},
    {name:'Container journey',icon:Truck,run:()=>navigate(`/portal/containers/live/${booking._id}`)},
    ...(canEdit?[{name:'Edit booking',icon:Pencil,run:()=>navigate(`/portal/pre-advice/${booking._id}/edit`)}]:[]),
    ...(isGateOutEligible(booking)?[{name:booking.gateOut?.payment?.status==='REJECTED'?'Resubmit Gate-out':'Request Gate-out',icon:Truck,run:()=>onGateOut(booking)}]:[]),
    ...(gateIn?[{name:'Preview Gate-in pass',icon:FileText,run:()=>onPass(booking,'GATE_IN')}]:[]),
    ...(gateOut?[{name:'Preview Gate-out pass',icon:FileText,run:()=>onPass(booking,'GATE_OUT')}]:[]),
    {name:'Invoices & payments',icon:Receipt,run:()=>navigate('/portal/invoices')},
    ...(canEdit?[{name:'Cancel booking',icon:Ban,run:()=>onCancel(booking)}]:[]),
  ];
  return <><button ref={trigger} type="button" aria-label={`Actions for ${booking.bookingReference}`} aria-expanded={open} aria-haspopup="menu" onClick={toggle} className="rounded-lg border p-2 text-brand-700 hover:bg-brand-50 focus-visible:outline-2"><MoreVertical size={19}/></button>
    {open&&position&&createPortal(<div ref={menu} role="menu" aria-label={`Booking ${booking.bookingReference} actions`} className="fixed z-[999] max-h-[min(80dvh,480px)] w-[216px] overflow-y-auto rounded-xl border bg-white py-1 shadow-2xl" style={position}>
      {actions.map(action=><button key={action.name} role="menuitem" type="button" className="flex min-h-11 w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-100" onClick={()=>{setOpen(false);action.run()}}><action.icon size={16}/>{action.name}</button>)}
    </div>,document.body)}
  </>;
}
