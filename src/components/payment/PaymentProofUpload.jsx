import { useRef, useState } from 'react';
import { FileCheck2, FileImage, FileText, UploadCloud, X } from 'lucide-react';

export const MAX_PAYMENT_PROOF_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

export function validateProofFile(file) {
  if (!file) return '';
  if (!ALLOWED.includes(file.type)) return 'Only JPG, PNG, or PDF payment proofs are allowed.';
  if (file.size > MAX_PAYMENT_PROOF_SIZE) return 'The payment proof must not exceed 10 MB.';
  if (!file.size) return 'The uploaded file is empty.';
  return '';
}

export default function PaymentProofUpload({ value, onChange, disabled = false }) {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const accept = (file) => {
    const result = validateProofFile(file);
    setError(result);
    onChange(result ? null : file);
    if (result && input.current) input.current.value = '';
  };
  const remove = () => { onChange(null); setError(''); if (input.current) input.current.value = ''; };
  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold">Proof of payment <span className="text-muted-foreground">(optional with a reference)</span> <span className="font-normal text-muted-foreground">(JPG, PNG, or PDF · max 10 MB)</span></span>
      <div onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) accept(event.dataTransfer.files?.[0]); }}
        className={`relative rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragging ? 'border-brand-700 bg-brand-50' : 'border-slate-300 bg-slate-50/70'}`}>
        {value ? <div className="flex items-center justify-between gap-3 text-left">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{value.type === 'application/pdf' ? <FileText size={22}/> : <FileImage size={22}/>}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold" title={value.name}>{value.name}</p><p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)} MB · Ready to upload <FileCheck2 className="inline size-3.5 text-emerald-600"/></p></div>
          </div><button type="button" disabled={disabled} onClick={remove} className="rounded-lg border bg-white p-2 text-slate-700" aria-label="Remove uploaded proof"><X size={18}/></button>
        </div> : <div className="flex flex-col items-center gap-2"><UploadCloud className="size-9 text-brand-700"/><p className="text-sm font-semibold">Drop your payment screenshot or PDF here</p>
          <p className="text-xs text-muted-foreground">or choose a file from your device</p>
          <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="mt-1 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm ring-1 ring-slate-200">Choose File</button>
        </div>}
        <input ref={input} type="file" accept="image/png,image/jpeg,application/pdf,.jpg,.jpeg,.png,.pdf" className="sr-only" tabIndex={-1}
          onChange={(event) => accept(event.target.files?.[0])} disabled={disabled} aria-label="Upload proof of payment"/>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
