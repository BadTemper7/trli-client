/**
 * Presentation-only interpretation of the existing booking API.
 * No new statuses or backend endpoints are introduced here.
 */
const text = (value) => String(value || '').replaceAll('_', ' ');

export function isGateOutEligible(booking) {
  return Boolean(booking && booking.workflowStage === 'STORAGE' &&
    booking.storage?.status === 'STORED' &&
    !booking.gateOut?.approvedAt && !booking.gateOut?.releasedAt &&
    booking.gateOut?.payment?.status !== 'SUBMITTED');
}

export function isGateOutRelated(booking) {
  return Boolean(isGateOutEligible(booking) ||
    booking?.gateOut?.requestedAt || booking?.gateOut?.approvedAt ||
    booking?.gateOut?.releasedAt ||
    ['GATE_OUT_REQUESTED','GATE_OUT_PAYMENT_SUBMITTED','GATE_OUT_APPROVED','READY_FOR_RELEASE','CONTAINER_RELEASED'].includes(booking?.workflowStage));
}

const CLIENT = 'Client';
const ADMIN = 'Terminal operations';
const PAYMENTS = 'Payment verification team';
const NONE = 'Completed';

export function bookingNextAction(booking, invoices = []) {
  if (!booking) return { title: 'View booking', description: 'Open booking details to see the current status.', owner: CLIENT, tone: 'neutral', action: 'details' };
  const stage = booking.workflowStage || 'BOOKING_SUBMITTED';
  const rejectedBooking = booking.status === 'REJECTED' || booking.preAdviceReview?.decision === 'REJECTED';
  if (rejectedBooking && stage === 'BOOKING_SUBMITTED') return {
    title: 'Review booking rejection', description: booking.preAdviceReview?.reason || 'Review the rejection reason in your booking details.', owner: CLIENT, tone: 'danger', action: 'details', status: 'Rejected',
  };
  if (booking.status === 'CANCELLED') return { title: 'Booking cancelled', description: 'This booking is no longer active.', owner: NONE, tone: 'neutral', action: 'details', status: 'Cancelled' };
  if (stage === 'CONTAINER_RELEASED' || booking.gateOut?.releasedAt || booking.status === 'COMPLETED') return { title: 'Booking completed', description: 'The container has been physically released. View your documents and final history.', owner: NONE, tone: 'success', action: 'details', status: 'Completed' };
  if (['GATE_OUT_APPROVED','READY_FOR_RELEASE'].includes(stage) || booking.gateOut?.approvalStatus === 'APPROVED') return { title: 'Waiting for physical release', description: 'Gate-out and payment are approved. Terminal staff must confirm the container has left.', owner: ADMIN, tone: 'info', action: 'details', status: 'In progress' };
  if (['GATE_OUT_REQUESTED','GATE_OUT_PAYMENT_PENDING','GATE_OUT_PAYMENT_SUBMITTED'].includes(stage) || booking.gateOut?.payment?.status === 'SUBMITTED') return { title: 'Gate-out request under review', description: 'Your gate-out request and payment evidence are awaiting admin verification.', owner: PAYMENTS, tone: 'warning', action: 'details', status: 'Pending' };
  if (isGateOutEligible(booking)) return { title: booking.gateOut?.payment?.status === 'REJECTED' ? 'Correct and resubmit Gate-out payment' : 'Request Gate-out', description: booking.gateOut?.payment?.status === 'REJECTED' ? (booking.gateOut?.remarks || 'The previous request was rejected. You may submit a corrected request.') : 'Your container is stored. Select a release schedule and submit payment evidence.', owner: CLIENT, tone: booking.gateOut?.payment?.status === 'REJECTED' ? 'danger' : 'action', action: 'gateOut', status: 'Action required' };
  if (stage === 'STORAGE') return { title: 'Container in storage', description: 'Terminal staff will maintain the yard location. Gate-out is available when the container is eligible.', owner: ADMIN, tone: 'info', action: 'details', status: 'In progress' };
  if (['GATE_IN','INVENTORY'].includes(stage) || booking.gateIn?.actualGateInAt) return { title: 'Waiting for storage assignment', description: 'The container has entered the terminal. Terminal staff will assign the storage slot.', owner: ADMIN, tone: 'info', action: 'details', status: 'In progress' };
  if (booking.gateIn?.inspection?.status === 'REJECTED') return { title: 'Gate-in inspection rejected', description: booking.gateIn.inspection.rejectionReason || 'Contact the terminal team about the inspection findings.', owner: CLIENT, tone: 'danger', action: 'details', status: 'Rejected' };
  const verifiedPayment = booking.gateIn?.payment?.status === 'VERIFIED' || invoices.some(i => i.type === 'GATE_IN' && i.status === 'PAID');
  if (verifiedPayment) return { title: 'Awaiting arrival and inspection', description: 'Gate-in payment is verified. Arrive at the scheduled time; terminal staff will inspect and confirm physical entry.', owner: ADMIN, tone: 'info', action: 'details', status: 'In progress' };
  const paymentPending = booking.gateIn?.payment?.status === 'SUBMITTED' || ['GATE_IN_PAYMENT_SUBMITTED'].includes(stage) || invoices.some(i => i.type === 'GATE_IN' && i.status === 'PAYMENT_SUBMITTED');
  if (paymentPending) return { title: 'Gate-in payment under verification', description: 'An administrator must verify the submitted payment before physical Gate-in.', owner: PAYMENTS, tone: 'warning', action: 'details', status: 'Pending' };
  const approved = ['READY_FOR_GATE_IN','BOOKING_APPROVED'].includes(stage) || booking.preAdviceReview?.decision === 'APPROVED' || ['READY_FOR_GATE_IN','GATED_IN'].includes(booking.status);
  if (approved) return { title: booking.gateIn?.payment?.status === 'REJECTED' ? 'Resubmit Gate-in payment' : 'Pay Gate-in invoice', description: booking.gateIn?.payment?.status === 'REJECTED' ? 'Your payment evidence was rejected. Submit a new reference or proof under Payments & Receipts.' : 'Your booking is approved. You can pay before the scheduled Gate-in date.', owner: CLIENT, tone: booking.gateIn?.payment?.status === 'REJECTED' ? 'danger' : 'action', action: 'payment', status: 'Action required' };
  if (booking.status === 'DRAFT') return { title: 'Complete your booking', description: 'Finish the required booking information and submit it for review.', owner: CLIENT, tone: 'action', action: 'edit', status: 'Action required' };
  return { title: 'Awaiting pre-advice approval', description: 'Terminal staff will review your submitted booking and notify you of the decision.', owner: ADMIN, tone: 'warning', action: 'details', status: 'Pending' };
}

