import { useEffect } from 'react';
import { CreditCard, FileText, ReceiptText, X } from 'lucide-react';
import BookingGateInPayment from './BookingGateInPayment';
import { downloadClientFile } from '../../lib/clientFiles';
import { useToast } from '../../context/ToastContext';

const money = amount => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount || 0));
const friendly = value => String(value || 'Not submitted').replaceAll('_', ' ');

/** Booking Journey payment details use existing invoice/payment endpoints only. */
export default function BookingPaymentModal({ booking, invoice, type = 'GATE_IN', onClose, onSubmitted }) {
  const { toast } = useToast();
  const isGateIn = type === 'GATE_IN';
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose]);
  const download = path => downloadClientFile(path).catch(error => toast(error.message || 'Unable to download document', 'error'));
  return <div role="presentation" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={`${isGateIn ? 'Gate-in' : 'Gate-out'} payment details`} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface p-4 sm:p-5">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><CreditCard size={21}/></span>
          <div><h2 className="text-lg font-extrabold text-foreground">{isGateIn ? 'Gate-in' : 'Gate-out'} payment</h2><p className="mt-1 text-xs text-muted-foreground">{booking.bookingReference} · {booking.containerNumber}</p><p className="mt-1 text-xs text-muted-foreground">Payment verification and physical container movement are separate steps.</p></div>
        </div>
        <button type="button" aria-label="Close payment modal" onClick={onClose} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"><X size={19}/></button>
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        {!invoice ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{isGateIn ? 'Your Gate-in invoice is not available yet. It will be issued after Pre-advice approval.' : 'Your Gate-out invoice is generated when you submit a Gate-out request with its payment details.'}</div> : <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm"><div><p className="text-xs font-semibold text-muted-foreground">Invoice {invoice.number}</p><p className="mt-1 font-bold">{friendly(invoice.status)}</p></div><strong className="text-lg font-extrabold">{money(invoice.total)}</strong></div>
          <div className="divide-y divide-border rounded-xl border border-border px-4 py-2 text-sm">{(invoice.lines || []).map((line, index) => <div key={`${line.description}-${index}`} className="flex items-center justify-between gap-3 py-2"><span>{line.description} × {line.quantity}</span><strong className="whitespace-nowrap">{money(line.amount)}</strong></div>)}<div className="flex justify-between pt-3"><span>Subtotal</span><strong>{money(invoice.subtotal)}</strong></div><div className="flex justify-between py-2"><span>VAT</span><strong>{money(invoice.vat)}</strong></div><div className="flex justify-between pb-2 text-base font-extrabold"><span>Total</span><span>{money(invoice.total)}</span></div></div>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={() => download(`/invoices/${invoice._id}/pdf`)} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 underline underline-offset-4"><FileText size={16}/>Download invoice</button>{invoice.status === 'PAID' && <button type="button" onClick={() => download(`/invoices/${invoice._id}/receipt`)} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 underline underline-offset-4"><ReceiptText size={16}/>Download receipt</button>}</div>
          {isGateIn ? <BookingGateInPayment key={invoice._id} booking={booking} invoice={invoice} onSubmitted={onSubmitted} /> : <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">{invoice.status === 'PAID' ? 'Gate-out payment has been verified. Actual physical release must still be confirmed by terminal staff.' : invoice.status === 'PAYMENT_SUBMITTED' ? 'Your Gate-out payment is pending verification. Admin approval will follow successful verification.' : 'Gate-out requests and payment are submitted together through the Request Gate-out modal. See the Gate-out milestone for any available action.'}</p>}
        </>}
      </div>
    </section>
  </div>;
}
