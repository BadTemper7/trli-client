import { BadgeCheck, Check, CreditCard, DoorOpen, Truck, Warehouse } from "lucide-react";

const DETAILED_ORDER = [
  "BOOKING_SUBMITTED",
  "BOOKING_APPROVED",
  "READY_FOR_GATE_IN",
  "GATE_IN_PAYMENT_SUBMITTED",
  "GATE_IN",
  "INVENTORY",
  "STORAGE",
  "GATE_OUT_REQUESTED",
  "GATE_OUT_PAYMENT_PENDING",
  "GATE_OUT_PAYMENT_SUBMITTED",
  "GATE_OUT_APPROVED",
  "READY_FOR_RELEASE",
  "CONTAINER_RELEASED",
];

const GROUPS = [
  { key: "BOOKING", label: "Booking", icon: BadgeCheck, stages: ["BOOKING_SUBMITTED", "BOOKING_APPROVED", "READY_FOR_GATE_IN"] },
  { key: "GATE_IN", label: "Gate-in", icon: Truck, stages: ["GATE_IN_PAYMENT_SUBMITTED", "GATE_IN"] },
  { key: "YARD", label: "Yard & Storage", icon: Warehouse, stages: ["INVENTORY", "STORAGE"] },
  { key: "GATE_OUT", label: "Gate-out", icon: CreditCard, stages: ["GATE_OUT_REQUESTED", "GATE_OUT_PAYMENT_PENDING", "GATE_OUT_PAYMENT_SUBMITTED", "GATE_OUT_APPROVED", "READY_FOR_RELEASE"] },
  { key: "RELEASED", label: "Released", icon: DoorOpen, stages: ["CONTAINER_RELEASED"] },
];

const LABELS = {
  BOOKING_SUBMITTED: "Booking submitted",
  BOOKING_APPROVED: "Booking approved",
  READY_FOR_GATE_IN: "Ready for gate-in",
  GATE_IN_PAYMENT_SUBMITTED: "Gate-in payment submitted",
  GATE_IN: "Gate-in completed",
  INVENTORY: "Added to inventory",
  STORAGE: "Stored in yard",
  GATE_OUT_REQUESTED: "Gate-out requested",
  GATE_OUT_PAYMENT_PENDING: "Waiting for payment",
  GATE_OUT_PAYMENT_SUBMITTED: "Payment submitted",
  GATE_OUT_APPROVED: "Gate-out approved",
  READY_FOR_RELEASE: "Ready for release",
  CONTAINER_RELEASED: "Container released",
};

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function groupIndexFor(stage) {
  const index = GROUPS.findIndex((group) => group.stages.includes(stage));
  return index < 0 ? 0 : index;
}

function entriesFor(group, history) {
  return history
    .filter((entry) => group.stages.includes(entry.stage))
    .sort((a, b) => DETAILED_ORDER.indexOf(a.stage) - DETAILED_ORDER.indexOf(b.stage));
}

