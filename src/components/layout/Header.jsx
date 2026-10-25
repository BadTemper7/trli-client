import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDemoAuth } from "../../context/DemoAuth";
import { clientApi } from "../../api/client";
import useClientData from "../../api/useClientData";
import {
  Bell,
  ChevronDown,
  Home,
  ClipboardList,
  Truck,
  Container,
  LogOut,
  UserRound,
  Settings,
  Headphones,
  CreditCard,
  History,
  Menu,
  X,
  Search,
  Tag,
  BriefcaseBusiness,
  Info,
  Mail,
  ArrowRight,
} from "lucide-react";
const publicNav = [
  ["/", "Home", Home],
  ["/services", "Services", BriefcaseBusiness],
  ["/about", "About", Info],
  ["/contact", "Contact", Mail],
  ["/rates", "Rates", Tag],
];
const privateNav = [
  ["/", "Home", Home],
  ["/bookings", "My Bookings", ClipboardList],
  ["/containers", "My Containers", Container],
  ["/services", "Services", BriefcaseBusiness],
  ["/rates", "Rates", Tag],
];
const menu = [
  ["/profile", "My Profile", UserRound],
  ["/payments", "Payments & Billing", CreditCard],
  ["/history", "Transaction History", History],
  ["/support", "Help & Support", Headphones],
  ["/settings", "Settings", Settings],
  ["/login", "Sign In", LogOut],
  ["/register", "Register", UserRound],
  ["/gate-in", "Gate-In", Truck],
  ["/gate-out", "Gate-Out", LogOut],
];
export default function Header() {
  const [open, setOpen] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false),
    [search, setSearch] = useState("");
  const holder = useRef(null),
    notificationHolder = useRef(null);
  const navigate = useNavigate();
  const { loggedIn, logout, user } = useDemoAuth();
  const { data: notifications } = useClientData(
    loggedIn ? clientApi.notifications : async () => ({ unreadCount: 0 }),
    [loggedIn],
  );
  const unread = notifications?.unreadCount || 0;
  const displayName =
    [user?.representativeFirstName, user?.representativeLastName]
      .filter(Boolean)
      .join(" ") ||
    user?.name ||
    user?.companyName ||
    user?.email?.split("@")[0] ||
    "Account";
  const nav = loggedIn ? privateNav : publicNav;
  const location = window.location;
  useEffect(() => {
    function outside(e) {
      if (!holder.current?.contains(e.target)) setOpen(false);
      if (!notificationHolder.current?.contains(e.target))
        setNotificationsOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const searchSubmit = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate(`/bookings?q=${encodeURIComponent(search.trim())}`);
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="One True Logistics home">
          <img src="/images/images/logo.webp" alt="ONE TRUE LOGISTICS INC." />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([path, label, Icon]) => (
            <NavLink
              to={path}
              key={path}
              end={path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {loggedIn && (
            <form className="header-search" onSubmit={searchSubmit}>
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booking ID..."
                aria-label="Search bookings"
              />
            </form>
          )}
          {loggedIn && (
            <div className="notification-popover-wrap" ref={notificationHolder}>
              <button
                type="button"
                className="icon-button notification"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
                aria-controls="notification-popover"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setOpen(false);
                }}
              >
                <Bell size={21} />
                {unread > 0 && (
                  <span className="alert-dot">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div id="notification-popover" className="notification-popover">
                  <div className="notification-popover-heading">
                    <strong>Notifications</strong>
                    <span>{unread} unread</span>
                  </div>
                  <div className="notification-popover-list">
                    {(notifications?.notifications || [])
                      .slice(0, 5)
                      .map((n) => (
                        <Link
                          key={n.id}
                          to={
                            n.booking
                              ? `/bookings/${typeof n.booking === "object" ? n.booking.id || n.booking._id : n.booking}`
                              : "/notifications"
                          }
                          className={`notification-popover-item ${n.isRead ? "" : "is-unread"}`}
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <span className="notification-popover-dot" />
                          <span>
                            <strong>{n.title || "Notification"}</strong>
                            <small>{n.message}</small>
                          </span>
                        </Link>
                      ))}
                    {!notifications?.notifications?.length && (
                      <p className="notification-popover-empty">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    className="notification-popover-footer"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all notifications <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}
          {loggedIn ? (
            <div className="profile-wrap" ref={holder}>
              <button
                className="profile-trigger"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label="Account menu"
              >
                <span className="avatar">
                  <UserRound size={23} />
                </span>
                <span className="profile-copy">
                  {displayName}
                  <small>{user?.companyName || "Business account"}</small>
                </span>
                <ChevronDown size={15} />
              </button>
              {open && (
                <div className="profile-dropdown">
                  {menu
                    .filter(([url]) => url !== "/login" && url !== "/register")
                    .map(([url, label, Icon]) => (
                      <Link key={url} onClick={() => setOpen(false)} to={url}>
                        <Icon size={17} />
                        {label}
                      </Link>
                    ))}
                  <button
                    className="demo-signout"
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth">
              <Link className="header-register" to="/register">
                Register
              </Link>
              <Link className="header-signin" to="/login">
                Sign In
              </Link>
            </div>
          )}
          <button
            className="mobile-menu-toggle"
            aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {mobileMenu && (
        <nav className="tablet-nav">
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} onClick={() => setMobileMenu(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {loggedIn ? (
            <button
              className="demo-signout"
              onClick={() => {
                logout();
                setMobileMenu(false);
                navigate("/");
              }}
            >
              Sign out
            </button>
          ) : (
            <>
              <NavLink to="/register" onClick={() => setMobileMenu(false)}>
                Register
              </NavLink>
              <NavLink to="/login" onClick={() => setMobileMenu(false)}>
                Sign In
              </NavLink>
            </>
          )}
        </nav>
      )}
      {loggedIn && (
        <div className="mobile-search">
          <form onSubmit={searchSubmit}>
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search container or booking ID..."
              aria-label="Search container or booking ID"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}
    </header>
  );
}
