import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { en } from "./en";
import { translations } from "./translations";
import { legalObc } from "./legalObc";
import { LANGUAGES } from "./languages";

const I18nContext = createContext(null);

function lookup(dict, key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("lang");
    const saved = localStorage.getItem("yt_lang");
    const initial = url || saved || "en";
    return LANGUAGES.some((l) => l.code === initial) ? initial : "en";
  });

  const active = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem("yt_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = active.dir;
  }, [lang, active.dir]);

  const t = useCallback((key) => {
    const merged = lang !== "en" ? { ...translations[lang], ...legalObc[lang] } : null;
    const local = merged ? lookup(merged, key) : undefined;
    if (local !== undefined) return local;
    const fallback = lookup(en, key);
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir: active.dir, languages: LANGUAGES }), [lang, setLang, t, active.dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
