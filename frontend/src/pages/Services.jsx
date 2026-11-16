import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { iconFor, servicePath, TIKTOK_JOIN_URL } from "../lib/content";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-px rounded-2xl overflow-hidden border border-black/10 bg-black/10">
          {services.map((s, i) => {
            const Icon = iconFor(s.icon);
            const detailPath = servicePath(s);
            return (
              <Reveal key={s.id} delay={i * 0.03}>
                <div data-testid={`service-row-${s.code}`}
                  className="group grid md:grid-cols-12 gap-6 items-center bg-[#F4F4F5] hover:bg-[#E9E9EC] px-6 sm:px-10 py-10 transition-colors duration-500">
                  <div className="md:col-span-1"><span className="font-mono text-sm text-zinc-600">{s.code}</span></div>
                  <div className="md:col-span-1">
                    <div className="w-12 h-12 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center group-hover:border-black/30 transition-colors duration-500">
                      <Icon size={20} className="text-zinc-700" />
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <Link to={detailPath} data-testid={`service-detail-${s.code}`} className="inline-flex items-center gap-2 font-display text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight hover:text-zinc-600 transition-colors duration-300">
                      {s.title} <ArrowUpRight size={22} />
                    </Link>
                    <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl">{s.desc}</p>
                  </div>
                  <div className="md:col-span-4 flex flex-col items-stretch md:items-end gap-3">
                    <Link to={`/book?service=${encodeURIComponent(s.title)}`} data-testid={`service-book-${s.code}`} className={`${linkBtnCls.ghost} justify-center`}>
                      {t("common.bookAppointment")} <ArrowUpRight size={15} />
                    </Link>
                    {s.code === "SRV-11" ? (
                      <Link to={TIKTOK_JOIN_URL} data-testid={`service-join-${s.code}`} className={`${linkBtnCls.solid} justify-center`}>
                        {t("serviceDetail.joinFree")} <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <Link to={`/quote?service=${encodeURIComponent(s.title)}`} data-testid={`service-quote-${s.code}`} className={`${linkBtnCls.solid} justify-center`}>
                        {t("common.requestQuote")} <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-16 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 sm:p-10">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950">{t("common.needSolution")}</h2>
            <Link to="/contact" data-testid="services-contact-cta" className={linkBtnCls.solid}>{t("common.talkExpert")} <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