export default function BookingProgressTimeline({ booking, invoices = [], onGateInPayment, onGateOutPayment }) {
  const gateInInvoice = invoices.find((item) => item.type === "GATE_IN");
  const gateOutInvoice = invoices.find((item) => item.type === "GATE_OUT");
  const gateInPaymentStatus = booking?.gateIn?.payment?.status;
  const gateOutPaymentStatus = booking?.gateOut?.payment?.status;
  const gateInLabel = gateInInvoice?.status === "PAID" ? "View Gate-in receipt" :
    gateInInvoice?.status === "PAYMENT_SUBMITTED" || gateInPaymentStatus === "PENDING_VERIFICATION" ? "View Gate-in payment" :
    gateInPaymentStatus === "REJECTED" ? "Resubmit Gate-in payment" : "Pay Gate-in charges";
  const gateOutLabel = gateOutInvoice?.status === "PAID" ? "View Gate-out receipt" :
    gateOutInvoice?.status === "PAYMENT_SUBMITTED" || gateOutPaymentStatus === "PENDING_VERIFICATION" ? "View Gate-out payment" :
    gateOutPaymentStatus === "REJECTED" ? "Resubmit Gate-out payment" : "Request Gate-out & payment";
  const paymentLinkClass = "inline-flex items-center text-xs font-bold text-brand-700 underline underline-offset-4 hover:text-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const history = booking?.workflowHistory || [];
  const currentStage = booking?.workflowStage || "BOOKING_SUBMITTED";
  const currentGroupIndex = groupIndexFor(currentStage);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">Container Tracking</p>
        <h2 className="mt-1 text-lg font-extrabold text-foreground">Container journey</h2>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <ol className="space-y-0">
          {GROUPS.map((group, index) => {
            const Icon = group.icon;
            const completed = index < currentGroupIndex;
            const current = index === currentGroupIndex;
            const upcoming = index > currentGroupIndex;
            const events = entriesFor(group, history);
            const visibleEvents = events.length ? events : [{ stage: group.stages[0], changedAt: null, placeholder: true }];

            return (
              <li key={group.key} className="grid grid-cols-[90px_34px_minmax(0,1fr)] gap-3 sm:grid-cols-[140px_40px_minmax(0,1fr)]">
                <div className={`pt-2 text-right text-sm font-bold ${upcoming ? "text-muted-foreground" : "text-foreground"}`}>
                  {group.label}
                </div>

                <div className="relative flex justify-center">
                  {index < GROUPS.length - 1 && <span className={`absolute bottom-0 top-9 w-px ${completed || current ? "bg-brand-300" : "bg-border"}`} />}
                  <span className={`relative z-10 mt-1 grid size-8 place-items-center rounded-full border-4 border-white shadow-sm ${current ? "bg-brand-600 text-white" : completed ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {completed ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                  </span>
                </div>

                <div className="pb-7 pt-1">
                  {current && (
                    <div className="mb-3 inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm">
                      Current Status: {LABELS[currentStage] || "Booking submitted"}
                    </div>
                  )}

                  <div className="space-y-3">
                    {visibleEvents.map((entry, eventIndex) => {
                      const isCurrentEvent = current && entry.stage === currentStage;
                      return (
                        <div key={`${entry.stage}-${eventIndex}`} className={entry.placeholder && upcoming ? "opacity-50" : ""}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-bold ${isCurrentEvent ? "text-brand-700" : upcoming ? "text-muted-foreground" : "text-foreground"}`}>
                              {LABELS[entry.stage] || entry.stage}
                            </span>
                            {!entry.placeholder && completed && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">Done</span>}
                          </div>
                          {entry.changedAt && <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.changedAt)}</div>}
                          {entry.note && <div className="mt-1 text-xs text-muted-foreground">{entry.note}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {group.key === "GATE_IN" && onGateInPayment && (
                    <div className="mt-3">
                      <button type="button" className={paymentLinkClass} onClick={onGateInPayment}>{gateInLabel}</button>
                      {gateInInvoice && <p className="mt-1 text-xs text-muted-foreground">{gateInInvoice.number} · {String(gateInInvoice.status || "UNPAID").replaceAll("_", " ")}</p>}
                    </div>
                  )}
                  {group.key === "GATE_OUT" && onGateOutPayment && (
                    <div className="mt-3">
                      <button type="button" className={paymentLinkClass} onClick={onGateOutPayment}>{gateOutLabel}</button>
                      {gateOutInvoice && <p className="mt-1 text-xs text-muted-foreground">{gateOutInvoice.number} · {String(gateOutInvoice.status || "UNPAID").replaceAll("_", " ")}</p>}
                    </div>
                  )}

                  {group.key === "YARD" && booking?.storage?.status === "STORED" && (
                    <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2 text-xs">
                      <span className="font-bold text-brand-700">Storage location:</span>{" "}
                      {booking.storage?.block?.name || "Assigned"}
                      {booking.storage?.bay ? ` · B${booking.storage.bay}-R${booking.storage.row}-T${booking.storage.tier}` : ""}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
