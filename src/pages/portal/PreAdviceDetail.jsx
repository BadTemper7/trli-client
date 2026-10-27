import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, FileText, Package, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import BookingProgressTimeline from "../../components/booking/BookingProgressTimeline";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import TableSkeleton from "../../components/ui/TableSkeleton";
import GateOutRequest from "../../components/booking/GateOutRequest";
import BookingPaymentModal from "../../components/payment/BookingPaymentModal";
import { isGateOutEligible } from "../../lib/bookingJourney";
import { canOpenGateInPayment } from "../../lib/gateInPaymentAccess";

const labels = {
  containerNumber: "Container Number", containerSize: "Container Size", containerType: "Container Type", loadStatus: "Load Status",
  transactionClassification: "Classification", scheduledGateDateIn: "Scheduled Gate Date In", scheduledGateTimeIn: "Scheduled Gate Time In",
  shippingLine: "Shipping Line", truckPlateNumber: "Truck Plate Number", driverName: "Driver Name", driverLicenceNumber: "Driver Licence Number",
  hauler: "Hauler", blNumber: "BL Number", vesselVoyage: "Vessel / Voyage", weight: "Weight", cargoDescription: "Cargo Description", remarks: "Remarks",
};
const pretty = (value) => value ? String(value).replaceAll("_", " ") : "—";

function DetailPanel({ title, keys, booking, Icon }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-4" /></span><h2 className="font-extrabold text-foreground">{title}</h2></div>
      <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
        {keys.map((key) => <div key={key} className="border-b border-border py-3"><dt className="text-xs font-semibold text-muted-foreground">{labels[key]}</dt><dd className="mt-1 text-sm font-bold text-foreground">{pretty(booking[key])}</dd></div>)}
      </dl>
    </section>
  );
}

