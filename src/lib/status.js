export const statusStyle = (s) =>
  ({
    VERIFIED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
    READY_FOR_GATE_IN: "bg-amber-100 text-amber-700",
    GATED_IN: "bg-indigo-100 text-indigo-700",
    SUBMITTED: "bg-sky-100 text-sky-700",
    DRAFT: "bg-slate-100 text-slate-600",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-red-100 text-red-700",
  })[s] || "bg-slate-100 text-slate-700";

export const prettyStatus = (s = "") =>
  s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");
