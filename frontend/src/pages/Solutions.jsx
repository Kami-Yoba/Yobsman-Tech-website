import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "../i18n";
import { SOLUTIONS, INDUSTRIES } from "../lib/content";
import { Reveal, SectionHead } from "../components/Reveal";
import { PageHero, linkBtnCls } from "../components/FormUI";

export default function Solutions() {
  const { t } = useI18n();
  useEffect(() => { document.title = "Solutions — Yobsman-Tech"; }, []);

  return (
    <div data-testid="solutions-page">
      <PageHero eyebrow={t("sections.solutionsEyebrow")} title={t("sections.solutionsTitle")} desc={t("sections.solutionsDesc")} />
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid md:grid-cols-2 gap-5">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}>
              <Link to={`/quote?service=${encodeURIComponent(s.title)}`} data-testid={`solution-card-${i}`}
                className="group block h-full rounded-2xl border border-white/10 bg-[#0D0D10] p-8 hover:border-white/30 hover:bg-[#141418] hover:-translate-y-1 transition-[border-color,background-color,transform] duration-500">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-zinc-50">{s.title}</h2>
                  <ArrowUpRight size={20} className="shrink-0 text-zinc-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-500">{tag}</span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="py-24 bg-[#F4F4F5] text-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow={t("sections.industriesEyebrow")} title={t("sections.industriesTitle")}
            desc="From regulated sectors to fast-moving startups — our delivery model adapts to your industry's reality." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {INDUSTRIES.map((ind, i) => (
              <Reveal key={ind} delay={i * 0.03}>
                <div className="bg-white px-6 py-8 text-center font-display text-sm font-semibold text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors duration-500">{ind}</div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <Link to="/quote" className={linkBtnCls.solid}>{t("common.requestQuote")}</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
