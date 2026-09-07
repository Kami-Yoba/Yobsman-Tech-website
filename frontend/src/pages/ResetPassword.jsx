import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { Field, inputCls, CTAButton } from "../components/FormUI";

export default function ResetPassword() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated. You can now sign in.");
      navigate("/login");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="reset-page" className="min-h-screen flex items-center justify-center relative px-4">
      <div className="absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl glass p-8 sm:p-10 my-32">
        <h1 className="font-display text-3xl font-bold text-zinc-950">{t("auth.resetTitle")}</h1>
        {!token ? (
          <p className="text-sm text-red-400 mt-6">Invalid or missing reset token.</p>
        ) : (
          <form onSubmit={submit} className="space-y-5 mt-8" data-testid="reset-form">
            <Field label={t("auth.password")} htmlFor="rp-pass"><input id="rp-pass" data-testid="reset-password-input" type="password" required minLength={8} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
            {error && <p data-testid="reset-error" role="alert" className="text-xs text-red-400">{error}</p>}
            <CTAButton data-testid="reset-submit-btn" type="submit" disabled={busy} className="w-full">{busy ? t("common.submitting") : t("auth.resetBtn")}</CTAButton>
          </form>
        )}
        <p className="mt-6 text-xs text-zinc-500"><Link to="/login" className="text-zinc-700 underline underline-offset-4 decoration-black/30">{t("nav.login")}</Link></p>
      </div>
    </div>
  );
}
