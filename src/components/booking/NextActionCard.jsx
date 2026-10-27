import { ArrowRight, BadgeCheck, Clock3, AlertTriangle, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookingNextAction } from '../../lib/bookingJourney';

const toneStyles = {
  action: 'border-brand-200 bg-brand-50/80',
  danger: 'border-red-200 bg-red-50/80',
  warning: 'border-amber-200 bg-amber-50/80',
  success: 'border-emerald-200 bg-emerald-50/80',
  info: 'border-sky-200 bg-sky-50/80',
  neutral: 'border-border bg-muted/50',
};

export default function NextActionCard({ booking, invoices = [], onGateOut, onPayment, compact = false }) {
  const next = bookingNextAction(booking, invoices);
  const actionLink = next.action === 'payment' ? '/portal/invoices' :
    next.action === 'edit' ? `/portal/pre-advice/${booking._id}/edit` : `/portal/pre-advice/${booking._id}`;
  const clickable = next.action === 'gateOut' ? Boolean(onGateOut) : next.action === 'payment' ? true : next.action === 'edit';
  return <section aria-label="Next step" className={`rounded-2xl border p-4 ${toneStyles[next.tone] || toneStyles.neutral} ${compact ? '' : 'sm:p-5'}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/80 text-brand-700 shadow-sm">{next.tone === 'danger' ? <AlertTriangle size={19} /> : next.tone === 'success' ? <BadgeCheck size={19}/> : <Clock3 size={19}/>}</span>
        <div className="min-w-0"><p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{next.status || 'Next step'}</p><h3 className="mt-1 text-base font-extrabold text-foreground">{next.title}</h3><p className="mt-1 text-sm leading-5 text-foreground/75">{next.description}</p><div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><UserRound size={13}/> Responsible: {next.owner}</div></div>
      </div>
      {clickable && (next.action === 'gateOut' ? <button type="button" onClick={onGateOut} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800">{next.title}<ArrowRight size={15}/></button> : next.action === 'payment' && onPayment ? <button type="button" onClick={onPayment} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800">{next.title}<ArrowRight size={15}/></button> : <Link to={actionLink} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800">{next.title}<ArrowRight size={15}/></Link>)}
    </div>
  </section>;
}
