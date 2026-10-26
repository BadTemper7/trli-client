import {api} from '../lib/api';
/** Legacy rate panels read the same active Admin Rate Setup API as the new Rates screen. */
export async function loadRates(trade='Domestic') {
  const response=await api.get('/rates');
  const rows=response.data?.data;
  if(!Array.isArray(rows))throw new Error('Server did not return an active rate schedule.');
  const classification=trade==='International'?'INTERNATIONAL':'LOCAL';
  const eligible=rows.filter(r=>r.classification===classification&&r.containerCategory!=='REEFER');
  const result=[];
  for(const load of ['Empty','Loaded'])for(const size of ['20ft','40ft']){
    const applicable=eligible.filter(r=>r.loadStatus===load.toUpperCase() && (r.containerSize===size.toUpperCase()||r.containerSize==='ALL'));
    const selected={};
    for(const [name,key] of [['Lift On','liftOn'],['Lift Off','liftOff'],['Storage','storage']]){
      const choices=applicable.filter(r=>r.name===name).sort((a,b)=>Number(b.containerSize===size.toUpperCase())-Number(a.containerSize===size.toUpperCase()));
      selected[key]=choices.length?Number(choices[0].amount):null;
    }
    if(Object.values(selected).some(v=>v!==null))result.push({trade,load,size,...selected});
  }
  return {source:'api',rates:result};
}