export default function PreAdviceDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [gateOutOpen, setGateOutOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [recoveredGateInInvoice, setRecoveredGateInInvoice] = useState(null);
  const [openingGateInPayment, setOpeningGateInPayment] = useState(false);
  const [invoices,setInvoices]=useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { toast } = useToast();

  const refresh = useCallback(() => Promise.all([api.get(`/pre-advice/${id}`), api.get('/invoices')]).then(([bookingResponse, invoiceResponse]) => {
    setBooking(bookingResponse.data?.data?.item || null);
    setInvoices((invoiceResponse.data?.data?.items || []).filter(i => String(i.booking?._id || i.booking) === String(id)));
  }), [id]);
  useEffect(() => {
    let active = true;
    Promise.allSettled([api.get(`/pre-advice/${id}`), api.get('/invoices')]).then(([bookingResult, invoiceResult]) => {
      if (!active) return;
      if (bookingResult.status === 'fulfilled') setBooking(bookingResult.value.data.data.item);
      else toast(bookingResult.reason?.response?.data?.message || 'Unable to load booking', 'error');
      if (invoiceResult.status === 'fulfilled') setInvoices((invoiceResult.value.data?.data?.items || []).filter(i => String(i.booking?._id || i.booking) === String(id)));
    }).finally(() => {if (active) setLoading(false)});
    return () => {active = false};
  }, [id, toast]);

  useEffect(() => {
    // Invoice updates and workflow events can arrive independently. Always reload the
    // authoritative booking/invoice pair; a partial socket payload is not a full record.
    const relevant = payload => !payload ||
      [payload.id, payload.bookingId, payload.booking?._id, payload.booking].some(candidate => String(candidate || '') === String(id));
    const handleUpdate = payload => { if (relevant(payload)) refresh().catch(() => {}); };
    const handleConnect = () => refresh().catch(() => {});
    const events = ["pre-advice:updated", "pre-advice:status-updated", "pre-advice:workflow-updated", "invoice:updated"];
    events.forEach(event => socket.on(event, handleUpdate));
    socket.on('connect', handleConnect);
    return () => { events.forEach(event => socket.off(event, handleUpdate)); socket.off('connect', handleConnect); };
  }, [socket, id, refresh]);

  const gateInInvoice = invoices.find(invoice => invoice.type === 'GATE_IN') || recoveredGateInInvoice;
  const gateOutInvoice = invoices.find(invoice => invoice.type === 'GATE_OUT');
  const canAccessGateInPayment = canOpenGateInPayment(booking, gateInInvoice);

  const onGateInPayment = async () => {
    if (openingGateInPayment) return;
    setOpeningGateInPayment(true);
    try {
      // If the invoice list hasn't returned an existing Gate-in invoice, the
      // backend's idempotent endpoint retrieves/generates it after approval.
      // The action must remain visible for approved bookings while it loads.
      if (!gateInInvoice) {
        const response = await api.post(`/invoices/booking/${id}`, { type: 'GATE_IN' });
        const invoice = response.data?.data?.invoice;
        if (!invoice?._id) throw new Error('The terminal has not issued a Gate-in invoice yet.');
        setRecoveredGateInInvoice(invoice);
        refresh().catch(() => {});
      }
      setPaymentModal('GATE_IN');
    } catch (error) {
      toast(error.response?.data?.message || error.message || 'Unable to load Gate-in invoice.', 'error');
    } finally {
      setOpeningGateInPayment(false);
    }
  };
  const onGateOutPayment = () => {
    if (isGateOutEligible(booking)) setGateOutOpen(true);
    else if (gateOutInvoice) setPaymentModal('GATE_OUT');
  };

  if (loading) return <TableSkeleton rows={6} columns={3} />;
  if (!booking) return <div className="card p-6">Booking not found.</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <header className="border-b border-border px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-3">
            <Link to="/portal/pre-advice" className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-muted"><ArrowLeft className="size-4" /></Link>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-900 text-white"><Package className="size-5" /></span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-[-.025em] text-foreground sm:text-2xl">{booking.containerNumber}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{pretty(booking.containerType)}</span><span>•</span><span>{booking.containerSize || "—"} Container</span><span>•</span><span>{booking.bookingReference}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Current Status</div>
              <div className="mt-1 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">{pretty(booking.workflowStage || booking.status)}</div>
              <div className="mt-2 text-xs font-semibold text-foreground">Gate-in {booking.scheduledGateDateIn || "—"} {booking.scheduledGateTimeIn || ""}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        <BookingProgressTimeline
          booking={booking}
          invoices={gateInInvoice && !invoices.some(invoice => invoice.type === 'GATE_IN') ? [gateInInvoice, ...invoices] : invoices}
          onGateInPayment={canAccessGateInPayment ? onGateInPayment : undefined}
          gateInPaymentLoading={openingGateInPayment}
          onGateOutPayment={isGateOutEligible(booking) || gateOutInvoice ? onGateOutPayment : undefined}
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <DetailPanel title="Container Details" Icon={Package} keys={["containerNumber", "containerSize", "containerType", "loadStatus", "transactionClassification"]} booking={booking} />
          <DetailPanel title="Gate Schedule" Icon={CalendarClock} keys={["scheduledGateDateIn", "scheduledGateTimeIn", "shippingLine"]} booking={booking} />
          <DetailPanel title="Truck & Driver" Icon={Truck} keys={["truckPlateNumber", "driverName", "driverLicenceNumber", "hauler"]} booking={booking} />
          <DetailPanel title="Shipment Details" Icon={FileText} keys={["blNumber", "vesselVoyage", "weight", "cargoDescription", "remarks"]} booking={booking} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-border p-5"><div className="flex items-center gap-2"><FileText className="size-4 text-brand-700"/><h2 className="font-extrabold">Documents</h2></div>{booking.documents?.length ? <ul className="mt-4 grid gap-2">{booking.documents.map((doc)=><li key={doc._id || doc.storedName} className="rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold">{doc.name}</li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">No supporting documents uploaded.</p>}</section>
          <section className="rounded-2xl border border-border p-5"><h2 className="font-extrabold">Status History</h2>{booking.statusHistory?.length ? <div className="mt-4 space-y-3">{[...booking.statusHistory].reverse().slice(0,8).map((entry,index)=><div key={`${entry.status}-${index}`} className="flex items-start justify-between gap-4 border-b border-border pb-3 text-sm last:border-0"><span className="font-bold">{pretty(entry.status)}</span><time className="text-xs text-muted-foreground">{entry.changedAt ? new Date(entry.changedAt).toLocaleString("en-PH") : "—"}</time></div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">No history available.</p>}</section>
        </div>
      </div>
      {gateOutOpen && <GateOutRequest booking={booking} onClose={() => setGateOutOpen(false)} onUpdated={refresh} />}
      {paymentModal && <BookingPaymentModal
        booking={booking}
        type={paymentModal}
        invoice={paymentModal === 'GATE_IN' ? gateInInvoice : gateOutInvoice}
        onClose={() => setPaymentModal(null)}
        onSubmitted={refresh}
      />}
    </div>
  );
}
