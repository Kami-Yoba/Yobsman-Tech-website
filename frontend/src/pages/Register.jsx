import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Chrome, Facebook } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { errMsg } from "../lib/api";
import { Field, inputCls, CTAButton } from "../components/FormUI";

export default function Register() {
  const { t, languages, lang } = useI18n();
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", language: lang });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Register — Yobsman-Tech";
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(form.name, form.email, form.password, form.language);
      toast.success(t("dashboard.welcome"));
      navigate("/dashboard");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="register-page" className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="absolute inset-0 spotlight" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl glass p-8 sm:p-10 my-32">
        <img src="/assets/yobsman-logo.png" alt="Yobsman-Tech" className="h-12 mb-8" />
        <h1 className="font-display text-3xl font-bold text-zinc-950">{t("auth.registerTitle")}</h1>
        <p className="text-sm text-zinc-500 mt-2 mb-8">{t("auth.registerSub")}</p>
        <form onSubmit={submit} className="space-y-5" data-testid="register-form">
          <Field label={t("form.fullName")} htmlFor="r-name"><input id="r-name" data-testid="register-name-input" required minLength={2} className={inputCls} value={form.name} onChange={set("name")} autoComplete="name" /></Field>
          <Field label={t("form.email")} htmlFor="r-email"><input id="r-email" data-testid="register-email-input" type="email" required className={inputCls} value={form.email} onChange={set("email")} autoComplete="email" /></Field>
          <Field label={t("auth.password")} htmlFor="r-pass"><input id="r-pass" data-testid="register-password-input" type="password" required minLength={8} className={inputCls} value={form.password} onChange={set("password")} autoComplete="new-password" /></Field>
          <Field label={t("auth.confirmPassword")} htmlFor="r-confirm"><input id="r-confirm" data-testid="register-confirm-input" type="password" required minLength={8} className={inputCls} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></Field>
          <Field label={t("form.language")} htmlFor="r-lang">
            <select id="r-lang" data-testid="register-language-select" className={inputCls} value={form.language} onChange={set("language")}>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
          </Field>
          {error && <p data-testid="register-error" role="alert" className="text-xs text-red-400">{error}</p>}
          <CTAButton data-testid="register-submit-btn" type="submit" disabled={busy} className="w-full">{busy ? t("common.submitting") : t("auth.registerBtn")}</CTAButton>
        </form>
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex-1 h-px bg-black/10" />
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest">or continue with</span>
            <span className="flex-1 h-px bg-black/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button data-testid="google-signin-btn" type="button"
              onClick={() => {
                // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
                const redirectUrl = window.location.origin + "/dashboard";
                window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/15 py-3 text-sm font-medium text-zinc-800 hover:border-black/50 hover:bg-black/5 transition-[border-color,background-color] duration-300">
              <Chrome size={16} /> Google
            </button>
            <button data-testid="facebook-signin-btn" type="button"
              onClick={() => toast.info("Facebook sign-in is coming soon — app credentials are being configured.")}
              className="flex items-center justify-center gap-2 rounded-xl border border-black/15 py-3 text-sm font-medium text-zinc-800 hover:border-black/50 hover:bg-black/5 transition-[border-color,background-color] duration-300">
              <Facebook size={16} /> Facebook
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-zinc-500">{t("auth.haveAccount")} <Link to="/login" className="text-zinc-800 underline underline-offset-4 decoration-black/30 hover:text-zinc-950">{t("nav.login")}</Link></p>
      </div>
    </div>
  );
}
