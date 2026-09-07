import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "./LanguageSelector";

const LINKS = [
  ["about", "/about"], ["services", "/services"], ["solutions", "/solutions"],
  ["kagayo", "/kagayo"], ["leadership", "/leadership"], ["partners", "/partners"],
  ["careers", "/careers"], ["insights", "/insights"], ["contact", "/contact"],
];

export default function Navbar() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-testid="navbar" className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${scrolled || open ? "bg-[#FAFAFA]/85 backdrop-blur-2xl border-b border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" : "bg-transparent border-b border-transparent"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4" aria-label="Main navigation">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}>
          <img src="/assets/yobsman-logo.png" alt="Yobsman-Tech" className="h-11 sm:h-14 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {LINKS.slice(0, 7).map(([key, to]) => (
            <NavLink key={key} to={to} data-testid={`nav-link-${key}`}
              className={({ isActive }) => `text-[13px] tracking-wide transition-colors duration-300 ${isActive ? "text-zinc-950" : "text-zinc-600 hover:text-zinc-950"}`}>
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSelector />
          <Link to="/book" data-testid="nav-book-btn" className="text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
            {t("nav.book")}
          </Link>
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/dashboard"} data-testid="nav-account-btn"
              className="flex items-center gap-2 text-[13px] text-zinc-700 hover:text-zinc-950 transition-colors duration-300">
              <User size={15} /> {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
            </Link>
          ) : (
            <Link to="/login" data-testid="nav-login-btn" className="text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
              {t("nav.login")}
            </Link>
          )}
          <Link to="/quote" data-testid="nav-quote-btn"
            className="rounded-full bg-zinc-950 text-white text-[13px] font-semibold px-5 py-2 hover:bg-zinc-800 hover:shadow-[0_0_24px_rgba(9,9,11,0.2)] transition-[background-color,box-shadow] duration-300">
            {t("nav.quote")}
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-3">
          <LanguageSelector />
          <button data-testid="nav-menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 text-zinc-700 hover:text-zinc-950 transition-colors duration-200">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden bg-[#FAFAFA]/95 backdrop-blur-2xl border-t border-black/10">
          <div className="px-6 py-6 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {LINKS.map(([key, to]) => (
              <button key={key} data-testid={`mobile-nav-${key}`} onClick={() => { setOpen(false); navigate(to); }}
                className="text-start py-3 text-lg text-zinc-700 hover:text-zinc-950 border-b border-black/5 transition-colors duration-200">
                {t(`nav.${key}`)}
              </button>
            ))}
            <div className="flex gap-3 pt-5">
              <button data-testid="mobile-nav-login" onClick={() => { setOpen(false); navigate(user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"); }}
                className="flex-1 rounded-full border border-black/20 text-zinc-950 text-sm py-3">
                {user ? t("nav.dashboard") : t("nav.login")}
              </button>
              <button data-testid="mobile-nav-quote" onClick={() => { setOpen(false); navigate("/quote"); }}
                className="flex-1 rounded-full bg-zinc-950 text-white text-sm font-semibold py-3">
                {t("nav.quote")}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
