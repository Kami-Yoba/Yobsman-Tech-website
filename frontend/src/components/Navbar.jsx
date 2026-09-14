import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, LogOut, Menu, User, X, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LanguageSelector from "./LanguageSelector";

const LINKS = [
  ["about", "/about"], ["services", "/services"], ["solutions", "/solutions"],
  ["kagayo", "/kagayo"], ["leadership", "/leadership"], ["partners", "/partners"],
  ["careers", "/careers"], ["insights", "/insights"], ["contact", "/contact"],
];
const STAFF_ROLES = ["admin", "super_admin", "hr", "support", "sales", "content"];

function ProfileMenu({ user, onSignOut, prefix, compact = false }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isStaff = STAFF_ROLES.includes(user.role);
  const destination = isStaff ? "/admin" : "/dashboard";
  const firstName = (user.name || "Account").trim().split(/\s+/)[0];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!event.target.closest("[data-profile-root]")) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const goToAccount = () => {
    setOpen(false);
    navigate(destination);
  };

  const signOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div data-profile-root className="relative">
      <button type="button" data-testid={`${prefix}-profile-btn`} onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-2.5 py-2 text-zinc-700 hover:border-black/30 hover:text-zinc-950 transition-[border-color,color,background-color] duration-300">
        <span className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[11px] font-semibold">
          {firstName.slice(0, 1).toUpperCase()}
        </span>
        {!compact && <span className="hidden lg:inline text-[13px] font-medium whitespace-nowrap">{firstName}</span>}
        <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div data-testid={`${prefix}-profile-menu`} role="menu"
          className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-black/10 bg-[#FAFAFA]/95 backdrop-blur-2xl shadow-2xl p-3 z-[70]">
          <div className="px-3 py-3 border-b border-black/5">
            <p data-testid={`${prefix}-profile-name`} className="font-display text-sm font-semibold text-zinc-950">{user.name}</p>
            <p data-testid={`${prefix}-profile-email`} className="text-xs text-zinc-500 mt-1 truncate">{user.email}</p>
          </div>
          <button type="button" data-testid={`${prefix}-profile-account-link`} onClick={goToAccount} role="menuitem"
            className="mt-2 w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors duration-200">
            <User size={15} /> {isStaff ? t("nav.admin") : t("nav.dashboard")}
          </button>
          <button type="button" data-testid={`${prefix}-profile-signout`} onClick={signOut} role="menuitem"
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors duration-200">
            <LogOut size={15} /> {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goBack = () => {
    setOpen(false);
    if (location.key === "default") navigate("/");
    else navigate(-1);
  };

  const signOut = async () => {
    setOpen(false);
    navigate("/", { replace: true });
    await logout();
    toast.success(t("nav.signedOut"));
  };

  return (
    <header data-testid="navbar" className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${scrolled || open ? "bg-[#FAFAFA]/85 backdrop-blur-2xl border-b border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" : "bg-transparent border-b border-transparent"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4" aria-label="Main navigation">
        <div className="flex items-center gap-2 shrink-0">
          {location.pathname !== "/" && (
            <button type="button" data-testid="nav-back-btn" onClick={goBack} aria-label={t("nav.back")}
              className="p-2 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-black/5 transition-[color,background-color] duration-300">
              <ArrowLeft size={18} />
            </button>
          )}
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
            <img src="/assets/yobsman-logo.png" alt="Yobsman-Tech" className="h-11 sm:h-14 w-auto" />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {LINKS.slice(0, 7).map(([key, to]) => (
            <NavLink key={key} to={to} data-testid={`nav-link-${key}`}
              className={({ isActive }) => `text-[13px] tracking-wide transition-colors duration-300 ${isActive ? "text-zinc-950" : "text-zinc-600 hover:text-zinc-950"}`}>
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button data-testid="theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="p-2 text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <LanguageSelector />
          {user ? (
            <ProfileMenu user={user} onSignOut={signOut} prefix="nav" />
          ) : (
            <Link to="/login" data-testid="nav-login-btn" className="text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
              {t("nav.login")}
            </Link>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button data-testid="theme-toggle-mobile" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="p-2 text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LanguageSelector />
          {user ? (
            <ProfileMenu user={user} onSignOut={signOut} prefix="mobile" compact />
          ) : (
            <Link to="/login" data-testid="mobile-login-link" aria-label={t("nav.login")}
              className="p-2 rounded-full text-zinc-700 hover:text-zinc-950 hover:bg-black/5 transition-[color,background-color] duration-200">
              <User size={19} />
            </Link>
          )}
          <button data-testid="nav-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 text-zinc-700 hover:text-zinc-950 transition-colors duration-200">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden absolute right-3 top-full mt-2 w-72 max-h-[70vh] overflow-y-auto rounded-2xl border border-black/10 bg-[#FAFAFA]/95 backdrop-blur-2xl shadow-2xl">
          <div className="p-3 flex flex-col gap-1">
            {LINKS.map(([key, to]) => (
              <button key={key} data-testid={`mobile-nav-${key}`} onClick={() => { setOpen(false); navigate(to); }}
                className="text-start px-4 py-3 rounded-xl text-base text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors duration-200">
                {t(`nav.${key}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
