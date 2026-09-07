import { useEffect, useState } from "react";
import { Linkedin, Plus, Minus } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/FormUI";

function LeaderCard({ m, i }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={i * 0.06}>
      <article data-testid={`leadership-card-${i}`} className="group rounded-2xl border border-black/10 bg-[#FFFFFF] overflow-hidden hover:border-black/30 transition-[border-color] duration-500">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={m.photo} alt={`${m.name}, ${m.position}`} loading="lazy" data-photo
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-700" />
        </div>
        <div className="p-6">
          <h2 className="font-display text-lg font-semibold text-zinc-950">{m.name}</h2>
          <p className="text-xs text-zinc-500 mt-1">{m.position}</p>
          <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-600 mt-3">{m.expertise}</p>
          <button data-testid={`leader-bio-toggle-${i}`} onClick={() => setOpen(!open)} aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 transition-colors duration-200">
            {open ? <Minus size={13} /> : <Plus size={13} />} {open ? "Close biography" : "Read biography"}
          </button>
          {open && <p className="mt-4 text-sm text-zinc-600 leading-relaxed border-t border-black/10 pt-4">{m.bio}</p>}
          {m.linkedin && (
            <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 transition-colors duration-200">
              <Linkedin size={13} /> LinkedIn
            </a>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export default function Leadership() {
  const { t } = useI18n();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    document.title = "Leadership — Yobsman-Tech";
    api.get("/content/leadership").then((r) => setLeaders(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="leadership-page">
      <PageHero eyebrow={t("sections.leadEyebrow")} title={t("sections.leadTitle")} desc={t("sections.leadDesc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {leaders.map((m, i) => <LeaderCard key={m.id} m={m} i={i} />)}
        </div>
      </section>
    </div>
  );
}
