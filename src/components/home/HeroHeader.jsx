import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/", end: true },
  { label: "Rates", to: "/rates" },
  { label: "Services", to: "/services" },
  { label: "About", href: "#about" },
  { label: "Contact", to: "/contact" },
];

function ArrowBubble({ dark = false }) {
  return (
    <span
      className={`grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 ${
        dark ? "bg-[#020b1a] text-white" : "bg-white text-[#ff111c]"
      }`}
      aria-hidden="true"
    >
      <ArrowRight size={16} strokeWidth={2.5} />
    </span>
  );
}

export default function HeroHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-5">
      <div className="relative mx-auto flex max-w-[1760px] items-start justify-between">
        <nav
          aria-label="Primary navigation"
          className="hidden rounded-2xl border border-white/20 bg-[#071829]/80 p-2 shadow-sm backdrop-blur-md lg:flex"
        >
          {navItems.map((item) => {
            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#ff111c] text-white shadow-[0_8px_24px_rgba(255,17,28,0.28)]"
                      : "text-white hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <Link
          to="/"
          aria-label="Trans Roadway Logistics Inc. home"
          className="absolute left-1/2 top-[-20px] hidden w-[280px] -translate-x-1/2 rounded-b-[30px] bg-white px-7 pb-5 pt-7 shadow-[0_12px_35px_rgba(2,11,26,0.10)] lg:block xl:w-[300px]"
        >
          <img
            src="/images/logo.webp"
            alt="Trans Roadway Logistics Inc."
            className="mx-auto h-auto w-full object-contain"
          />
        </Link>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link
            to="/login"
            className="group inline-flex items-center gap-5 rounded-2xl bg-white px-6 py-3 font-bold text-[#07111f] shadow-sm transition hover:-translate-y-0.5"
          >
            Login <ArrowBubble dark />
          </Link>
          <Link
            to="/register"
            className="group inline-flex items-center gap-5 rounded-2xl bg-[#ff111c] px-6 py-3 font-bold text-white shadow-[0_12px_30px_rgba(255,17,28,0.25)] transition hover:-translate-y-0.5 hover:bg-[#e70b15]"
          >
            Register <ArrowBubble />
          </Link>
        </div>

        <div className="flex w-full items-center justify-between lg:hidden">
          <Link
            to="/"
            aria-label="Trans Roadway Logistics Inc. home"
            className="rounded-2xl bg-white px-4 py-2 shadow-sm"
          >
            <img
              src="/images/logo.webp"
              alt="Trans Roadway Logistics Inc."
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-[#071829]/85 text-white backdrop-blur-md transition hover:bg-[#071829]"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-[1760px] rounded-2xl border border-white/15 bg-[#071829]/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {navItems.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-white hover:bg-white/10"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-semibold ${
                      isActive
                        ? "bg-[#ff111c] text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-white px-4 py-3 text-center font-bold text-[#07111f]"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-[#ff111c] px-4 py-3 text-center font-bold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
