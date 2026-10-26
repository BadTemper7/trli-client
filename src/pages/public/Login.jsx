import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await login(form);
      toast("Login successful");
      nav("/portal");
    } catch (error) {
      toast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-[calc(100vh-96px)] place-items-center overflow-hidden bg-[#f5f7fb] p-4 py-14">
      {/* soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl"
      />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10"
      >
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Secure client portal
        </div>

        <h1 className="mt-5 text-center text-3xl font-bold tracking-tight text-[#07111f]">
          Client Login
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Access your company portal and Booking module.
        </p>

        <div className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Email Address
            </label>
            <div className="group relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
              <input
                id="email"
                className="input !pl-10"
                type="email"
                autoComplete="username"
                placeholder="name@company.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Password
            </label>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
              <input
                id="password"
                className="input !pl-10 !pr-12"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-[#3a1fc7]"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="font-medium text-brand-blue hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            disabled={busy}
            className="btn-primary group flex h-12 w-full items-center justify-center gap-2 !rounded-xl text-sm font-semibold shadow-lg shadow-brand-blue/25 transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Login
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          No account?{" "}
          <Link
            className="font-semibold text-brand-blue hover:underline"
            to="/register"
          >
            Create an Account
          </Link>
        </p>
      </form>
    </main>
  );
}
