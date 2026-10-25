import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDemoAuth, apiRequest } from "../context/DemoAuth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";
const steps = [
  "Business information",
  "Representative",
  "Account credentials",
  "Documents",
  "Review & agreements",
  "Submitted",
];
const types = [
  "Trucking",
  "Shipping",
  "Customs Brokerage",
  "Freight Forwarder",
  "Other",
];
const positions = [
  "Owner",
  "CEO",
  "Manager",
  "Supervisor",
  "Authorized Representative",
  "Other",
];
const suffixes = ["None", "Jr.", "Sr.", "II", "III", "IV", "Other"];
const initial = {
  companyName: "",
  region: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  zip: "",
  companyType: "",
  companyTypeOther: "",
  representativeFirstName: "",
  representativeMiddleName: "",
  representativeLastName: "",
  suffix: "None",
  representativePosition: "",
  positionOther: "",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  age: false,
  ageReview: false,
  terms: false,
  privacy: false,
  authority: false,
};
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const normalizePhone = (s) => {
  let x = s.replace(/[\s()-]/g, "");
  if (/^09\d{9}$/.test(x)) x = "+63" + x.slice(1);
  if (/^639\d{9}$/.test(x)) x = "+" + x;
  return x;
};
function Field({ label, error, children, ...props }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children || <input {...props} aria-invalid={!!error} />}
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
function Registration() {
  const [step, setStep] = useState(0),
    [v, setV] = useState(initial),
    [files, setFiles] = useState({}),
    [errors, setErrors] = useState({}),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [show, setShow] = useState(false),
    [reference, setReference] = useState("");
  const update = (name, value) => {
    setV((x) => ({ ...x, [name]: value }));
    setErrors((x) => ({ ...x, [name]: undefined }));
    setMessage("");
  };
  const field = (name, label, extra = {}) => (
    <Field
      key={name}
      label={label}
      value={v[name]}
      onChange={(e) => update(name, e.target.value)}
      error={errors[name]}
      {...extra}
    />
  );
  const dropdown = (name, label, options) => (
    <Field label={label} error={errors[name]}>
      <select value={v[name]} onChange={(e) => update(name, e.target.value)}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </Field>
  );
  const check = (name, label) => (
    <label className="reg-checkbox">
      <input
        type="checkbox"
        checked={!!v[name]}
        onChange={(e) => update(name, e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
  const validate = () => {
    const e = {};
    const required = (keys) =>
      keys.forEach((k) => {
        if (!String(v[k] || "").trim()) e[k] = "This field is required.";
      });
    if (step === 0) {
      required([
        "companyName",
        "region",
        "province",
        "city",
        "barangay",
        "street",
        "zip",
        "companyType",
      ]);
      if (v.companyType === "Other") required(["companyTypeOther"]);
      if (!/^\d{4}$/.test(v.zip))
        e.zip = "Enter a 4-digit Philippine ZIP code.";
    }
    if (step === 1) {
      required([
        "representativeFirstName",
        "representativeLastName",
        "representativePosition",
        "phoneNumber",
        "email",
      ]);
      if (v.representativePosition === "Other") required(["positionOther"]);
      if (!/^\+639\d{9}$/.test(normalizePhone(v.phoneNumber)))
        e.phoneNumber = "Use a Philippine mobile number (09XXXXXXXXX).";
      if (!validEmail(v.email)) e.email = "Enter a valid email address.";
      if (!v.age) e.age = "Confirm that you are at least 18.";
    }
    if (step === 2) {
      if (v.password.length < 12) e.password = "Use at least 12 characters.";
      if (v.password !== v.confirmPassword)
        e.confirmPassword = "Passwords do not match.";
    }
    if (step === 3) {
      for (const k of ["businessPermit", "birCertificate"])
        if (!files[k]) e[k] = "This document is required.";
    }
    if (step === 4) {
      if (!v.ageReview || !v.terms || !v.privacy || !v.authority)
        e.agreement = "All four legal confirmations are required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const choose = (key, file) => {
    if (
      file &&
      (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
        file.size > 10 * 1024 * 1024)
    ) {
      setErrors((x) => ({ ...x, [key]: "Use PDF, JPG or PNG, up to 10 MB." }));
      return;
    }
    setFiles((x) => ({ ...x, [key]: file || null }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };
  const upload = (key, label, required = false) => (
    <div className="reg-upload">
      <strong>
        {label}
        {required ? " *" : ""}
      </strong>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => choose(key, e.target.files?.[0])}
      />
      {files[key] && (
        <small>
          {files[key].name} ({Math.ceil(files[key].size / 1024)} KB){" "}
          <button type="button" onClick={() => choose(key, null)}>
            Remove
          </button>
        </small>
      )}
      {errors[key] && <small className="field-error">{errors[key]}</small>}
    </div>
  );
  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      const address = [
        v.street,
        v.barangay,
        v.city,
        v.province,
        v.region,
        v.zip,
        "Philippines",
      ].join(", ");
      const fields = {
        ...v,
        companyName: v.companyName.trim(),
        companyAddress: address,
        phoneNumber: normalizePhone(v.phoneNumber),
        representativePosition:
          v.representativePosition === "Other"
            ? v.positionOther
            : v.representativePosition,
        email: v.email.toLowerCase().trim(),
        termsAccepted: v.terms,
        privacyAccepted: v.privacy,
        representativeAuthorityConfirmed: v.authority,
        ageConfirmed: v.age && v.ageReview,
      };
      Object.entries(fields).forEach(([k, val]) => {
        if (typeof val !== "boolean") body.append(k, val);
        else body.append(k, String(val));
      });
      Object.entries(files).forEach(([k, file]) => {
        if (file) body.append(k, file);
      });
      const data = await apiRequest("/api/auth/client/register", {
        method: "POST",
        body,
      });
      setReference(data.reference || "");
      setStep(5);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="auth-card-header">
        <span className="auth-label">
          <ShieldCheck size={17} /> Secure business onboarding
        </span>
        <h2>{steps[step]}</h2>
        <p>Complete your company registration to request portal access.</p>
      </div>
      <div className="reg-progress" aria-label="Registration progress">
        {steps.map((s, i) => (
          <div
            key={s}
            className={i === step ? "current" : i < step ? "completed" : ""}
          >
            <span>{i < step ? "✓" : i + 1}</span>
            <small>{s}</small>
          </div>
        ))}
      </div>
      <div className="reg-form" aria-live="polite">
        {step === 0 && (
          <div className="reg-grid">
            {field("companyName", "Company name", {
              autoComplete: "organization",
            })}
            {dropdown("companyType", "Business type", types)}
            {v.companyType === "Other" &&
              field("companyTypeOther", "Specify business type")}
            {field("region", "Region")}
            {field("province", "Province")}
            {field("city", "City / municipality")}
            {field("barangay", "Barangay")}
            {field("street", "Street address / building / unit")}
            {field("zip", "ZIP code", { inputMode: "numeric", maxLength: 4 })}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="reg-grid">
              {field("representativeFirstName", "First name", {
                autoComplete: "given-name",
              })}
              {field("representativeMiddleName", "Middle name (optional)")}
              {field("representativeLastName", "Last name", {
                autoComplete: "family-name",
              })}
              {dropdown("suffix", "Suffix", suffixes)}
              {dropdown("representativePosition", "Position / role", positions)}
              {v.representativePosition === "Other" &&
                field("positionOther", "Specify position")}
              {field("phoneNumber", "Mobile number (+63)", {
                type: "tel",
                autoComplete: "tel",
                placeholder: "09XXXXXXXXX",
              })}
              {field("email", "Email address", {
                type: "email",
                autoComplete: "email",
              })}
            </div>
            {check("age", "I confirm that I am at least 18 years old.")}
            {errors.age && <p className="field-error">{errors.age}</p>}
          </>
        )}
        {step === 2 && (
          <>
            <p>
              Account email: <strong>{v.email}</strong>{" "}
              <button
                className="reg-link"
                type="button"
                onClick={() => setStep(1)}
              >
                Edit
              </button>
            </p>
            <div className="reg-grid">
              {field("password", "Password", {
                type: show ? "text" : "password",
                autoComplete: "new-password",
              })}
              {field("confirmPassword", "Confirm password", {
                type: show ? "text" : "password",
                autoComplete: "new-password",
              })}
            </div>
            <label className="reg-checkbox">
              <input
                type="checkbox"
                checked={show}
                onChange={(e) => setShow(e.target.checked)}
              />
              Show passwords
            </label>
            <small>Use a unique passphrase of at least 12 characters.</small>
          </>
        )}
        {step === 3 && (
          <>
            {upload("businessPermit", "Business permit", true)}
            {upload("birCertificate", "BIR Certificate (Form 2303)", true)}
            {upload(
              "authorizationLetter",
              "Authorization letter (recommended)",
            )}
            {upload("otherDocument", "Other supporting document")}
            <small>
              Accepted files: PDF, JPG, PNG. Maximum 10 MB per document. Files
              are submitted securely for review.
            </small>
          </>
        )}
        {step === 4 && (
          <>
            <div className="reg-review">
              <h3>
                Company information{" "}
                <button type="button" onClick={() => setStep(0)}>
                  Edit
                </button>
              </h3>
              <p>
                {v.companyName} · {v.companyType}
              </p>
              <p>
                {[
                  v.street,
                  v.barangay,
                  v.city,
                  v.province,
                  v.region,
                  v.zip,
                ].join(", ")}
              </p>
              <h3>
                Representative{" "}
                <button type="button" onClick={() => setStep(1)}>
                  Edit
                </button>
              </h3>
              <p>
                {v.representativeFirstName} {v.representativeLastName} ·{" "}
                {v.representativePosition}
              </p>
              <p>
                {normalizePhone(v.phoneNumber)} · {v.email}
              </p>
              <h3>
                Account credentials{" "}
                <button type="button" onClick={() => setStep(2)}>
                  Edit
                </button>
              </h3>
              <p>{v.email} · Password securely hidden</p>
              <h3>
                Documents{" "}
                <button type="button" onClick={() => setStep(3)}>
                  Edit
                </button>
              </h3>
              {Object.entries(files)
                .filter(([, f]) => f)
                .map(([k, f]) => (
                  <p key={k}>
                    {k}: {f.name}
                  </p>
                ))}
            </div>
            {check("ageReview", "I confirm that I am at least 18 years old.")}
            {check(
              "terms",
              <>
                I agree to the{" "}
                <Link to="/terms" target="_blank">
                  Terms and Conditions
                </Link>
                .
              </>,
            )}
            {check(
              "privacy",
              <>
                I acknowledge the{" "}
                <Link to="/privacy" target="_blank">
                  Privacy Policy
                </Link>
                .
              </>,
            )}
            {check(
              "authority",
              "I certify that the information is accurate and I am authorized to register this business.",
            )}
            {errors.agreement && (
              <p className="field-error">{errors.agreement}</p>
            )}
          </>
        )}
        {step === 5 && (
          <div className="reg-success">
            <ShieldCheck size={45} />
            <h3>Registration Submitted Successfully!</h3>
            <p>
              Thank you for registering! Your business registration has been
              submitted for administrator review. Your account will remain
              pending until an administrator approves it. You will receive an
              email notification after review.
            </p>
            <p>
              <strong>Reference:</strong> {reference}
            </p>
            <p>
              <strong>Company:</strong> {v.companyName}
            </p>
            <p>
              <strong>Email:</strong> {v.email}
            </p>
            <p>
              <strong>Status:</strong> Pending Approval
            </p>
            <p>
              <strong>Submitted:</strong> {new Date().toLocaleString("en-PH")}
            </p>
            <Link className="lime-button auth-submit" to="/login">
              Back to login <ArrowRight size={18} />
            </Link>
          </div>
        )}
        {message && (
          <div className="auth-feedback" role="status">
            {message}
          </div>
        )}
        {step < 5 && (
          <div className="reg-actions">
            {step > 0 && step < 5 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                className="lime-button"
                onClick={() => {
                  if (validate()) setStep((s) => s + 1);
                }}
              >
                Continue <ArrowRight size={17} />
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                className="lime-button"
                disabled={
                  busy || !v.ageReview || !v.terms || !v.privacy || !v.authority
                }
                onClick={submit}
              >
                {busy ? "Submitting…" : "Submit registration"}{" "}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
function Login() {
  const navigate = useNavigate();
  const { login } = useDemoAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      navigate("/", { replace: true, state: { showLoginWelcome: true } });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="auth-card-header">
        <span className="auth-label">
          <LockKeyhole size={17} /> Client access
        </span>
        <h2>Welcome back</h2>
        <p>Sign in to your approved business account.</p>
      </div>
      <form onSubmit={submit}>
        <Field
          label="Email address"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="auth-password">
          <Field
            label="Password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShow((x) => !x)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button className="lime-button auth-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"} <ArrowRight size={18} />
        </button>
        {error && (
          <div className="auth-feedback" role="alert">
            {error}
          </div>
        )}
      </form>
    </>
  );
}
export default function AuthPage({ mode = "login" }) {
  const register = mode === "register";
  return (
    <div className="auth-page">
      <div className="auth-top">
        <Link to="/" className="auth-brand">
          <img src="/images/images/logo.webp" alt="One True Logistics" />
        </Link>
      </div>
      <div className="auth-layout">
        <section className="auth-showcase">
          <div className="auth-showcase-content">
            <div className="auth-eyebrow">
              <Truck size={17} /> ONE TRUE LOGISTICS INC.
            </div>
            <h1>
              Every container.
              <br />
              <em>One connected yard.</em>
            </h1>
            <p>
              Manage bookings, monitor yard movements and keep your logistics
              operation moving.
            </p>
            <div className="auth-trust">
              <ShieldCheck size={19} /> Secure client portal • Container yard
              management
            </div>
          </div>
        </section>
        <section className={`auth-card ${register ? "reg-card" : ""}`}>
          {register ? <Registration /> : <Login />}
          <p className="auth-legal-links">
            <Link to="/terms">Terms & Conditions</Link> ·{" "}
            <Link to="/privacy">Privacy Policy</Link>
          </p>
          <p className="auth-footer">
            {register
              ? "Already have an account?"
              : "New to One True Logistics?"}{" "}
            <Link to={register ? "/login" : "/register"}>
              {register ? "Sign in" : "Register"}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
