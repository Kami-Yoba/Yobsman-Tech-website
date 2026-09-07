import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n } from "../i18n";

export default function LanguageSelector() {
  const { lang, setLang, languages } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = languages.find((l) => l.code === lang);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button data-testid="nav-language-selector" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}
        className="flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors duration-300 py-2">
        <Globe size={15} />
        <span className="uppercase">{active?.code}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div data-testid="language-menu" role="listbox" aria-label="Select language"
          className="absolute right-0 top-full mt-2 w-60 max-h-72 overflow-y-auto glass rounded-xl p-2 shadow-2xl z-50">
          {languages.map((l) => (
            <button key={l.code} data-testid={`lang-option-${l.code}`} role="option" aria-selected={l.code === lang}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${l.code === lang ? "bg-black/10 text-zinc-950" : "text-zinc-600 hover:bg-zinc-950 hover:text-white"}`}>
              <span>{l.native}</span>
              {l.code === lang && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
