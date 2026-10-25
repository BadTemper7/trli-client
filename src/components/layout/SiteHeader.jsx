import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { api } from "../../lib/api";

const publicLinks = [
  ["/", "Home", true],
  ["/services", "Services"],
  ["/rates", "Rates"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

const portalLinks = [
  ["/portal", "Overview", true],
  ["/portal/pre-advice", "Booking"],
  ["/rates", "Rates"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

function getInitials(user) {
  const first = user?.firstName?.trim()?.[0] || "";
  const last = user?.lastName?.trim()?.[0] || "";
  return `${first}${last}`.toUpperCase() || "CL";
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const navLinks = useMemo(() => (user ? portalLinks : publicLinks), [user]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (!user || notificationsLoaded) return;
    let active = true;
    api
      .get("/notifications")
      .then((response) => {
        if (!active) return;
        setNotifications(response.data?.data?.items || []);
        setNotificationsLoaded(true);
      })
      .catch(() => {
        if (active) setNotificationsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [user, notificationsLoaded]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationsLoaded(false);
      setNotificationsOpen(false);
      setProfileOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const handleNotification = (item) => {
      if (!item) return;
      setNotifications((current) => {
        const id = item._id || item.id;
        if (id && current.some((entry) => (entry._id || entry.id) === id))
          return current;
        return [item, ...current].slice(0, 100);
      });
    };
    socket.on("notification:new", handleNotification);
    return () => socket.off("notification:new", handleNotification);
  }, [socket, user]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setProfileOpen(false);
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      )
        setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const markRead = async (item) => {
    if (item.isRead) return;
    const id = item._id || item.id;
    if (!id) return;
    setNotifications((current) =>
      current.map((entry) =>
        (entry._id || entry.id) === id ? { ...entry, isRead: true } : entry,
      ),
    );
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // Keep UI responsive. A later refresh will reconcile persisted state.
    }
  };

  const markAllRead = async () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    try {
      await api.patch("/notifications/read-all");
    } catch {
      // A later refresh will reconcile persisted state.
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    navigate(`/portal/pre-advice?q=${encodeURIComponent(value)}`);
    setSearch("");
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="relative z-50 flex h-[72px] shrink-0 items-center border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link
          to={user ? "/portal" : "/"}
          className="flex min-w-0 shrink-0 items-center gap-3"
          aria-label="Trans Roadway Logistics Inc. home"
        >
          <img
            src="/images/logo.webp"
            alt="Trans Roadway Logistics Inc."
            className="h-10 w-auto object-contain sm:h-11"
          />
          <div className="hidden leading-tight md:block">
            <div className="text-[15px] font-extrabold tracking-[-0.02em] text-foreground">
              Trans Roadway
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground">
              Logistics Inc.
            </div>
          </div>
        </Link>

        <nav
          className="hidden min-w-0 items-center justify-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {navLinks.map(([to, label, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          {user ? (
            <>
              <form
                onSubmit={handleSearch}
                className="hidden items-center gap-2 rounded-xl border border-border bg-muted/45 px-3 py-2 xl:flex"
              >
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search booking ID..."
                  aria-label="Search booking ID"
                  className="w-[155px] bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
                />
              </form>
              <div className="relative hidden sm:block" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((value) => !value);
                    setProfileOpen(false);
                  }}
                  className="relative grid size-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="size-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-danger-600 px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-surface">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[360px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgba(15,23,42,0.32)]">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {unreadCount} unread
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-xs font-bold text-brand-700 hover:text-brand-600"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[390px] overflow-y-auto">
                      {!notificationsLoaded ? (
                        <div className="space-y-3 p-4">
                          {[0, 1, 2].map((item) => (
                            <div
                              key={item}
                              className="h-16 animate-pulse rounded-xl bg-muted"
                            />
                          ))}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <Bell className="mx-auto size-8 text-muted-foreground/45" />
                          <p className="mt-3 text-sm font-semibold text-foreground">
                            No notifications yet
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Verification and booking updates will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            type="button"
                            key={
                              item._id ||
                              item.id ||
                              `${item.title}-${item.createdAt}`
                            }
                            onClick={() => markRead(item)}
                            className={`flex w-full gap-3 border-b border-border/70 px-4 py-3.5 text-left last:border-b-0 hover:bg-muted/60 ${!item.isRead ? "bg-brand-50/45" : "bg-surface"}`}
                          >
                            <span
                              className={`mt-1 size-2 shrink-0 rounded-full ${!item.isRead ? "bg-brand-600" : "bg-border"}`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-foreground">
                                {item.title || "Notification"}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                {item.message}
                              </span>
                              <span className="mt-1.5 block text-[11px] font-medium text-muted-foreground/80">
                                {formatDate(item.createdAt)}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((value) => !value);
                    setNotificationsOpen(false);
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface pl-1.5 pr-2.5 text-left transition hover:bg-muted"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-[11px] font-extrabold text-white">
                    {getInitials(user)}
                  </span>
                  <span className="hidden max-w-[150px] leading-tight xl:block">
                    <span className="block truncate text-xs font-bold text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {user.company?.companyName || user.email}
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.32)]">
                    <div className="border-b border-border px-3 pb-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-xs font-extrabold text-white">
                          {getInitials(user)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-foreground">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.company?.companyName || user.email}
                          </span>
                        </span>
                      </div>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${user.company?.verificationStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : user.company?.verificationStatus === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {user.company?.verificationStatus === "REJECTED"
                          ? "Action Required"
                          : user.company?.verificationStatus || "Pending"}
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/portal/company"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        <Building2 className="size-4 text-muted-foreground" />{" "}
                        Company Profile
                      </Link>
                      <Link
                        to="/portal/documents"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        <Check className="size-4 text-muted-foreground" />{" "}
                        Documents
                      </Link>
                      <Link
                        to="/portal/account"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        <Settings className="size-4 text-muted-foreground" />{" "}
                        Account Settings
                      </Link>
                    </div>
                    <div className="border-t border-border pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-600 hover:bg-danger-50"
                      >
                        <LogOut className="size-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-sm">
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary !bg-danger-600 !px-4 !py-2 text-sm hover:!bg-danger-500"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-[72px] border-b border-border bg-surface p-4 shadow-lg lg:hidden">
          <nav
            className="mx-auto grid max-w-[1600px] gap-1"
            aria-label="Mobile navigation"
          >
            {navLinks.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700" : "text-foreground hover:bg-muted"}`
                }
              >
                {label}
              </NavLink>
            ))}
            {user ? (
              <div className="mt-2 grid gap-1 border-t border-border pt-3">
                <Link
                  to="/portal/company"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Company Profile
                </Link>
                <Link
                  to="/portal/documents"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Documents
                </Link>
                <Link
                  to="/portal/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Account Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-danger-600 hover:bg-danger-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary !bg-danger-600 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
