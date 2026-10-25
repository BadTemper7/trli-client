import {subscribeRealtime} from './realtime';
import {useCallback,useEffect,useState} from 'react';
export default function useClientData(loader,dependencies=[]){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const refresh=useCallback(async({silent=false}={})=>{if(!silent)setLoading(true);setError('');try{const result=await loader();setData(result);return result;}catch(e){setError(e.message);return null;}finally{if(!silent)setLoading(false)}},dependencies);
 useEffect(()=>{let pending=false;let t;const unsubscribe=subscribeRealtime(event=>{
  if(!/^(booking:|notification:|preAdvice:|gateIn:|gateOut:|account:|client:|billing:|rate:|realtime:)/.test(event))return;
  if(pending)return;pending=true;t=setTimeout(()=>{pending=false;refresh({silent:true})},200);
 });return()=>{clearTimeout(t);unsubscribe()}},[refresh]);
 useEffect(()=>{let mounted=true;setLoading(true);setError('');loader().then(value=>{if(mounted)setData(value)}).catch(e=>{if(mounted)setError(e.message)}).finally(()=>{if(mounted)setLoading(false)});return()=>{mounted=false}},dependencies);
 return {data,loading,error,refresh};
}
