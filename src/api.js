export const API_BASE=(import.meta.env.VITE_API_BASE_URL||'https://testapi.onetrue.ph').replace(/\/+$/,'');
const TOKEN_KEY='otl_client_token';
export const getToken=()=>sessionStorage.getItem(TOKEN_KEY);
export const saveToken=t=>sessionStorage.setItem(TOKEN_KEY,t);
export const clearToken=()=>sessionStorage.removeItem(TOKEN_KEY);
export async function api(path,{method='GET',body,signal}={}){
 const headers={Accept:'application/json'};
 if(getToken())headers.Authorization=`Bearer ${getToken()}`;
 if(body!=null&&!(body instanceof FormData))headers['Content-Type']='application/json';
 let response;
 try{response=await fetch(`${API_BASE}/api${path}`,{method,headers,body:body==null?undefined:body instanceof FormData?body:JSON.stringify(body),signal});}
 catch{throw Error('Cannot reach the server. Check your connection or try again.');}
 const result=await response.json().catch(()=>({}));
 if(!response.ok||result.success===false){const error=new Error(result.message||`Request failed (${response.status})`);error.status=response.status;throw error;}
 return result;
}
export const bookingStatus=s=>({pending:'Pending Approval',approved_area_assigned:'Pending Gate-In',gate_in_approved:'In Yard',stored_in_assigned_area:'In Yard',gate_out_requested:'Gate-Out Requested',gate_out_approved:'Gate-Out Approved',gate_out_reversal_requested:'Gate-Out Reversal Requested',completed_gate_out_done:'Released',rejected:'Rejected',cancelled:'Cancelled'}[s]||String(s||'Unknown').replaceAll('_',' '));
export function normalizeBooking(b){return {
 raw:b,uid:b.id,id:b.bookingReference||b.bookingNumber||b.id,container:b.containerNumber||'—',type:`${b.containerSize||''}FT ${b.containerType||''}`.trim(),
 status:bookingStatus(b.status),yard:b.assignedArea?.name||b.yardName||'Awaiting assignment',location:[b.assignedBlock?.code,b.assignedLocation,b.assignedSlot].filter(Boolean).join(' / ')||'Awaiting assignment',
 date:b.inDate||b.expectedArrivalDate||b.createdAt?new Date(b.inDate||b.expectedArrivalDate||b.createdAt).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}):'—',
 company:b.clientName||'',truck:b.truckPlateNumber||'',driver:b.driverName||'',days:b.storageDays||null
};}
export const gateOutEligible=b=>['stored_in_assigned_area','gate_in_approved'].includes(b?.raw?.status);
