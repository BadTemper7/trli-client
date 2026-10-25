import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  MailCheck,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "../../components/ui/FileUpload";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const steps = [
  { label: "Company", hint: "Who you operate as", icon: Building2 },
  { label: "Contact Person", hint: "Who we speak to", icon: UserRound },
  { label: "Account", hint: "Your login details", icon: KeyRound },
  { label: "Documents", hint: "Proof of business", icon: FileText },
  { label: "Email Verification", hint: "Confirm your inbox", icon: MailCheck },
  { label: "Review & Submit", hint: "One last look", icon: ClipboardCheck },
];

const initial = {
  companyName: "",
  companyAddress: "",
  businessType: "",
  otherBusinessType: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  phoneNumber: "",
  position: "",
  otherPosition: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
  agreePrivacy: false,
  agreeAuthority: false,
  otherDocumentName: "",
};

const passwordOk = (v) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);
const phoneOk = (v) => /^(\+63|0)9\d{9}$/.test(v);

const passwordRules = [
  ["8+ characters", (v) => v.length >= 8],
  ["Uppercase", (v) => /[A-Z]/.test(v)],
  ["Lowercase", (v) => /[a-z]/.test(v)],
  ["Number", (v) => /\d/.test(v)],
  ["Special character", (v) => /[^A-Za-z0-9]/.test(v)],
];

/* ---------- shared styling ---------- */
const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const inputOk =
  "border-slate-200 hover:border-slate-300 focus:border-[#1d4f91] focus:ring-[#1d4f91]/15";
