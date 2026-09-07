import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { Field, inputCls, CTAButton } from "../components/FormUI";

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setDone(true);
    } catch (err) {
      setDone(true); // never reveal account existence
      void errMsg;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="forgot-page" className="min-h-screen flex items-center justify-center relative px-4">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl glass p-8 sm:p-10 my-32">
        <h1 className="font-display text-3xl font-bold text-zinc-950">{t("auth.forgotTitle")}</h1>
        <p className="text-sm text-zinc-500 mt-2 mb-8">{t("auth.forgotSub")}</p>
        {done ? (
          <div data-testid="forgot-success" className="flex items-start gap-3 text-sm text-zinc-700">
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <p>If an account exists for this address, a reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" data-testid="forgot-form">
            <Field label={t("form.email")} htmlFor="f-email"><input id="f-email" data-testid="forgot-email-input" type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <CTAButton data-testid="forgot-submit-btn" type="submit" disabled={busy} className="w-full">{busy ? t("common.submitting") : t("auth.sendLink")}</CTAButton>
          </form>
        )}
        <p className="mt-6 text-xs text-zinc-500"><Link to="/login" className="text-zinc-700 underline underline-offset-4 decoration-black/30">{t("nav.login")}</Link></p>
      </div>
    </div>
  );
}