export const journeyStatusLabel = (value) => text(value) || 'Not available';

export function bookingJourneySteps(booking, invoices = []) {
  const history = booking?.workflowHistory || [];
  const entry = (...stages) => history.find(h => stages.includes(h.stage));
  const gateInInvoice = invoices.find(i => i.type === 'GATE_IN');
  const gateOutInvoice = invoices.find(i => i.type === 'GATE_OUT');
  const gateInPaid = booking?.gateIn?.payment?.status === 'VERIFIED' || gateInInvoice?.status === 'PAID';
  const gateOutPaid = booking?.gateOut?.payment?.status === 'VERIFIED' || gateOutInvoice?.status === 'PAID';
  const step = (key, title, at, note = '') => ({ key, title, completed: Boolean(at), at, note });
  return [
    step('submitted','Booking submitted',entry('BOOKING_SUBMITTED')?.changedAt || booking?.createdAt),
    step('approved','Pre-advice approved',booking?.preAdviceReview?.decision === 'APPROVED' ? booking.preAdviceReview.reviewedAt || entry('BOOKING_APPROVED')?.changedAt || booking.updatedAt : entry('BOOKING_APPROVED')?.changedAt),
    step('invoice','Gate-in invoice generated',gateInInvoice?.createdAt,gateInInvoice?.number),
    step('payment-submitted','Gate-in payment submitted',booking?.gateIn?.payment?.submittedAt || entry('GATE_IN_PAYMENT_SUBMITTED')?.changedAt),
    step('payment-verified','Gate-in payment verified',gateInPaid ? (gateInInvoice?.paidAt || gateInInvoice?.updatedAt || booking?.gateIn?.payment?.verifiedAt || entry('GATE_IN_PAYMENT_VERIFIED')?.changedAt || booking?.updatedAt) : null),
    step('gate-in','Container gated in',booking?.gateIn?.actualGateInAt),
    step('inventory','Added to inventory',booking?.inventory?.receivedAt || entry('INVENTORY')?.changedAt),
    step('storage','Stored in yard',booking?.storage?.storedAt || entry('STORAGE')?.changedAt),
    step('gateout-submitted','Gate-out request & payment submitted',booking?.gateOut?.requestedAt || entry('GATE_OUT_PAYMENT_SUBMITTED')?.changedAt),
    step('gateout-verified','Gate-out payment verified',gateOutPaid ? (gateOutInvoice?.paidAt || gateOutInvoice?.updatedAt || booking?.gateOut?.payment?.verifiedAt || entry('GATE_OUT_APPROVED')?.changedAt || booking?.gateOut?.approvedAt) : null),
    step('gateout-approved','Gate-out approved',booking?.gateOut?.approvedAt || entry('GATE_OUT_APPROVED')?.changedAt),
    step('released','Container physically released',booking?.gateOut?.releasedAt || entry('CONTAINER_RELEASED')?.changedAt),
    step('complete','Completed',booking?.gateOut?.releasedAt || entry('CONTAINER_RELEASED')?.changedAt),
  ];
}
