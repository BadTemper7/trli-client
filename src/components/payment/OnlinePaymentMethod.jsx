import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, Copy, CreditCard, Info, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

// Accounts must be configured in Admin > Payment Types before they can receive payments.
// Never invent fallback bank/account numbers on the client.
export default function OnlinePaymentMethod({ value, onChange, disabled = false }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get('/payment-types/active')
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        setMethods(list);
        const enabled = list.filter((method) => method.isConfigured);
        if (!enabled.some((method) => method.code === value)) {
          onChange(enabled[0]?.code || '');
        }
      })
      .catch((cause) => { if (!cancelled) { setMethods([]); onChange(''); setError(cause.response?.data?.message || 'Unable to load payment methods.'); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // Only fetch on initial mount or refresh, not on every parent render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);

  const usable = useMemo(() => methods.filter((item) => item.isConfigured), [methods]);
  const selected = usable.find((item) => item.code === value);
  const notReady = methods.filter((item) => !item.isConfigured);
  const copy = async (name, text) => {
    if (!text || !navigator.clipboard) return;
    try { await navigator.clipboard.writeText(text); setCopied(name); }
    catch { setCopied(''); }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold" htmlFor="online-payment-method">
        Online payment method <span className="text-red-600">*</span>
      </label>
      <select id="online-payment-method" required className="input w-full" value={value || ''}
        onChange={(event) => { setCopied(''); onChange(event.target.value); }} disabled={disabled || loading || usable.length === 0}>
        <option value="">{loading ? 'Loading payment methods…' : 'Select a payment method'}</option>
        {usable.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        {notReady.map((item) => <option key={item.code} value={item.code} disabled>{item.name} — account setup required</option>)}
      </select>
      {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
        <span>{error}</span><button type="button" className="font-bold underline" onClick={() => setRevision((n) => n + 1)}><RefreshCw size={15}/><span className="sr-only">Retry</span></button>
      </div>}
      {!loading && !error && !usable.length && <div role="status" className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>No receiving payment account is ready. Ask an administrator to open <strong>Admin → Payment Types</strong>, edit Bank/GCash/Maya/E-wallet, and save the correct account holder and number. Submission will become available after an account is configured.</p>
      </div>}
      {selected && <section aria-label="Receiving account details" className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 text-sm">
        <div className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Building2 size={18}/> Where to send your payment</div>
        <p className="mb-3 text-xs text-slate-600">Send the exact amount to the receiving account below. Then enter your transaction reference and upload proof of payment. The payment remains pending until verified by an administrator.</p>
        <dl className="space-y-2">
          {[["Payment provider",selected.bankName],["Account name",selected.accountName],["Account number",selected.accountNumber]].map(([label,text])=><div className="flex items-center justify-between gap-3 border-t border-sky-100 pt-2" key={label}>
            <div className="min-w-0"><dt className="text-xs text-slate-600">{label}</dt><dd className="break-all font-extrabold text-slate-950">{text}</dd></div>
            {label !== 'Payment provider' && <button type="button" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700" onClick={() => copy(label, text)} aria-label={`Copy ${label}`}>
              {copied === label ? <Check size={14}/> : <Copy size={14}/>} {copied === label ? 'Copied' : 'Copy'}
            </button>}
          </div>)}
        </dl>
        {selected.description && <p className="mt-3 border-t border-sky-100 pt-2 text-xs text-slate-600"><CreditCard className="mr-1 inline size-3.5"/>{selected.description}</p>}
      </section>}
    </div>
  );
}
