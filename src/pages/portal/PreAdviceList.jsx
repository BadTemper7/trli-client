import { useCallback, useEffect, useRef, useState } from "react";
import { Ban, CalendarDays, CheckCircle2, Clock3, Container, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import TableSkeleton from "../../components/ui/TableSkeleton";
import Pagination from "../../components/ui/Pagination";

const statuses = ["DRAFT", "SUBMITTED", "SCHEDULED", "READY_FOR_GATE_IN", "GATED_IN", "COMPLETED", "CANCELLED"];
const label = (value) => value?.replaceAll("_", " ") || "—";

function SummaryTile({ title, value, Icon, tone, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-[96px] items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${tone} ${active ? "ring-2 ring-brand-500/30" : ""}`}>
      <span className="grid size-11 place-items-center rounded-full bg-white/80 shadow-sm"><Icon className="size-5" /></span>
      <span><strong className="block text-3xl font-extrabold tracking-[-.04em] text-foreground">{value}</strong><span className="mt-1 block text-xs font-bold text-muted-foreground">{title}</span></span>
    </button>
  );
}

export default function PreAdviceList() {
  const [params] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState(() => params.get("q") || "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({ all: 0, pending: 0, yard: 0, complete: 0 });
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedQ(q.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const response = await api.get("/pre-advice", { params: { page, limit: 10, search: debouncedQ || undefined, status: status || undefined } });
      if (currentRequest !== requestId.current) return;
      const data = response.data?.data || {};
      setRows(data.items || []);
      setPagination(data.pagination || { page, limit: 10, total: 0, totalPages: 1 });
      setSummary(data.summary || { all: 0, pending: 0, yard: 0, complete: 0 });
    } catch (error) {
      if (currentRequest === requestId.current) toast(error.response?.data?.message || "Unable to load bookings", "error");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [page, debouncedQ, status, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const refresh = () => load();
    socket.on("pre-advice:created", refresh);
    socket.on("pre-advice:updated", refresh);
    socket.on("pre-advice:status-updated", refresh);
    socket.on("pre-advice:workflow-updated", refresh);
    return () => {
      socket.off("pre-advice:created", refresh);
      socket.off("pre-advice:updated", refresh);
      socket.off("pre-advice:status-updated", refresh);
      socket.off("pre-advice:workflow-updated", refresh);
    };
  }, [socket, load]);

  const changeStatus = (next) => { setStatus(next); setPage(1); };
  const cancel = async (item) => {
    if (!window.confirm(`Cancel booking ${item.bookingReference}? The booking will remain in your records as CANCELLED.`)) return;
    const reason = window.prompt("Cancellation reason (optional):", "") ?? null;
    if (reason === null) return;
    try {
      await api.post(`/pre-advice/${item._id}/cancel`, { reason });
      toast("Booking cancelled");
      load();
    } catch (error) {
      toast(error.response?.data?.message || "Unable to cancel booking", "error");
    }
  };

  const canModify = (row) => row.workflowStage === "BOOKING_SUBMITTED" && ["DRAFT", "SUBMITTED"].includes(row.status);
  const canCancel = canModify;
  const verified = user?.company?.verificationStatus === "VERIFIED";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand-700">Booking Management</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.04em] text-foreground">My Bookings</h1><p className="mt-1 text-sm text-muted-foreground">Track pre-advice, schedules, and container progress.</p></div>
        {verified && <Link to="/portal/pre-advice/new" className="btn btn-primary w-fit">+ New Booking</Link>}
      </div>

      {!verified && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">New bookings require VERIFIED company status. Existing records remain visible.</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile title="All Bookings" value={summary.all} Icon={Container} tone="border-brand-100 bg-brand-50 text-brand-700" active={status === ""} onClick={() => changeStatus("")} />
        <SummaryTile title="Pending Approval" value={summary.pending} Icon={Clock3} tone="border-amber-100 bg-amber-50 text-amber-700" active={status === "SUBMITTED"} onClick={() => changeStatus("SUBMITTED")} />
        <SummaryTile title="Gate / Yard" value={summary.yard} Icon={CalendarDays} tone="border-sky-100 bg-sky-50 text-sky-700" active={status === "READY_FOR_GATE_IN"} onClick={() => changeStatus("READY_FOR_GATE_IN")} />
        <SummaryTile title="Completed" value={summary.complete} Icon={CheckCircle2} tone="border-emerald-100 bg-emerald-50 text-emerald-700" active={status === "COMPLETED"} onClick={() => changeStatus("COMPLETED")} />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="input pl-9" placeholder="Search booking ID, container, or shipping line" value={q} onChange={(event) => setQ(event.target.value)} /></div>
          <select className="input lg:max-w-[230px]" value={status} onChange={(event) => changeStatus(event.target.value)}><option value="">All Statuses</option>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
        </div>

        <div className="mt-4">
          {loading ? <TableSkeleton rows={6} columns={5} /> : rows.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center text-center"><div><CalendarDays className="mx-auto size-10 text-muted-foreground/40" /><h3 className="mt-3 font-bold">No bookings found</h3><p className="mt-1 text-sm text-muted-foreground">Your booking records will appear here.</p></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"><tr>{["Booking Reference", "Container", "Gate Schedule", "Shipping Line", "Status", "Action"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
                <tbody>{rows.map((row) => <tr key={row._id} className="border-b border-border last:border-b-0 hover:bg-muted/40"><td className="px-4 py-4"><Link to={`/portal/pre-advice/${row._id}`} className="font-extrabold text-brand-700">{row.bookingReference}</Link></td><td className="px-4 py-4"><div className="font-bold text-foreground">{row.containerNumber}</div><div className="mt-1 text-xs text-muted-foreground">{row.containerSize} · {row.containerType}</div></td><td className="px-4 py-4"><div>{row.scheduledGateDateIn || "—"}</div><div className="mt-1 text-xs text-muted-foreground">{row.scheduledGateTimeIn || ""}</div></td><td className="px-4 py-4">{row.shippingLine || "—"}</td><td className="px-4 py-4"><span className="badge bg-muted text-foreground">{label(row.status)}</span></td><td className="px-4 py-4"><div className="flex flex-wrap items-center justify-end gap-3"><Link to={`/portal/pre-advice/${row._id}`} className="font-bold text-brand-700">View</Link>{canModify(row) && <Link to={`/portal/pre-advice/${row._id}/edit`} className="font-bold text-muted-foreground">Edit</Link>}{canCancel(row) && <button type="button" onClick={() => cancel(row)} className="inline-flex items-center gap-1 font-bold text-danger-600"><Ban className="size-4" />Cancel</button>}</div></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && <div className="mt-4 border-t border-border pt-4"><Pagination {...pagination} onPage={setPage} /></div>}
      </section>
    </div>
  );
}
