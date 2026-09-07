import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { iconFor } from "../lib/content";
import { Reveal } from "../components/Reveal";
import { PageHero, linkBtnCls } from "../components/FormUI";

export default function Services() {
  const { t } = useI18n();
  const [services, setServices] = useState([]);

  useEffect(() => {
    document.title = "Services — Yobsman-Tech";
    api.get("/content/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="services-page">
      <PageHero eyebrow={t("sections.servicesEyebrow")} title={t("sections.servicesTitle")} desc={t("sections.servicesDesc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-px rounded-2xl overflow-hidden border border-white/10 bg-white/10">
          {services.map((s, i) => {
            const Icon = iconFor(s.icon);
            return (
              <Reveal key={s.id} delay={i * 0.03}>
                <div data-testid={`service-row-${s.code}`}
                  className="group grid md:grid-cols-12 gap-6 items-center bg-[#0A0A0C] hover:bg-[#141418] px-6 sm:px-10 py-10 transition-colors duration-500">
                  <div className="md:col-span-1"><span className="font-mono text-sm text-zinc-600">{s.code}</span></div>
                  <div className="md:col-span-1">
                    <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-white/30 transition-colors duration-500">
                      <Icon size={20} className="text-zinc-300" />
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-50 tracking-tight">{s.title}</h2>
                    <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">{s.desc}</p>
                  </div>
                  <div className="md:col-span-4 flex md:justify-end gap-3">
                    <Link to={`/quote?service=${encodeURIComponent(s.title)}`} data-testid={`service-quote-${s.code}`} className={linkBtnCls.solid}>
                      {t("common.requestQuote")} <ArrowRight size={15} />
                    </Link>
                    <Link to={`/book?service=${encodeURIComponent(s.title)}`} className={linkBtnCls.ghost}>
                      {t("common.bookAppointment")} <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-16 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-50">{t("common.needSolution")}</h2>
            <Link to="/contact" data-testid="services-contact-cta" className={linkBtnCls.solid}>{t("common.talkExpert")} <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
