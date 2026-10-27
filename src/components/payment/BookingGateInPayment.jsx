import {useState} from 'react';
import {CreditCard, FileText, CheckCircle2} from 'lucide-react';
import {Link} from 'react-router-dom';
import {api} from '../../lib/api';
import OnlinePaymentMethod from './OnlinePaymentMethod';
import PaymentProofUpload,{validateProofFile} from './PaymentProofUpload';
const peso=n=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(n||0));

/** Uses the existing invoice GET/POST contracts without introducing API changes. */
export default function BookingGateInPayment({invoice,booking,onSubmitted}){
 const [method,setMethod]=useState(''),[reference,setReference]=useState(''),[proof,setProof]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 if(!invoice)return null;
 const unpaid=invoice.status==='UNPAID';
 const eligible = ['READY_FOR_GATE_IN','GATE_IN_PAYMENT_SUBMITTED'].includes(booking?.workflowStage) && !['CANCELLED','REJECTED'].includes(booking?.status);
 const submit=async e=>{e.preventDefault();if(!unpaid||!method||(!reference.trim()&&!proof)||validateProofFile(proof))return;setBusy(true);setError('');setNotice('');try{
   const form=new FormData();form.append('method',method);form.append('reference',reference.trim());form.append('amount',String(invoice.balance));if(proof)form.append('proof',proof);
   await api.post(`/invoices/${invoice._id}/payment`,form);
   setNotice('Payment submitted for verification. Wait for the admin decision before Gate-in.');setReference('');setProof(null);
   await onSubmitted?.();
 }catch(e){setError(e.response?.data?.message||'Unable to submit payment evidence.')}finally{setBusy(false)}};
 return <section className="rounded-2xl border border-brand-200 bg-brand-50/35 p-4 shadow-sm sm:p-5" aria-label="Gate-in invoice and payment">
  <div className="flex flex-wrap items-start justify-between gap-2"><div className="flex items-start gap-2"><span className="grid size-9 place-items-center rounded-xl bg-white text-brand-700"><CreditCard size={18}/></span><div><h2 className="font-extrabold">Gate-in invoice & payment</h2><p className="mt-1 text-sm text-muted-foreground">Invoice {invoice.number} · {invoice.status.replaceAll('_',' ')}</p></div></div><strong className="text-lg font-extrabold">{peso(invoice.total)}</strong></div>
  {notice&&<p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}{error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  {unpaid && eligible?<form onSubmit={submit} className="mt-4 space-y-4"><p className="text-sm text-muted-foreground">Pay online now, even before your scheduled arrival. Submit a reference number or a proof document, or both.</p><OnlinePaymentMethod value={method} onChange={setMethod} disabled={busy}/><label className="block text-sm font-semibold">Payment reference (optional if proof uploaded)<input className="input mt-1 w-full" maxLength={120} value={reference} onChange={e=>setReference(e.target.value)} disabled={busy} placeholder="Bank / e-wallet transaction number"/></label><PaymentProofUpload value={proof} onChange={setProof} disabled={busy}/><button type="submit" disabled={busy||!method||(!reference.trim()&&!proof)||!!validateProofFile(proof)} className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy?'Submitting…':'Submit Gate-in Payment for Verification'}</button><p className="text-xs text-muted-foreground">Payment submission is not payment verification. Physical Gate-in remains a separate admin action after inspection.</p></form> : <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/80 p-4 text-sm"><div className="flex items-start gap-2">{invoice.status==='PAID'?<CheckCircle2 className="mt-0.5 text-emerald-700" size={18}/>:<FileText className="mt-0.5 text-brand-700" size={18}/>}<p className="font-semibold">{invoice.status==='PAID'?'Gate-in payment verified. The terminal will inspect your container on arrival.':invoice.status==='PAYMENT_SUBMITTED'?'Payment evidence is under administrator review.':unpaid&&!eligible?'This booking is not currently eligible for online Gate-in payment. Contact the terminal if you need assistance.':'View invoice details and status under Payments & Receipts.'}</p></div><Link to="/portal/invoices" className="text-xs font-bold text-brand-700">View payment history</Link></div>}
 </section>;
}
