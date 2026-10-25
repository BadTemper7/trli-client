import {apiRequest} from '../context/DemoAuth';
const root='/api/client';
export const clientApi={
 bookings:()=>apiRequest(`${root}/bookings?view=summary`),
 booking:id=>apiRequest(`${root}/bookings/${encodeURIComponent(id)}`),
 createBooking:form=>apiRequest(`${root}/bookings`,{method:'POST',body:form}),
 resubmitBooking:id=>apiRequest(`${root}/bookings/${encodeURIComponent(id)}/resubmit`,{method:'PATCH'}),
 gateOut:(id,outDate)=>apiRequest(`${root}/bookings/${encodeURIComponent(id)}/gate-out-request`,{method:'POST',body:JSON.stringify({outDate})}),
 reverseGateOut:id=>apiRequest(`${root}/bookings/${encodeURIComponent(id)}/gate-out-reversal-request`,{method:'POST',body:JSON.stringify({})}),
 payment:(id,form)=>apiRequest(`${root}/bookings/${encodeURIComponent(id)}/payment`,{method:'POST',body:form}),
 preAdvices:()=>apiRequest(`${root}/pre-advices`),
 createPreAdvice:form=>apiRequest(`${root}/pre-advices`,{method:'POST',body:form}),
 rates:()=>apiRequest(`${root}/rates`),
 rateNotice:()=>apiRequest(`${root}/rate-change-notice`),
 paymentTypes:()=>apiRequest(`${root}/payment-types`),
 notifications:()=>apiRequest(`${root}/notifications`),
 readNotification:id=>apiRequest(`${root}/notifications/${encodeURIComponent(id)}/read`,{method:'PATCH'}),
 readAllNotifications:()=>apiRequest(`${root}/notifications/read-all`,{method:'PATCH'}),
 status:()=>apiRequest(`${root}/account-status`),
 changePassword:(currentPassword,newPassword)=>apiRequest('/api/auth/change-password',{method:'PATCH',body:JSON.stringify({currentPassword,newPassword})}),
 forgotPassword:email=>apiRequest('/api/auth/forgot-password',{method:'POST',body:JSON.stringify({email})}),
 resetPassword:(token,password)=>apiRequest('/api/auth/reset-password',{method:'POST',body:JSON.stringify({token,password})}),
};
export const bookingLabel=b=>b.bookingReference||b.preAdviceNumber||b.id||'—';
export const dateLabel=date=>date?new Date(date).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'—';
export const statusLabel=status=>String(status||'pending').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
export const peso=value=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(value)||0);

export const canRequestGateOut=b=>b?.status==='stored_in_assigned_area';
export const canPayGateOut=b=>b?.status==='gate_out_requested'&&Boolean(b?.outDate)&&!['payment_submitted','payment_under_review','paid_approved'].includes(b?.billingStatus)&&Number(b?.paymentBalanceDue??b?.gateOutBillingTotal??0)>0;
