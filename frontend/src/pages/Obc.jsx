import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plane, CreditCard, PackageCheck, ShieldCheck, Globe, Clock, FileCheck } from "lucide-react";
import { useI18n } from "../i18n";
import { Reveal, SectionHead } from "../components/Reveal";
import { PageHero, linkBtnCls } from "../components/FormUI";

const OBC_SERVICE = "On-Board Courier (OBC)";

const STEPS = [
  { n: "01", title: "Request & route assessment", desc: "Tell us what must move, from where, to where, and by when. We assess routing, airline options and customs considerations within hours." },
  { n: "02", title: "Courier partner matched", desc: "A vetted on-board courier partner is assigned and the itinerary is locked. You receive courier details and the full cost breakdown." },
  { n: "03", title: "Flight cost paid upfront", desc: "The requester pays the flight cost at booking confirmation. This secures the seat, the schedule and the courier's commitment." },
  { n: "04", title: "Hand-carry transit", desc: "Your shipment travels as accompanied baggage — never leaving the courier's custody, with updates at every milestone." },
  { n: "05", title: "Delivery & proof", desc: "The courier hand-delivers to the recipient and captures signed and photographic proof of delivery (POD)." },
  { n: "06", title: "Balance settled after POD", desc: "Only after proof of delivery is confirmed do we invoice the remaining service costs. No POD, no balance payment." },
];

const TRUST = [
  { icon: ShieldCheck, title: "Vetted courier partners", desc: "Every OBC partner is identity-verified, briefed and tracked throughout the mission." },
  { icon: Globe, title: "Global coverage", desc: "Missions across Europe, the Middle East, Africa, Asia and the Americas — coordinated from our Finnish HQ." },
  { icon: Clock, title: "Time-critical by design", desc: "Next-flight-out capability for documents, prototypes, components and sensitive cargo." },
  { icon: FileCheck, title: "Documented custody", desc: "Chain-of-custody records, milestone updates and signed proof of delivery on every mission." },
];

export default function Obc() {
  const { t } = useI18n();
  useEffect(() => {
    document.title = `${t("obc.title")} — Yobsman-Tech`;
  }, [t]);

  const stepsT = t("obc.steps");
  const trustT = t("obc.trust");
  const stepTitle = (i, fb) => (Array.isArray(stepsT) && stepsT[i]) || fb;
  const trustTitle = (i, fb) => (Array.isArray(trustT) && trustT[i]) || fb;

  return (
    <div data-testid="obc-page">
      <PageHero eyebrow="Partner Service — Time-Critical Logistics"
        title={t("obc.title")}
        desc={t("obc.intro")} />

      {/* PAYMENT MODEL */}
      <section data-testid="obc-payment-model" className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="Payment model" title={t("obc.paymentTitle")}
            desc={t("obc.paymentDesc")} />
          <div className="grid md:grid-cols-2 gap-5">
            <Reveal>
              <div className="rounded-2xl bg-zinc-950 text-white p-8 sm:p-10 h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-sm text-zinc-500">Milestone 01</span>
                  <CreditCard size={22} className="text-zinc-400" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold">{t("obc.m1t")}</h3>
                <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">{t("obc.m1d")}</p>
                <p className="mono-label mt-8 !text-zinc-500">{t("obc.m1due")}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-black/10 bg-white p-8 sm:p-10 h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-sm text-zinc-500">Milestone 02</span>
                  <PackageCheck size={22} className="text-zinc-500" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950">{t("obc.m2t")}</h3>
                <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">{t("obc.m2d")}</p>
                <p className="mono-label mt-8">{t("obc.m2due")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#F4F4F5] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow="How it works" title={t("obc.howTitle")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="rounded-2xl bg-white border border-black/10 p-8 h-full hover:border-black/30 transition-colors duration-300">
                  <span className="font-mono text-sm text-zinc-400">{s.n}</span>
                  <h3 className="font-display text-lg font-semibold text-zinc-950 mt-3">{stepTitle(i, s.title)}</h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="Why Yobsman-Tech OBC" title={t("obc.whyTitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-black/10 bg-white p-7 h-full">
                  <item.icon size={20} className="text-zinc-500" />
                  <h3 className="font-display text-base font-semibold text-zinc-950 mt-4">{trustTitle(i, item.title)}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 sm:p-10">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold text-zinc-950 flex items-center gap-3"><Plane size={22} /> {t("obc.ctaTitle")}</h3>
              <p className="text-sm text-zinc-600 mt-2">{t("obc.ctaDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={`/quote?service=${encodeURIComponent(OBC_SERVICE)}`} data-testid="obc-quote-cta" className={linkBtnCls.solid}>{t("common.requestQuote")} <ArrowRight size={16} /></Link>
              <Link to={`/book?service=${encodeURIComponent(OBC_SERVICE)}`} data-testid="obc-book-cta" className={linkBtnCls.ghost}>{t("common.bookAppointment")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
