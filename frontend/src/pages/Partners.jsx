import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/FormUI";
import Marquee from "../components/Marquee";

export default function Partners() {
  const { t } = useI18n();
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    document.title = "Partners — Yobsman-Tech";
    api.get("/content/partners").then((r) => setPartners(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="partners-page">
      <PageHero eyebrow={t("sections.partnersEyebrow")} title={t("sections.partnersTitle")} desc={t("sections.partnersDesc")} />
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div data-testid="partners-grid" className="grid grid-cols-2 md:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {partners.map((p) => (
              <div key={p.id} className="group bg-[#F4F4F5] p-10 flex flex-col items-center justify-center text-center hover:bg-[#E9E9EC] transition-colors duration-500 min-h-[180px]">
                <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-zinc-500 group-hover:text-zinc-950 transition-colors duration-500">{p.name}</span>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-600 group-hover:text-zinc-700 transition-colors duration-300">
                    Visit <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Marquee items={partners.map((p) => p.name)} />
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 h-full hover:border-black/30 transition-colors duration-500">
                <span className="mono-label">Partner {String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-xl font-semibold text-zinc-950 mt-4">{p.name}</h3>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
