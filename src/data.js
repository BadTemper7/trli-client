export const bookings = [
  { id:'OTL-2026-0045',container:'OTLU2026045',type:'40FT Dry',yard:'Yard A',location:'Block C-02 / Slot 08',status:'Awaiting Payment',date:'Oct 16, 2026',company:'ABC Trucking',days:7,gateOutApproved:true,paymentStatus:'Pending',receiptStatus:'Not issued',releaseStatus:'Pending payment',demo:true },
  { id:'OTL-2026-0042',container:'TCLU1234567',type:'40FT High Cube',yard:'Yard A',location:'Block B-03 / Slot 12',status:'In Yard',date:'Oct 02, 2026',truck:'ABC 1234',driver:'Pedro Santos',company:'ABC Trucking',days:12 },
  { id:'OTL-2026-0043',container:'MSCU7654321',type:'20FT Dry',yard:'Yard B',location:'Awaiting assignment',status:'Pending Gate-In',date:'Oct 12, 2026',company:'ABC Trucking' },
  { id:'OTL-2026-0044',container:'CMAU3456789',type:'40FT Dry',yard:'Yard C',location:'Awaiting assignment',status:'Pending Approval',date:'Oct 14, 2026',company:'ABC Trucking' },
  { id:'OTL-2026-0041',container:'TRHU9876543',type:'20FT Dry',yard:'Yard A',location:'Released',status:'Released',date:'Sep 28, 2026',company:'ABC Trucking' },
];
export const activities = [
 { id:'OTL-2026-0045', title:'Gate-Out Approved • Awaiting Payment', date:'Oct 16, 2026',time:'02:30 PM',kind:'pending' },
 { id:'OTL-2026-0044', title:'Pre-Advice Pending', date:'Oct 14, 2026',time:'09:15 AM',kind:'pending' },
 { id:'OTL-2026-0042', title:'Gate-In Approved', date:'Oct 02, 2026',time:'10:24 AM',kind:'truck' },
 { id:'OTL-2026-0041', title:'Container Released', date:'Sep 28, 2026',time:'03:45 PM',kind:'container' },
 { id:'OTL-2026-0040', title:'Gate-Out Request Submitted', date:'Sep 27, 2026',time:'11:30 AM',kind:'out' },
];
export const photo = {
 yard: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1600&q=85',
 stack: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=85',
 truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=85',
 terminal: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=85',
};
export const isGateOutEligible = (b) => b?.status === 'In Yard';
