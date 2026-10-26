import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, FileText, Package, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import BookingProgressTimeline from "../../components/booking/BookingProgressTimeline";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import TableSkeleton from "../../components/ui/TableSkeleton";
import {downloadClientFile} from "../../lib/clientFiles";

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
  const [invoices,setInvoices]=useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    api.get('/invoices').then(r=>setInvoices((r.data.data.items||[]).filter(i=>String(i.booking)===String(id)))).catch(()=>{});
    api.get(`/pre-advice/${id}`).then((response) => setBooking(response.data.data.item)).catch((error) => toast(error.response?.data?.message || "Unable to load booking", "error")).finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => {
    const update = (item) => { if (item?._id === id) setBooking((current) => ({ ...current, ...item })); };
    const status = (payload) => { if (payload.id === id) setBooking((current) => current ? { ...current, status: payload.status, updatedAt: payload.updatedAt, workflowStage: payload.workflowStage || current.workflowStage, workflowHistory: payload.workflowHistory || current.workflowHistory } : current); };
    const workflow = (payload) => { if (payload.id === id) setBooking((current) => current ? { ...current, ...payload } : current); };
    socket.on("pre-advice:updated", update); socket.on("pre-advice:status-updated", status); socket.on("pre-advice:workflow-updated", workflow);
    return () => { socket.off("pre-advice:updated", update); socket.off("pre-advice:status-updated", status); socket.off("pre-advice:workflow-updated", workflow); };
  }, [socket, id]);

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
        <BookingProgressTimeline booking={booking} invoices={invoices} />
        {['READY_FOR_GATE_IN','GATE_IN_PAYMENT_SUBMITTED'].includes(booking.workflowStage)&&!booking.gateIn?.actualGateInAt&&<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><strong>Advance Gate-in payment is available now.</strong><p className="mt-1">You do not need to wait for your scheduled Gate-in date to pay. The container will only be physically gated in after admin payment verification and inspection.</p>{booking.gateIn?.payment?.status==='REJECTED'&&<p className="mt-2 font-semibold text-red-700">Payment rejected: submit a corrected reference or payment proof from your invoice.</p>}</div>}<div className="flex gap-3"><Link to="/portal/invoices" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">View Gate-in Invoice & Pay Now</Link></div>
        {booking.preAdviceReview?.reason&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Pre-advice rejected:</strong> {booking.preAdviceReview.reason}</div>}
        {booking.gateOut?.payment?.status==='REJECTED'&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Gate-out rejected:</strong> {booking.gateOut.remarks}</div>}
        {!!booking.gateIn?.actualGateInAt&&<div className="rounded-xl border bg-muted p-4 text-sm"><strong>Time in terminal:</strong> {Math.max(1,Math.ceil((new Date(booking.gateOut?.releasedAt||Date.now()).getTime()-new Date(booking.gateIn.actualGateInAt).getTime())/86400000))} day(s) {booking.gateOut?.releasedAt?'(final)':'(current)'}</div>}
        {invoices.length>0&&<section className="rounded-2xl border p-5"><h2 className="font-extrabold">Linked invoices & receipts</h2><div className="mt-3 space-y-3">{invoices.map(i=><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm" key={i._id}><span><strong>{i.number}</strong> · {i.type.replace('_','-')} · {i.status.replaceAll('_',' ')}</span><div className="flex gap-2"><button type="button" className="font-bold text-brand-700" onClick={()=>downloadClientFile(`/invoices/${i._id}/pdf`)}>Invoice PDF</button>{i.status==='PAID'&&<button type="button" className="font-bold text-brand-700" onClick={()=>downloadClientFile(`/invoices/${i._id}/receipt`)}>Receipt PDF</button>}</div></div>)}</div></section>}

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
    </div>
  );
}
