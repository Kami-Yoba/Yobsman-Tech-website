import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ClipboardCheck, FileCheck, Files, FileText, Globe,
  Languages, Lock, Send, ShieldCheck,
} from "lucide-react";
import { useI18n } from "../i18n";
import { Reveal, SectionHead } from "../components/Reveal";
import { PageHero, linkBtnCls } from "../components/FormUI";
import SmartChecklist from "../components/SmartChecklist";

const DOC_SERVICE = "Documentation Assistance";

const EVERYDAY_SERVICES = [
  { icon: Globe, title: "Immigration assistance", desc: "Guidance and paperwork support for visas, residence permits, citizenship and related immigration applications." },
  { icon: FileCheck, title: "Tax assistance", desc: "Help understanding, completing and organizing tax forms, registrations, returns, corrections and supporting documents." },
  { icon: FileText, title: "Document drafting", desc: "Clear drafting and review of applications, official letters, statements and supporting documents tailored to your situation." },
  { icon: Send, title: "Application submission", desc: "We compile, check and help submit applications to the right authority, then keep track of the next steps." },
  { icon: Files, title: "Everyday-life documentation", desc: "Support with registrations, certificates, housing, banking, employment, education, healthcare and other daily-life paperwork." },
];

const PROCESS = [
  { n: "01", title: "Tell us what you need", desc: "Share your goal, deadline and the country or authority involved." },
  { n: "02", title: "We map the requirements", desc: "You receive a clear checklist of required documents, forms and supporting evidence." },
  { n: "03", title: "We prepare and review", desc: "We draft, complete and carefully check your paperwork before it is sent anywhere." },
  { n: "04", title: "We submit and follow up", desc: "We help file the application, track progress and explain what happens next." },
];

const SUPPORT = [
  { icon: Lock, title: "Confidential handling", desc: "Personal documents and sensitive information are handled with strict care and discretion." },
  { icon: Languages, title: "Multilingual guidance", desc: "Documentation support in your preferred language, with clear explanations at every step." },
  { icon: Globe, title: "Remote-first help", desc: "Consult online from wherever you are, with secure digital document handling." },
  { icon: ClipboardCheck, title: "Clear next steps", desc: "Know exactly what has been done, what is pending and what comes next." },
];

const localizedItem = (translated, fallback, index, field) =>
  (Array.isArray(translated) && translated[index]?.[field]) || fallback[field];

export default function DocumentationAssistance() {
  const { t } = useI18n();
  useEffect(() => {
    document.title = `${t("doc.title")} — Yobsman-Tech`;
  }, [t]);

  const servicesT = t("doc.services");
  const processT = t("doc.process");
  const supportT = t("doc.support");

  return (
    <div data-testid="documentation-assistance-page">
      <PageHero eyebrow={t("doc.eyebrow")} title={t("doc.title")} desc={t("doc.intro")} />

      <section data-testid="doc-services-section" className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("doc.servicesEyebrow")} title={t("doc.servicesTitle")} desc={t("doc.servicesDesc")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EVERYDAY_SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.05}>
                <div data-testid={`doc-service-card-${i + 1}`} className="rounded-2xl border border-black/10 bg-white p-8 h-full hover:border-black/30 hover:-translate-y-1 transition-[border-color,transform] duration-500">
                  <service.icon size={22} className="text-zinc-500" />
                  <h3 className="font-display text-xl font-semibold text-zinc-950 mt-5">
                    {localizedItem(servicesT, service, i, "title")}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                    {localizedItem(servicesT, service, i, "desc")}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.25}>
              <div data-testid="doc-services-cta-card" className="rounded-2xl bg-zinc-950 text-white p-8 h-full flex flex-col justify-between">
                <div>
                  <p className="mono-label !text-zinc-500">Yobsman-Tech</p>
                  <h3 className="font-display text-2xl font-semibold mt-5">{t("doc.cardCtaTitle")}</h3>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{t("doc.cardCtaDesc")}</p>
                </div>
                <Link to={`/book?service=${encodeURIComponent(DOC_SERVICE)}`} data-testid="doc-card-book-link" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-zinc-300 transition-colors duration-300">
                  {t("common.bookAppointment")} <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section data-testid="doc-process-section" className="py-24 bg-[#F4F4F5] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow={t("doc.processEyebrow")} title={t("doc.processTitle")} desc={t("doc.processDesc")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.06}>
                <div data-testid={`doc-process-step-${step.n}`} className="rounded-2xl bg-white border border-black/10 p-8 h-full hover:border-black/30 transition-colors duration-300">
                  <span className="font-mono text-sm text-zinc-400">{step.n}</span>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 mt-3">
                    {localizedItem(processT, step, i, "title")}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                    {localizedItem(processT, step, i, "desc")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SmartChecklist />

      <section data-testid="doc-support-section" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("doc.supportEyebrow")} title={t("doc.supportTitle")} desc={t("doc.supportDesc")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUPPORT.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div data-testid={`doc-support-card-${i + 1}`} className="rounded-2xl border border-black/10 bg-white p-7 h-full">
                  <item.icon size={20} className="text-zinc-500" />
                  <h3 className="font-display text-base font-semibold text-zinc-950 mt-4">
                    {localizedItem(supportT, item, i, "title")}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    {localizedItem(supportT, item, i, "desc")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 sm:p-10">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold text-zinc-950 flex items-center gap-3"><ShieldCheck size={22} /> {t("doc.ctaTitle")}</h3>
              <p className="text-sm text-zinc-600 mt-2">{t("doc.ctaDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={`/book?service=${encodeURIComponent(DOC_SERVICE)}`} data-testid="doc-book-cta" className={linkBtnCls.solid}>{t("common.bookAppointment")} <ArrowRight size={16} /></Link>
              <Link to={`/quote?service=${encodeURIComponent(DOC_SERVICE)}`} data-testid="doc-quote-cta" className={linkBtnCls.ghost}>{t("common.requestQuote")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
