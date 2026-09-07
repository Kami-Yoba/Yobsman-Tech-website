import { useEffect } from "react";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/FormUI";
import { LEGAL } from "../lib/legal";

export default function Legal({ page }) {
  const doc = LEGAL[page] || LEGAL.privacy;

  useEffect(() => {
    document.title = `${doc.title} — Yobsman-Tech`;
  }, [doc.title]);

  return (
    <div data-testid={`legal-${page}`}>
      <PageHero eyebrow="Legal" title={doc.title} desc={doc.intro} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <p className="mono-label mb-10">{doc.updated}</p>
          <div className="space-y-0">
            {doc.sections.map((s, i) => (
              <Reveal key={s.h} delay={i * 0.03}>
                <div className="py-8 border-t border-black/10">
                  <h2 className="font-display text-xl font-semibold text-zinc-950">{s.h}</h2>
                  <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">{s.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 rounded-2xl border border-black/10 bg-black/[0.03] p-8">
            <p className="text-sm text-zinc-600 leading-relaxed">
              Questions about this document? Contact us at{" "}
              <a href="mailto:info@yobsman-tech.com" className="text-zinc-950 underline underline-offset-4 decoration-black/30">info@yobsman-tech.com</a>.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
