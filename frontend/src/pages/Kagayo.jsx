import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Scale, ShieldCheck, Lock, FileText, Globe, ArrowRight, Play, Apple } from "lucide-react";
import { useI18n } from "../i18n";
import { KAGAYO_FEATURES } from "../lib/content";
import { Reveal, SectionHead } from "../components/Reveal";
import { linkBtnCls } from "../components/FormUI";
import Marquee from "../components/Marquee";
import NetworkCanvas from "../components/NetworkCanvas";

export default function Kagayo() {
  const { t } = useI18n();
  useEffect(() => { document.title = "KAGAYO — The Law Meet | Yobsman-Tech"; }, []);

  return (
    <div data-testid="kagayo-page">
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" aria-hidden="true" />
        <div className="absolute inset-0 spotlight" aria-hidden="true" />
        <NetworkCanvas density={35} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-36 pb-20 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <p className="mono-label mb-6">A Yobsman-Tech subsidiary</p>
              <img src="/assets/kagayo-logo.png" alt="KAGAYO — The Law Meet" className="w-56 sm:w-72 mb-8" data-testid="kagayo-logo" />
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.05]">
                Legal access, <span className="text-stroke">re-engineered.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                KAGAYO — The Law Meet — is a mobile and web legal application built within the Yobsman-Tech ecosystem.
                It connects people and businesses with the legal world through one secure, elegant platform.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="https://www.kagayo.app" target="_blank" rel="noopener noreferrer" data-testid="kagayo-access-cta" className={linkBtnCls.solid}>
                  Access KAGAYO <ArrowRight size={16} />
                </a>
                <Link to="/contact" className={linkBtnCls.ghost}>{t("common.contactUs")}</Link>
              </div>
              <div className="mt-8">
                <p className="mono-label mb-4">Get the app</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://www.kagayo.app" target="_blank" rel="noopener noreferrer" data-testid="kagayo-playstore-btn"
                    className="flex items-center gap-3 rounded-xl bg-zinc-950 text-white px-5 py-3 hover:bg-zinc-800 transition-colors duration-300">
                    <Play size={20} fill="currentColor" />
                    <span className="text-start leading-tight">
                      <span className="block text-[10px] uppercase tracking-widest text-zinc-400">Get it on</span>
                      <span className="block text-sm font-semibold">Google Play</span>
                    </span>
                  </a>
                  <a href="https://www.kagayo.app" target="_blank" rel="noopener noreferrer" data-testid="kagayo-appstore-btn"
                    className="flex items-center gap-3 rounded-xl bg-zinc-950 text-white px-5 py-3 hover:bg-zinc-800 transition-colors duration-300">
                    <Apple size={20} fill="currentColor" />
                    <span className="text-start leading-tight">
                      <span className="block text-[10px] uppercase tracking-widest text-zinc-400">Download on the</span>
                      <span className="block text-sm font-semibold">App Store</span>
                    </span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="relative flex justify-center items-center gap-6">
              <div className="absolute -inset-10 bg-black/[0.05] blur-3xl rounded-full" aria-hidden="true" />
              <div className="relative hidden md:block w-[420px] rounded-2xl border border-black/15 bg-[#F4F4F5] p-2.5 shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="rounded-xl bg-black border border-black/5 overflow-hidden">
                  <div className="h-8 flex items-center gap-1.5 px-4 border-b border-black/5">
                    <span className="w-2 h-2 rounded-full bg-black/15" /><span className="w-2 h-2 rounded-full bg-black/15" /><span className="w-2 h-2 rounded-full bg-black/15" />
                  </div>
                  <div className="p-8 flex flex-col items-center gap-5 min-h-[240px] justify-center">
                    <img src="/assets/kagayo-logo-light.png" alt="" className="w-32 opacity-90" />
                    <div className="w-full space-y-2">{[90, 70, 80].map((w) => <div key={w} className="h-2 rounded-full bg-black/10" style={{ width: `${w}%` }} />)}</div>
                  </div>
                </div>
              </div>
              <div className="relative w-52 sm:w-56 rounded-[2.2rem] border border-black/15 bg-[#F4F4F5] p-2.5 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 float-slow">
                <div className="rounded-[1.8rem] bg-black border border-black/5 aspect-[9/19] flex flex-col items-center justify-center gap-5 p-5 overflow-hidden">
                  <img src="/assets/kagayo-logo-light.png" alt="" className="w-24 opacity-95" />
                  <div className="w-full space-y-2">{[85, 60, 72].map((w) => <div key={w} className="h-1.5 rounded-full bg-black/10" style={{ width: `${w}%` }} />)}</div>
                  <div className="w-full rounded-full bg-white text-black text-center text-[9px] font-bold py-2 tracking-widest uppercase flex items-center justify-center gap-1">
                    <Scale size={10} /> The Law Meet
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee items={["The Law Meet", "Mobile & Web", "Privacy by Architecture", "Yobsman-Tech Ecosystem", "GDPR by Design"]} />

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="The problem" title="Legal help is too hard to reach"
            desc="For most people and small businesses, the legal world is expensive, slow and intimidating. KAGAYO removes the friction — bringing legal access into a single secure application." />
          <div className="grid md:grid-cols-2 gap-5">
            {KAGAYO_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 h-full hover:border-black/30 transition-colors duration-500">
                  <h3 className="font-display text-xl font-semibold text-zinc-950">{f.title}</h3>
                  <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F4F4F5] text-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow="Security & privacy" title="Trust is the product" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              [Lock, "Encrypted documents", "Legal materials protected with modern encryption at rest and in transit."],
              [ShieldCheck, "GDPR-grade privacy", "European privacy engineering standards applied from the first commit."],
              [FileText, "Structured workflows", "Matters, documents and communication organized in one secure space."],
              [Globe, "Jurisdiction aware", "Designed for cross-border legal contexts from day one."],
            ].map(([Icon, title, desc], i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="rounded-2xl bg-white border border-black/10 p-7 h-full">
                  <Icon size={20} className="text-zinc-500" />
                  <h3 className="font-display text-base font-semibold mt-4">{title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16 rounded-2xl bg-zinc-950 text-white p-10 sm:p-14">
            <p className="mono-label mb-4">Technology</p>
            <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-3xl">
              KAGAYO is engineered on the same secure, scalable stack that powers Yobsman-Tech client platforms — cloud-native,
              API-first and designed for integration with legal-data providers as the platform grows.
            </p>
            <a href="https://www.kagayo.app" target="_blank" rel="noopener noreferrer" data-testid="kagayo-learnmore-cta" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-zinc-950 text-sm font-semibold px-7 py-3.5 hover:bg-zinc-200 transition-colors duration-300 mt-8">Open KAGAYO app <ArrowRight size={15} /></a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
