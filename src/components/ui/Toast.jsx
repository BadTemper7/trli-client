import {useEffect} from 'react';
import {AlertCircle,CheckCircle2,X} from 'lucide-react';
export default function Toast({toast,onClose}){
  useEffect(()=>{if(!toast)return;const t=setTimeout(onClose,4800);return()=>clearTimeout(t)},[toast,onClose]);
  if(!toast)return null;
  const Icon=toast.type==='success'?CheckCircle2:AlertCircle;
  return <div className={`app-toast ${toast.type||'error'}`} role="alert" aria-live="assertive"><Icon size={20}/><span>{toast.message}</span><button type="button" onClick={onClose} aria-label="Dismiss notification"><X size={17}/></button></div>;
}
