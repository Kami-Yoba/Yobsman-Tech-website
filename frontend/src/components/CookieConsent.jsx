import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n";

export default function CookieConsent() {
  const { t } = useI18n();
  const [consent, setConsent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yt_consent")); } catch { return null; }
  });
  const [customizing, setCustomizing] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  if (consent) return null;

  const save = (p) => {
    const value = { necessary: true, ...p, at: new Date().toISOString() };
    localStorage.setItem("yt_consent", JSON.stringify(value));
    setConsent(value);
  };

  return (
    <div data-testid="cookie-banner" role="dialog" aria-label={t("cookies.title")}
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-6 sm:max-w-md z-[60] glass rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-zinc-400" />
        <p className="font-display font-semibold text-sm text-zinc-100">{t("cookies.title")}</p>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{t("cookies.text")}</p>
      {customizing && (
        <div className="space-y-2 mb-4 text-xs text-zinc-300">
          <label className="flex items-center gap-2 opacity-60">
            <input type="checkbox" checked disabled /> {t("cookies.necessaryLabel")}
          </label>
          <label className="flex items-center gap-2">
            <input data-testid="cookie-analytics-toggle" type="checkbox" checked={prefs.analytics}
              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} /> {t("cookies.analytics")}
          </label>
          <label className="flex items-center gap-2">
            <input data-testid="cookie-marketing-toggle" type="checkbox" checked={prefs.marketing}
              onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} /> {t("cookies.marketing")}
          </label>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button data-testid="cookie-accept-btn" onClick={() => save({ analytics: true, marketing: true })}
          className="rounded-full bg-white text-black text-xs font-semibold px-4 py-2 hover:bg-zinc-300 transition-colors duration-200">
          {t("cookies.accept")}
        </button>
        <button data-testid="cookie-necessary-btn" onClick={() => save({ analytics: false, marketing: false })}
          className="rounded-full border border-white/20 text-zinc-200 text-xs px-4 py-2 hover:border-white/50 transition-colors duration-200">
          {t("cookies.necessary")}
        </button>
        {customizing ? (
          <button data-testid="cookie-save-btn" onClick={() => save(prefs)}
            className="rounded-full border border-white/20 text-zinc-200 text-xs px-4 py-2 hover:border-white/50 transition-colors duration-200">
            {t("cookies.save")}
          </button>
        ) : (
          <button data-testid="cookie-customize-btn" onClick={() => setCustomizing(true)}
            className="rounded-full text-zinc-400 text-xs px-3 py-2 hover:text-white transition-colors duration-200">
            {t("cookies.customize")}
          </button>
        )}
      </div>
    </div>
  );
}
