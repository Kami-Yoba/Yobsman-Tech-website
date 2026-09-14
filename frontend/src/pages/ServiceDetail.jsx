import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle, ClipboardCheck, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { iconFor } from "../lib/content";
import { SERVICE_DETAILS } from "../lib/serviceDetails";
import { Reveal, SectionHead } from "../components/Reveal";
import { PageHero, linkBtnCls } from "../components/FormUI";

const OUTCOME_ICONS = [TrendingUp, Clock, ShieldCheck, ClipboardCheck];

export default function ServiceDetail() {
  const { slug } = useParams();
  const { t } = useI18n();
  const detail = SERVICE_DETAILS[slug];
  const [service, setService] = useState(null);

  useEffect(() => {
    if (!detail) return;
    api.get("/content/services")
      .then((r) => setService(r.data.find((s) => s.code === detail.code) || null))
      .catch(() => {});
  }, [detail]);

  useEffect(() => {
    if (detail) document.title = `${service?.title || detail.title} — Yobsman-Tech`;
  }, [detail, service]);

  if (!detail) return <Navigate to="/services" replace />;

  const title = service?.title || detail.title;
  const desc = service?.desc || detail.desc;
  const Icon = iconFor(service?.icon || "Code");

  return (
    <div data-testid="service-detail-page">
      <PageHero eyebrow={`${detail.code} — ${t("serviceDetail.eyebrow")}`} title={title} desc={`${desc} ${detail.intro}`} />

      <section data-testid="service-included-section" className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("serviceDetail.includedEyebrow")} title={t("serviceDetail.includedTitle")} desc={t("serviceDetail.includedDesc")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {detail.included.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <div data-testid={`service-included-card-${i + 1}`} className="rounded-2xl border border-black/10 bg-white p-8 h-full hover:border-black/30 hover:-translate-y-1 transition-[border-color,transform] duration-500">
                  <CheckCircle size={22} className="text-zinc-500" />
                  <h3 className="font-display text-xl font-semibold text-zinc-950 mt-5">{item.title}</h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.25}>
              <div data-testid="service-included-cta-card" className="rounded-2xl bg-zinc-950 text-white p-8 h-full flex flex-col justify-between">
                <div>
                  <Icon size={24} className="text-zinc-300" />
                  <h3 className="font-display text-2xl font-semibold mt-5">{t("serviceDetail.cardTitle")}</h3>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{t("serviceDetail.cardDesc")}</p>
                </div>
                <Link to={`/book?service=${encodeURIComponent(title)}`} data-testid="service-card-book-link" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-zinc-300 transition-colors duration-300">
                  {t("common.bookAppointment")} <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section data-testid="service-process-section" className="py-24 bg-[#F4F4F5] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow={t("serviceDetail.processEyebrow")} title={t("serviceDetail.processTitle")} desc={t("serviceDetail.processDesc")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {detail.process.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div data-testid={`service-process-step-${i + 1}`} className="rounded-2xl bg-white border border-black/10 p-8 h-full hover:border-black/30 transition-colors duration-300">
                  <span className="font-mono text-sm text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 mt-3">{step.title}</h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section data-testid="service-outcomes-section" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("serviceDetail.outcomesEyebrow")} title={t("serviceDetail.outcomesTitle")} desc={t("serviceDetail.outcomesDesc")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {detail.outcomes.map((item, i) => {
              const OutcomeIcon = OUTCOME_ICONS[i % OUTCOME_ICONS.length];
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  <div data-testid={`service-outcome-card-${i + 1}`} className="rounded-2xl border border-black/10 bg-white p-7 h-full">
                    <OutcomeIcon size={20} className="text-zinc-500" />
                    <h3 className="font-display text-base font-semibold text-zinc-950 mt-4">{item.title}</h3>
                    <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 sm:p-10">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold text-zinc-950">{t("serviceDetail.ctaTitle")}</h3>
              <p className="text-sm text-zinc-600 mt-2">{t("serviceDetail.ctaDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={`/book?service=${encodeURIComponent(title)}`} data-testid="service-detail-book-cta" className={linkBtnCls.solid}>{t("common.bookAppointment")} <ArrowRight size={16} /></Link>
              <Link to={`/quote?service=${encodeURIComponent(title)}`} data-testid="service-detail-quote-cta" className={linkBtnCls.ghost}>{t("common.requestQuote")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
