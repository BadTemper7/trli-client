import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";
import PortalLayout from "./components/layout/PortalLayout";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import Rates from "./pages/public/Rates";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Legal from "./pages/public/Legal";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Dashboard from "./pages/portal/Dashboard";
import PreAdviceList from "./pages/portal/PreAdviceList";
import PreAdviceForm from "./pages/portal/PreAdviceForm";
import PreAdviceDetail from "./pages/portal/PreAdviceDetail";
import Company from "./pages/portal/Company";
import Documents from "./pages/portal/Documents";
import Account from "./pages/portal/Account";
import PageHelmet from "./components/layout/PageHelmet";

function RouteLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-slate-50">
      Loading...
    </div>
  );
}

function PortalGuard() {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicHomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  return user ? <Navigate to="/portal" replace /> : <Home />;
}

function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  return user ? <Navigate to="/portal" replace /> : children;
}

export default function App() {
  return (
    <>
      <PageHelmet />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/privacy-policy" element={<Legal type="privacy" />} />
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <Login />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <Register />
              </GuestOnlyRoute>
            }
          />
        </Route>

        <Route path="/portal" element={<PortalGuard />}>
          <Route element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="pre-advice" element={<PreAdviceList />} />
            <Route path="pre-advice/new" element={<PreAdviceForm />} />
            <Route path="pre-advice/:id" element={<PreAdviceDetail />} />
            <Route path="pre-advice/:id/edit" element={<PreAdviceForm />} />
            <Route path="company" element={<Company />} />
            <Route path="documents" element={<Documents />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
