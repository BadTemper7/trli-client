import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OverviewMetrics from "../../components/portal/OverviewMetrics";
import PortalHero from "../../components/portal/PortalHero";
import QuickActions from "../../components/portal/QuickActions";
import QuickReview from "../../components/portal/QuickReview";
import RecentActivity from "../../components/portal/RecentActivity";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import NextActionCard from "../../components/booking/NextActionCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const status = user?.company?.verificationStatus || "PENDING";

  useEffect(() => {
    let active = true;
    if (status !== "VERIFIED") return undefined;
    setLoading(true);
    api.get("/pre-advice", { params: { limit: 50 } })
      .then((response) => { if (active) { setBookings(response.data?.data?.items || []); setSummary(response.data?.data?.summary || null); } })
      .catch(() => { if (active) setBookings([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  const firstName = user?.firstName || "Client";
  const latest = useMemo(() => [...bookings].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0], [bookings]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-.04em] text-foreground">Welcome back, {firstName}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here is what is happening with your containers and bookings.</p>
        </div>
        {status === "VERIFIED" && <Link to="/portal/pre-advice/new" className="btn btn-primary w-fit">+ New Booking</Link>}
      </div>

      {status === "REJECTED" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <strong>Verification requires attention.</strong>
          <p className="mt-1">{user?.company?.rejectionReason || "Please review your company information and resubmit."}</p>
          <Link to="/portal/company" className="mt-3 inline-flex font-bold text-red-700">Update company verification</Link>
        </div>
      )}

      {status === "PENDING" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>Your company verification is pending.</strong>
          <p className="mt-1">You may review your account while our team verifies your submitted documents. New bookings become available once verified.</p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(300px,1fr)] xl:items-start">
        <div className="min-w-0 space-y-5">
          <PortalHero verificationStatus={status} />
          <OverviewMetrics bookings={bookings} summary={summary} />
          {latest && <NextActionCard booking={latest} />}
          <QuickActions canCreate={status === "VERIFIED"} />
          <RecentActivity bookings={bookings} />
        </div>
        <aside className="min-w-0 xl:sticky xl:top-5">
          {loading ? <div className="card h-[420px] animate-pulse bg-muted" /> : <QuickReview booking={latest} />}
        </aside>
      </div>
    </div>
  );
}
