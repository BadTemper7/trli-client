import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Download,ExternalLink,Printer,X,FileText} from 'lucide-react';
import {api} from '../../lib/api';

/** Fetching the PDF always re-checks company ownership and pass approval on the server. */
export default function PassPreview({source='live',id,type,onClose}){
  const [url,setUrl]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  const frame=useRef(null);
  useEffect(()=>{let active=true;let blobUrl='';
    api.get(`/client/container-tracking/${source}/${id}/pass/${type}`,{responseType:'blob'})
      .then(({data})=>{if(!active)return;blobUrl=URL.createObjectURL(new Blob([data],{type:'application/pdf'}));setUrl(blobUrl);})
      .catch(err=>{if(active)setError(err.response?.data?.message||'Pass not available. Check approval status and try again.');})
      .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false;if(blobUrl)URL.revokeObjectURL(blobUrl)};
  },[source,id,type]);
  useEffect(()=>{const listener=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener)},[onClose]);
  const filename=`trans-roadway-${type.toLowerCase()}-${id}.pdf`;
  const print=()=>{if(frame.current?.contentWindow){try{frame.current.contentWindow.focus();frame.current.contentWindow.print();return;}catch{}}window.open(url,'_blank','noopener,noreferrer')};
  return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/75 p-2 sm:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="flex h-[min(95dvh,1000px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={`${type==='GATE_IN'?'Gate-in':'Gate-out'} Pass preview`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b p-3 sm:p-4"><div className="flex items-center gap-2 text-sm font-extrabold sm:text-lg"><FileText size={20}/> Trans Roadway · {type==='GATE_IN'?'Gate-in':'Gate-out'} Pass</div>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">{url&&<><a className="btn btn-primary" download={filename} href={url}><Download size={16}/> Download</a><button className="btn btn-secondary" onClick={print} type="button"><Printer size={16}/> Print</button><a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary" title="Open in PDF viewer (mobile fallback)"><ExternalLink size={16}/> Open</a></>}
        <button onClick={onClose} className="btn btn-secondary" type="button"><X size={17}/> Close</button></div>
      </header>
      {loading?<div className="grid flex-1 place-items-center text-sm text-slate-500">Loading approved pass…</div>:error?<div role="alert" className="m-5 rounded-xl bg-red-50 p-5 text-red-700">{error}</div>:<iframe ref={frame} title="Authorized Trans Roadway gate pass" src={url} className="h-full min-h-0 w-full flex-1 border-0 bg-slate-100"/>}
      <p className="border-t p-2 text-center text-xs text-slate-500">On phones, use Open if your browser does not display embedded PDF documents.</p>
    </section>
  </div>,document.body);
}
