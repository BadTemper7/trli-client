import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
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
    <main className="grid min-h-[calc(100vh-96px)] place-items-center bg-[#f5f7fb] p-4 py-14">
      <form onSubmit={submit} className="card w-full max-w-md p-7 sm:p-8">
        <h1 className="text-center text-2xl font-bold text-[#07111f]">Client Login</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Access your company portal and Booking module.</p>
        <div className="mt-6 space-y-4">
          <input className="input" type="email" placeholder="Email Address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <input className="input pr-11" type={show ? "text" : "password"} placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember Me</label>
            <span className="text-brand-blue">Forgot Password?</span>
          </div>
          <button disabled={busy} className="btn-primary w-full">{busy ? "Signing in..." : "Login"}</button>
        </div>
        <p className="mt-5 text-center text-sm">No account? <Link className="font-semibold text-brand-blue" to="/register">Create an Account</Link></p>
      </form>
    </main>
  );
}
