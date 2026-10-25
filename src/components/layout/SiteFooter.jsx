import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../../context/SiteSettingsContext";

export default function SiteFooter() {
  const { settings } = useSiteSettings();
  const office = settings.office || "To be supplied";
  const phone = settings.phone || "To be supplied";
  const email = settings.email || "To be supplied";
  const hours = settings.operatingHours || "To be supplied";

  return (
    <footer className="bg-[#020b1a] text-white">
      <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <span className="inline-flex rounded-2xl bg-white px-4 py-2">
              <img
                src="/images/logo.webp"
                alt="Trans Roadway Logistics Inc."
                className="h-14 w-auto"
              />
            </span>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              Reliable logistics coordination, container handling support, and
              client booking visibility for businesses moving cargo through the
              Philippines.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
              Explore
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                className="block text-white/75 hover:text-white"
                to="/services"
              >
                Services
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/rates"
              >
                Rates
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/about"
              >
                About
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/contact"
              >
                Contact
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
              Client
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <Link
                className="block text-white/75 hover:text-white"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/register"
              >
                Register
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/portal/pre-advice"
              >
                Booking
              </Link>
              <Link
                className="block text-white/75 hover:text-white"
                to="/portal"
              >
                Client Portal
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
              Contact
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span className="whitespace-pre-line">{office}</span>
              </p>
              <p className="flex gap-2">
                <Phone size={16} className="mt-0.5 shrink-0" />
                {settings.phone ? (
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="hover:text-white"
                  >
                    {phone}
                  </a>
                ) : (
                  phone
                )}
              </p>
              <p className="flex gap-2">
                <Mail size={16} className="mt-0.5 shrink-0" />
                {settings.email ? (
                  <a
                    href={`mailto:${settings.email}`}
                    className="break-all hover:text-white"
                  >
                    {email}
                  </a>
                ) : (
                  email
                )}
              </p>
              <p className="flex gap-2">
                <Clock3 size={16} className="mt-0.5 shrink-0" />
                <span className="whitespace-pre-line">{hours}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Trans Roadway Logistics Inc. All rights
            reserved.
          </p>
          <div className="flex gap-5">
            <Link
              className="inline-flex items-center gap-1 hover:text-white"
              to="/terms"
            >
              Terms <ArrowUpRight size={12} />
            </Link>
            <Link
              className="inline-flex items-center gap-1 hover:text-white"
              to="/privacy-policy"
            >
              Privacy <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
