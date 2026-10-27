/** UI eligibility only. Server invoice/payment endpoints remain authoritative. */
const APPROVED_STAGES = new Set([
  'READY_FOR_GATE_IN', 'GATE_IN_PAYMENT_SUBMITTED', 'GATE_IN', 'INVENTORY', 'STORAGE',
  'GATE_OUT_REQUESTED', 'GATE_OUT_PAYMENT_PENDING', 'GATE_OUT_PAYMENT_SUBMITTED',
  'GATE_OUT_APPROVED', 'READY_FOR_RELEASE', 'CONTAINER_RELEASED',
]);

export function canOpenGateInPayment(booking, invoice) {
  if (!booking || ['CANCELLED', 'REJECTED'].includes(booking.status)) return false;
  const approved = booking.preAdviceReview?.decision === 'APPROVED' ||
    APPROVED_STAGES.has(booking.workflowStage) ||
    ['READY_FOR_GATE_IN', 'GATED_IN', 'COMPLETED'].includes(booking.status);
  // Never show a Pay action until pre-advice has been approved.
  // After approval show it even if the invoice-list fetch is delayed/missing;
  // opening the modal can retrieve the server-issued invoice.
  return Boolean(approved);
}

export function gateInPaymentPresentation(invoice, paymentStatus) {
  const status = invoice?.status || 'UNPAID';
  const state = status === 'PAID' || paymentStatus === 'VERIFIED' ? 'VERIFIED' :
    status === 'PAYMENT_SUBMITTED' || ['SUBMITTED', 'PENDING_VERIFICATION'].includes(paymentStatus) ? 'PENDING VERIFICATION' :
    paymentStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';
  const action = state === 'VERIFIED' ? 'View Gate-in receipt' :
    state === 'PENDING VERIFICATION' ? 'View Gate-in payment status' :
    state === 'REJECTED' ? 'Resubmit Gate-in payment' : 'Pay Gate-in charges';
  return { state, action, invoiceStatus: status };
}
