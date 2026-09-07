import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, Scale } from "lucide-react";
import { useI18n } from "../i18n";
import { api } from "../lib/api";
import { HUBS, WHY, SOLUTIONS, INDUSTRIES, MARQUEE_ITEMS, iconFor } from "../lib/content";
import { MaskedLines, Reveal, SectionHead } from "../components/Reveal";
import NetworkCanvas from "../components/NetworkCanvas";
import Marquee from "../components/Marquee";
import Stats from "../components/Stats";
import { linkBtnCls } from "../components/FormUI";

function TiltCard() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 });
  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className="relative glass rounded-2xl p-8 sm:p-10 shadow-2xl"
      data-testid="hero-glass-card"
    >
      <div className="float-slow" style={{ transform: "translateZ(40px)" }}>
        <p className="mono-label mb-6">Yobsman-Tech // Operations</p>
        <div className="space-y-4 font-mono text-xs sm:text-sm text-zinc-600">
          {[
            ["HQ", "Espoo / Helsinki, Finland"],
            ["Coverage", "Europe · MEA · APAC · Americas"],
            ["Delivery", "On-site · Hybrid · Remote"],
            ["Languages", "18 supported"],
            ["Subsidiary", "KAGAYO — The Law Meet"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-black/5 pb-3">
              <span className="text-zinc-600 uppercase tracking-widest">{k}</span>
              <span className="text-zinc-800 text-end">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
          <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">Live — Global service mesh</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const [services, setServices] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/content/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/content/leadership").then((r) => setLeaders(r.data.slice(0, 4))).catch(() => {});
    api.get("/content/partners").then((r) => setPartners(r.data)).catch(() => {});
    api.get("/content/jobs").then((r) => setJobs(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <div className="absolute inset-0 spotlight" aria-hidden="true" />
        <NetworkCanvas density={50} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-4 py-1.5 mb-8">
                <MapPin size={12} className="text-zinc-600" />
                <span data-testid="hero-badge" className="font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-700">{t("hero.badge")}</span>
              </motion.div>
              <h1 className="font-display font-extrabold tracking-tighter leading-[0.98] text-5xl sm:text-7xl lg:text-8xl text-zinc-950">
                <MaskedLines lines={[t("hero.l1"), t("hero.l2")]} />
                <span className="block overflow-hidden">
                  <motion.span initial={{ y: "110%" }} animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.43, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-stroke">
                    {t("hero.l3")}
                  </motion.span>
                </span>
              </h1>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }}
                data-testid="hero-subheadline" className="mt-8 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                {t("hero.sub")}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7 }}
                className="mt-10 flex flex-wrap gap-4">
                <Link to="/quote" data-testid="hero-quote-cta" className={linkBtnCls.solid}>{t("hero.ctaQuote")} <ArrowRight size={16} /></Link>
                <Link to="/book" data-testid="hero-book-cta" className={linkBtnCls.ghost}>{t("hero.ctaBook")}</Link>
                <Link to="/services" data-testid="hero-services-cta" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 px-2 py-3 transition-colors duration-300">
                  {t("hero.ctaServices")} <ArrowUpRight size={15} />
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="mt-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-950 pulse-dot" />
                <span data-testid="hero-status" className="font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-500">{t("hero.status")}</span>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
              className="lg:col-span-5 hidden lg:block" style={{ perspective: 1000 }}>
              <TiltCard />
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee items={MARQUEE_ITEMS} />

      {/* GLOBAL PRESENCE — light contrast section */}
      <section data-testid="global-presence-section" className="bg-[#F4F4F5] text-zinc-900 py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow={t("sections.globalEyebrow")} title={t("sections.globalTitle")} desc={t("sections.globalDesc")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {HUBS.map((h, i) => (
              <Reveal key={h.city} delay={i * 0.06}>
                <div className="bg-white p-8 h-full group hover:bg-zinc-950 transition-colors duration-500">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full bg-zinc-900 group-hover:bg-white pulse-dot transition-colors duration-500" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-600 group-hover:text-zinc-500 transition-colors duration-500">{h.coords}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-zinc-900 group-hover:text-white transition-colors duration-500">{h.city}</h3>
                  <p className="text-sm text-zinc-500 group-hover:text-zinc-400 mt-1 transition-colors duration-500">{h.country}</p>
                  <p className="mono-label mt-5 !text-zinc-500 group-hover:!text-zinc-400 transition-colors duration-500">{h.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section data-testid="services-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("sections.servicesEyebrow")} title={t("sections.servicesTitle")} desc={t("sections.servicesDesc")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => {
              const Icon = iconFor(s.icon);
              return (
                <Reveal key={s.id} delay={i * 0.05}>
                  <Link to="/services" data-testid={`service-card-${s.code}`}
                    className="group block h-full rounded-2xl border border-black/10 bg-[#FFFFFF] p-7 hover:border-black/30 hover:bg-[#E9E9EC] hover:-translate-y-1 transition-[border-color,background-color,transform] duration-500">
                    <span className="mono-label">{s.code}</span>
                    <div className="mt-6 w-11 h-11 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center group-hover:border-black/30 transition-colors duration-500">
                      <Icon size={19} className="text-zinc-700" />
                    </div>
                    <h3 className="mt-6 font-display text-lg font-semibold text-zinc-900 leading-snug">{s.title}</h3>
                    <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-950 transition-colors duration-300">
                      {t("common.learnMore")} <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-black/10 bg-black/[0.03] p-8 sm:p-10">
            <div className="flex-1">
              <h3 className="font-display text-2xl font-semibold text-zinc-950">{t("common.needSolution")}</h3>
              <p className="text-sm text-zinc-500 mt-2">{t("sections.ctaDesc")}</p>
            </div>
            <Link to="/contact" data-testid="services-talk-cta" className={linkBtnCls.solid}>{t("common.talkExpert")} <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* WHY — numbered manifesto */}
      <section className="py-24 sm:py-32 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("sections.whyEyebrow")} title={t("sections.whyTitle")} desc={t("sections.whyDesc")} />
          <div className="space-y-0">
            {WHY.map((w, i) => (
              <Reveal key={w.n} delay={i * 0.05}>
                <div className="group grid md:grid-cols-12 gap-4 md:gap-8 items-baseline py-10 border-t border-black/10 hover:bg-white/[0.02] transition-colors duration-500 px-2 sm:px-6 -mx-2 sm:-mx-6 rounded-lg">
                  <span className="md:col-span-2 font-mono text-sm text-zinc-600 group-hover:text-zinc-700 transition-colors duration-500">{w.n}</span>
                  <h3 className="md:col-span-4 font-display text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">{w.title}</h3>
                  <p className="md:col-span-6 text-sm sm:text-base text-zinc-600 leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* KAGAYO SHOWCASE */}
      <section data-testid="kagayo-showcase" className="py-24 sm:py-32 border-t border-black/5 relative overflow-hidden">
        <div className="absolute inset-0 spotlight" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <p className="mono-label mb-4">{t("sections.kagayoEyebrow")}</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950">{t("sections.kagayoTitle")}</h2>
              <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed">{t("sections.kagayoDesc")}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/kagayo" data-testid="kagayo-discover-cta" className={linkBtnCls.solid}>{t("common.discoverKagayo")} <ArrowRight size={16} /></Link>
                <Link to="/contact" className={linkBtnCls.ghost}>{t("common.contactUs")}</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="relative flex justify-center">
              <div className="absolute -inset-10 bg-black/[0.05] blur-3xl rounded-full" aria-hidden="true" />
              <div className="relative w-64 sm:w-72 rounded-[2.5rem] border border-black/15 bg-[#F4F4F5] p-3 shadow-2xl float-slow">
                <div className="rounded-[2rem] bg-black overflow-hidden border border-black/5 aspect-[9/19] flex flex-col">
                  <div className="h-6 flex items-center justify-center"><div className="w-16 h-1.5 rounded-full bg-black/10" /></div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                    <img src="/assets/kagayo-logo-light.png" alt="KAGAYO — The Law Meet" className="w-28 opacity-95" />
                    <div className="w-full space-y-2.5">
                      {[85, 65, 75].map((w) => (
                        <div key={w} className="h-2 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                    <div className="w-full rounded-full bg-white text-black text-center text-[10px] font-bold py-2.5 tracking-widest uppercase flex items-center justify-center gap-1.5">
                      <Scale size={11} /> The Law Meet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 sm:py-28 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Stats items={[
            { value: 18, suffix: "+", label: t("stats.countries") },
            { value: 120, suffix: "+", label: t("stats.clients") },
            { value: 340, suffix: "+", label: t("stats.projects") },
            { value: 99.9, suffix: "%", label: t("stats.uptime") },
          ]} />
        </div>
      </section>

      {/* SOLUTIONS + INDUSTRIES */}
      <section className="py-24 sm:py-32 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("sections.solutionsEyebrow")} title={t("sections.solutionsTitle")} desc={t("sections.solutionsDesc")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SOLUTIONS.slice(0, 4).map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <Link to="/solutions" className="group block h-full rounded-2xl border border-black/10 p-7 hover:border-black/30 hover:bg-black/[0.03] transition-[border-color,background-color] duration-500">
                  <h3 className="font-display text-lg font-semibold text-zinc-900">{s.title}</h3>
                  <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs text-zinc-600 group-hover:text-zinc-950 transition-colors duration-300">
                    {t("common.learnMore")} <ArrowUpRight size={13} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14">
            <p className="mono-label mb-5">{t("sections.industriesEyebrow")}</p>
            <div className="flex flex-wrap gap-2.5">
              {INDUSTRIES.map((ind) => (
                <span key={ind} className="rounded-full border border-black/10 px-4 py-2 text-xs text-zinc-600 hover:text-zinc-950 hover:border-black/40 transition-[color,border-color] duration-300 cursor-default">{ind}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* LEADERSHIP PREVIEW */}
      <section className="py-24 sm:py-32 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("sections.leadEyebrow")} title={t("sections.leadTitle")} desc={t("sections.leadDesc")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {leaders.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.06}>
                <Link to="/leadership" data-testid={`leader-card-${i}`} className="group block rounded-2xl border border-black/10 overflow-hidden bg-[#FFFFFF] hover:border-black/30 transition-[border-color] duration-500">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={m.photo} alt={m.name} loading="lazy" data-photo
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-700" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-semibold text-zinc-900">{m.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{m.position}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-20 sm:py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <p className="mono-label mb-3">{t("sections.partnersEyebrow")}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950">{t("sections.partnersTitle")}</h2>
            </div>
            <Link to="/partners" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-950 transition-colors duration-300">
              {t("common.viewAll")} <ArrowUpRight size={14} />
            </Link>
          </Reveal>
          <div data-testid="partners-strip" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {partners.map((p) => (
              <div key={p.id} className="bg-[#F4F4F5] px-6 py-10 flex items-center justify-center group hover:bg-[#E9E9EC] transition-colors duration-500">
                <span className="font-display text-sm font-semibold tracking-wide text-zinc-500 group-hover:text-zinc-900 text-center transition-colors duration-500">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREERS PREVIEW + CTA */}
      <section className="py-24 sm:py-32 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow={t("sections.careersEyebrow")} title={t("sections.careersTitle")} desc={t("sections.careersDesc")} />
          <div className="space-y-px rounded-2xl overflow-hidden border border-black/10 bg-black/10">
            {jobs.map((j) => (
              <Link key={j.id} to={`/careers/${j.id}`} data-testid={`career-preview-${j.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F4F4F5] px-6 sm:px-8 py-6 hover:bg-[#E9E9EC] transition-colors duration-300">
                <div>
                  <h3 className="font-display text-lg font-semibold text-zinc-900 group-hover:text-zinc-950">{j.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{j.department} · {j.location}, {j.country} · {j.work_mode}</p>
                </div>
                <ArrowUpRight size={18} className="text-zinc-600 group-hover:text-zinc-950 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </Link>
            ))}
          </div>
          <Reveal className="mt-24 text-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 max-w-3xl mx-auto">{t("sections.ctaTitle")}</h2>
            <p className="mt-6 text-zinc-600 max-w-xl mx-auto">{t("sections.ctaDesc")}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/quote" data-testid="cta-quote-btn" className={linkBtnCls.solid}>{t("common.requestQuote")} <ArrowRight size={16} /></Link>
              <Link to="/book" data-testid="cta-book-btn" className={linkBtnCls.ghost}>{t("common.bookAppointment")}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