const inputBad =
  "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15";

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-slate-800">
        <span>
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        {!required && (
          <span className="text-xs font-normal text-slate-400">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Select({ value, onChange, onBlur, bad, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${inputBase} ${bad ? inputBad : inputOk} appearance-none pr-10 ${value ? "" : "text-slate-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((x) => (
          <option key={x} value={x} className="text-slate-900">
            {x.charAt(0) + x.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  const update = (i, ch) => {
    const arr = [...digits];
    arr[i] = ch;
    onChange(arr.join(""));
  };
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            update(i, ch);
            if (ch && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0)
              refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const t = e.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (!t) return;
            e.preventDefault();
            onChange(t);
            refs.current[Math.min(t.length, 5)]?.focus();
          }}
          className={`h-14 w-11 rounded-xl border bg-white text-center text-2xl font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#1d4f91] focus:ring-4 focus:ring-[#1d4f91]/15 sm:h-16 sm:w-14 ${d ? "border-[#1d4f91]" : "border-slate-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#1d4f91] transition hover:bg-[#1d4f91]/10"
        >
          <Pencil size={13} /> Edit
        </button>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

export default function Register() {
  const [step, setStep] = useState(0),
    [form, setForm] = useState(initial),
    [files, setFiles] = useState({}),
    [otp, setOtp] = useState(""),
    [verified, setVerified] = useState(false),
    [busy, setBusy] = useState(false),
    [countdown, setCountdown] = useState(0),
    [showPassword, setShowPassword] = useState(false),
    [done, setDone] = useState(false),
    [touched, setTouched] = useState({}),
    [attempted, setAttempted] = useState(false);
  const { toast } = useToast(),
    nav = useNavigate();

  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    if (!countdown) return;
    const t = setInterval(() => setCountdown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  useEffect(() => {
    setAttempted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const errors = useMemo(() => {
    const e = {};
    if (step === 0) {
      if (!form.companyName.trim()) e.companyName = "Company name is required.";
      if (!form.companyAddress.trim())
        e.companyAddress = "Company address is required.";
      if (!form.businessType) e.businessType = "Business type is required.";
      if (form.businessType === "OTHER" && !form.otherBusinessType.trim())
        e.otherBusinessType = "Specify the business type.";
    }
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required.";
      if (!form.lastName.trim()) e.lastName = "Last name is required.";
      if (!phoneOk(form.phoneNumber))
        e.phoneNumber = "Enter a valid PH mobile number, e.g. 09171234567.";
      if (!form.position) e.position = "Position is required.";
      if (form.position === "OTHER" && !form.otherPosition.trim())
        e.otherPosition = "Specify the position.";
    }
    if (step === 2) {
      if (!/^\S+@\S+\.\S+$/.test(form.email))
        e.email = "Enter a valid email address.";
      if (!passwordOk(form.password))
        e.password =
          "Use 8+ characters with uppercase, lowercase, number and special character.";
      if (form.confirmPassword !== form.password)
        e.confirmPassword = "Passwords do not match.";
      if (!form.agreeTerms || !form.agreePrivacy || !form.agreeAuthority)
        e.agreements = "Please accept all three agreements to continue.";
    }
    return e;
  }, [step, form]);

  const canContinue = Object.keys(errors).length === 0;
  // errors appear only after the user touched a field or tried to continue
  const err = (k) => (attempted || touched[k] ? errors[k] : undefined);
  const cls = (k) => `${inputBase} ${err(k) ? inputBad : inputOk}`;

  const next = () => {
    if (canContinue) return setStep((s) => Math.min(5, s + 1));
    setAttempted(true);
    toast(Object.values(errors)[0] || "Complete the required fields.", "error");
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const requestOtp = async () => {
    if (!files.businessPermit || !files.birCertificate || !files.validId)
      return toast(
        "Business Permit, BIR Certificate and Valid ID are required.",
        "error",
      );
    setBusy(true);
    try {
      await api.post("/auth/register/request-otp", { email: form.email });
      setCountdown(45);
      toast("OTP sent to your email");
      if (step === 3) setStep(4);
    } catch (e) {
      toast(e.response?.data?.message || "Unable to send OTP", "error");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await api.post("/auth/register/verify-otp", { email: form.email, otp });
      setVerified(true);
      toast("Email verified");
      setStep(5);
    } catch (e) {
      toast(e.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      Object.entries(files).forEach(([k, v]) => v && fd.append(k, v));
      await api.post("/auth/register", fd);
      setDone(true);
      toast("Registration complete");
    } catch (e) {
      toast(e.response?.data?.message || "Registration failed", "error");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- success ---------- */
  if (done)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6fa] p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_30px_80px_-30px_rgba(15,47,87,0.35)]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
            <CheckCircle2 className="text-emerald-600" size={44} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Registration complete
          </h1>
          <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-600">
            Your company registration has been submitted for verification. You
            can log in now while we review your application.
          </p>
          <button
            onClick={() => nav("/login")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1d4f91] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1d4f91]/25 transition hover:bg-[#173f74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f91]"
          >
            Go to login <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );

  const text = (k, label, props = {}, opts = {}) => (
    <Field
      label={label}
      required={opts.required !== false}
      error={err(k)}
      hint={opts.hint}
    >
      <input
        className={cls(k)}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        onBlur={() => touch(k)}
        {...props}
      />
    </Field>
  );

  const pwScore = passwordRules.filter(([, f]) => f(form.password)).length;
  const pwColor =
    pwScore <= 2
      ? "bg-red-400"
      : pwScore <= 4
        ? "bg-amber-400"
        : "bg-emerald-500";
  const Icon = steps[step].icon;
  const progress = (step / (steps.length - 1)) * 100;

  return (
    <main className="min-h-screen bg-[#f4f6fa] px-4 py-6 sm:px-8 sm:py-10">
      <style>{`
        @keyframes regIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .reg-in { animation: regIn .35s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .reg-in { animation: none; } }
      `}</style>

      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_40px_100px_-40px_rgba(15,47,87,0.4)] lg:grid-cols-[340px_1fr]">
        {/* ===== Left: route-style stepper (desktop) ===== */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0f2f57] p-9 text-white lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1d4f91]/50 blur-3xl"
          />
          <div className="relative">
            <Link
              to="/"
              className="inline-block rounded-2xl bg-white px-4 py-2.5 shadow-lg"
            >
              <img src="/images/logo.webp" alt="Home" className="h-10" />
            </Link>
            <h2 className="mt-10 text-2xl font-semibold leading-snug tracking-tight">
              Register your company
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
              Six short stops. It takes about five minutes with your documents
              ready.
            </p>

            <ol className="relative mt-10">
              <span
                aria-hidden
                className="absolute left-[17px] top-3 h-[calc(100%-1.5rem)] w-px border-l-2 border-dashed border-white/20"
              />
              <span
                aria-hidden
                className="absolute left-[17px] top-3 w-[2px] bg-gradient-to-b from-red-400 to-red-500 transition-all duration-500"
                style={{ height: `calc((100% - 1.5rem) * ${progress / 100})` }}
              />
              {steps.map((s, i) => {
                const active = i === step,
                  complete = i < step;
                return (
                  <li
                    key={s.label}
                    className="relative flex items-center gap-4 pb-7 last:pb-0"
                  >
                    <span
                      className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-all ${
                        active
                          ? "border-white bg-white text-[#0f2f57] shadow-[0_0_0_6px_rgba(255,255,255,0.12)]"
                          : complete
                            ? "border-red-400 bg-red-500 text-white"
                            : "border-white/25 bg-[#0f2f57] text-white/50"
                      }`}
                    >
                      {complete ? <Check size={17} strokeWidth={3} /> : i + 1}
                    </span>
                    <div aria-current={active ? "step" : undefined}>
                      <p
                        className={`text-sm font-semibold ${active ? "text-white" : complete ? "text-blue-50" : "text-white/50"}`}
                      >
                        {s.label}
                      </p>
                      <p
                        className={`text-xs ${active ? "text-blue-100/80" : "text-white/35"}`}
                      >
                        {s.hint}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="relative mt-10 flex items-start gap-2 text-xs leading-relaxed text-blue-100/70">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            Your documents are used only to verify your business.
          </p>
        </aside>

        {/* ===== Right: form ===== */}
        <section className="flex min-w-0 flex-col">
          {/* mobile header */}
          <div className="border-b border-slate-100 p-5 lg:hidden">
            <div className="flex items-center justify-between">
              <Link to="/">
                <img src="/images/logo.webp" alt="Home" className="h-10" />
              </Link>
              <span className="text-xs font-semibold text-slate-500">
                Step {step + 1} of {steps.length}
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1d4f91] to-red-500 transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-10">
            <div key={step} className="reg-in">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d4f91]/10 text-[#1d4f91]">
                  <Icon size={24} />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {steps[step].label}
                  </h1>
                  <p className="text-sm text-slate-500">{steps[step].hint}</p>
                </div>
              </div>

              {/* STEP 0 */}
              {step === 0 && (
                <div className="mt-8 grid gap-5">
                  {text("companyName", "Company name", {
                    placeholder: "e.g. Santos Freight Services",
                  })}
                  <Field
                    label="Company address"
                    required
                    error={err("companyAddress")}
                  >
                    <textarea
                      className={`${cls("companyAddress")} min-h-28 resize-y`}
                      value={form.companyAddress}
                      onChange={(e) => set("companyAddress", e.target.value)}
                      onBlur={() => touch("companyAddress")}
                      placeholder="Street, barangay, city, province"
                    />
                  </Field>
                  <Field
                    label="Business type"
                    required
                    error={err("businessType")}
                  >
                    <Select
                      value={form.businessType}
                      onChange={(e) => set("businessType", e.target.value)}
                      onBlur={() => touch("businessType")}
                      bad={!!err("businessType")}
                      placeholder="Select business type"
                      options={[
                        "TRUCKING",
                        "SHIPPING",
                        "BROKERAGE",
                        "FORWARDER",
                        "OTHER",
                      ]}
                    />
                  </Field>
                  {form.businessType === "OTHER" &&
                    text("otherBusinessType", "Specify business type", {
                      placeholder: "Business type",
                    })}
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {text("firstName", "First name", { placeholder: "Juan" })}
                  {text(
                    "middleName",
                    "Middle name",
                    { placeholder: "Dela" },
                    { required: false },
                  )}
                  {text("lastName", "Last name", { placeholder: "Cruz" })}
                  {text(
                    "suffix",
                    "Suffix",
                    { placeholder: "Jr., Sr., III" },
                    { required: false },
                  )}
                  {text("phoneNumber", "Mobile number", {
                    placeholder: "09171234567",
                    inputMode: "tel",
                  })}
                  <Field
                    label="Position / job title"
                    required
                    error={err("position")}
                  >
                    <Select
                      value={form.position}
                      onChange={(e) => set("position", e.target.value)}
                      onBlur={() => touch("position")}
                      bad={!!err("position")}
                      placeholder="Select position"
                      options={[
                        "OWNER",
                        "CEO",
                        "MANAGER",
                        "SUPERVISOR",
                        "REPRESENTATIVE",
                        "OTHER",
                      ]}
                    />
                  </Field>
                  {form.position === "OTHER" &&
                    text("otherPosition", "Specify position", {
                      placeholder: "Position",
                    })}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="mt-8 space-y-5">
                  {text(
                    "email",
                    "Email address",
                    {
                      type: "email",
                      placeholder: "name@company.com",
                      autoComplete: "email",
                    },
                    { hint: "We'll send a verification code here." },
                  )}
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Password" required error={err("password")}>
                      <div className="relative">
                        <input
                          className={`${cls("password")} pr-12`}
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                          onBlur={() => touch("password")}
                          placeholder="Create password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </Field>
                    <Field
                      label="Confirm password"
                      required
                      error={err("confirmPassword")}
                    >
                      <input
                        className={cls("confirmPassword")}
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        onBlur={() => touch("confirmPassword")}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                      />
                    </Field>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex gap-1.5">
                      {passwordRules.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${i < pwScore ? pwColor : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                      {passwordRules.map(([l, f]) => {
                        const ok = f(form.password);
                        return (
                          <li
                            key={l}
                            className={`flex items-center gap-1.5 ${ok ? "text-emerald-700" : "text-slate-500"}`}
                          >
                            <Check
                              size={13}
                              strokeWidth={3}
                              className={ok ? "" : "opacity-30"}
                            />
                            {l}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      [
                        "agreeTerms",
                        <>
                          I agree to the{" "}
                          <Link
                            className="font-semibold text-[#1d4f91] underline-offset-2 hover:underline"
                            target="_blank"
                            to="/terms"
                          >
                            Terms and Conditions
                          </Link>
                          .
                        </>,
                      ],
                      [
                        "agreePrivacy",
                        <>
                          I agree to the{" "}
                          <Link
                            className="font-semibold text-[#1d4f91] underline-offset-2 hover:underline"
                            target="_blank"
                            to="/privacy-policy"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </>,
                      ],
                      [
                        "agreeAuthority",
                        "I confirm that I am of legal age and authorized to register this company account.",
                      ],
                    ].map(([k, l]) => (
                      <label
                        key={k}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm text-slate-700 transition ${form[k] ? "border-[#1d4f91]/40 bg-[#1d4f91]/5" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 accent-[#1d4f91]"
                          checked={form[k]}
                          onChange={(e) => set(k, e.target.checked)}
                        />
                        <span>{l}</span>
                      </label>
                    ))}
                    {err("agreements") && (
                      <p
                        role="alert"
                        className="text-xs font-medium text-red-600"
                      >
                        {err("agreements")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="mt-8">
                  <p className="mb-5 text-sm text-slate-500">
                    Upload clear copies. Items marked * are required.
                  </p>
                  <div className="grid gap-5 md:grid-cols-2">
                    {[
                      ["businessPermit", "Business Permit", true],
                      ["birCertificate", "BIR Certificate", true],
                      ["validId", "Valid ID", true],
                      ["authorizationLetter", "Authorization Letter", false],
                      ["otherDocument", "Other Document", false],
                    ].map(([k, l, r]) => (
                      <div
                        key={k}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                      >
                        <FileUpload
                          label={l}
                          name={k}
                          file={files[k]}
                          required={r}
                          onChange={(v) => setFiles((x) => ({ ...x, [k]: v }))}
                        />
                        {k === "otherDocument" && files.otherDocument && (
                          <input
                            className={`${inputBase} ${inputOk} mt-3`}
                            placeholder="Document name (optional)"
                            value={form.otherDocumentName}
                            onChange={(e) =>
                              set("otherDocumentName", e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="mx-auto mt-10 max-w-md text-center">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Enter the 6-digit code we sent to
                    <br />
                    <b className="text-slate-900">{form.email}</b>
                  </p>
                  <div className="mt-7">
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                  <button
                    onClick={verify}
                    disabled={busy || otp.length !== 6}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4f91] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#1d4f91]/25 transition hover:bg-[#173f74] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {busy && <Loader2 size={18} className="animate-spin" />}
                    {busy ? "Verifying…" : "Verify code"}
                  </button>
                  <button
                    onClick={requestOtp}
                    disabled={busy || countdown > 0}
                    className="mt-4 text-sm font-semibold text-[#1d4f91] disabled:text-slate-400"
                  >
                    {countdown > 0
                      ? `Resend available in ${countdown}s`
                      : "Resend code"}
                  </button>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <ReviewCard title="Company" onEdit={() => setStep(0)}>
                    <p className="font-semibold text-slate-900">
                      {form.companyName}
                    </p>
                    <p>{form.companyAddress}</p>
                    <p className="mt-1">
                      {form.businessType === "OTHER"
                        ? form.otherBusinessType
                        : form.businessType}
                    </p>
                  </ReviewCard>
                  <ReviewCard title="Contact person" onEdit={() => setStep(1)}>
                    <p className="font-semibold text-slate-900">
                      {[
                        form.firstName,
                        form.middleName,
                        form.lastName,
                        form.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p>
                      {form.position === "OTHER"
                        ? form.otherPosition
                        : form.position}
                    </p>
                    <p>{form.phoneNumber}</p>
                    <p>{form.email}</p>
                  </ReviewCard>
                  <ReviewCard title="Documents" onEdit={() => setStep(3)}>
                    <ul className="space-y-1.5">
                      {Object.values(files)
                        .filter(Boolean)
                        .map((f) => (
                          <li key={f.name} className="flex items-center gap-2">
                            <FileText
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                            <span className="truncate">{f.name}</span>
                          </li>
                        ))}
                    </ul>
                  </ReviewCard>
                  <ReviewCard title="Agreements" onEdit={() => setStep(2)}>
                    <p className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      Terms, Privacy Policy, legal age and company authorization
                      confirmed.
                    </p>
                  </ReviewCard>
                </div>
              )}
            </div>
          </div>

          {/* footer actions */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-10">
            <button
              onClick={back}
              disabled={step === 0 || busy}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:invisible"
            >
              <ArrowLeft size={17} /> Back
            </button>

            {step < 3 && (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1d4f91] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1d4f91]/25 transition hover:bg-[#173f74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f91]"
              >
                Continue <ArrowRight size={17} />
              </button>
            )}
            {step === 3 && (
              <button
                disabled={
                  !files.businessPermit ||
                  !files.birCertificate ||
                  !files.validId ||
                  busy
                }
                onClick={requestOtp}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1d4f91] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1d4f91]/25 transition hover:bg-[#173f74] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {busy && <Loader2 size={17} className="animate-spin" />}
                {busy ? "Sending…" : "Send verification code"}
              </button>
            )}
            {step === 5 && (
              <button
                disabled={!verified || busy}
                onClick={complete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {busy && <Loader2 size={17} className="animate-spin" />}
                {busy ? "Submitting…" : "Submit registration"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
