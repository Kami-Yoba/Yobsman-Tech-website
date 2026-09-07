import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { errMsg } from "../lib/api";
import { Field, inputCls, CTAButton } from "../components/FormUI";

export default function Login() {
  const { t } = useI18n();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login — Yobsman-Tech";
    if (user) navigate(user.role === "admin" ? "/admin" : "/dashboard");
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(email, password);
      toast.success(t("dashboard.welcome"));
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="absolute inset-0 spotlight" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl glass p-8 sm:p-10 my-32">
        <img src="/assets/yobsman-logo.png" alt="Yobsman-Tech" className="h-12 mb-8" />
        <h1 className="font-display text-3xl font-bold text-zinc-950">{t("auth.loginTitle")}</h1>
        <p className="text-sm text-zinc-500 mt-2 mb-8">{t("auth.loginSub")}</p>
        <form onSubmit={submit} className="space-y-5" data-testid="login-form">
          <Field label={t("form.email")} htmlFor="l-email"><input id="l-email" data-testid="login-email-input" type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <Field label={t("auth.password")} htmlFor="l-pass"><input id="l-pass" data-testid="login-password-input" type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
          {error && <p data-testid="login-error" role="alert" className="text-xs text-red-400">{error}</p>}
          <CTAButton data-testid="login-submit-btn" type="submit" disabled={busy} className="w-full">{busy ? t("common.submitting") : t("auth.loginBtn")}</CTAButton>
        </form>
        <div className="mt-6 flex flex-col gap-2 text-xs text-zinc-500">
          <Link to="/forgot-password" data-testid="forgot-password-link" className="hover:text-zinc-950 transition-colors duration-200">{t("auth.forgotPassword")}</Link>
          <p>{t("auth.noAccount")} <Link to="/register" data-testid="register-link" className="text-zinc-800 underline underline-offset-4 decoration-black/30 hover:text-zinc-950">{t("nav.register")}</Link></p>
          <p className="text-zinc-600 mt-3 border-t border-black/5 pt-4">{t("auth.oauthNote")}</p>
        </div>
      </div>
    </div>
  );
}
