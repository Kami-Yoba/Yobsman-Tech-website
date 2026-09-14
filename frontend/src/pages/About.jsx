import { Reveal, SectionHead } from "../components/Reveal";
import { PageHero } from "../components/FormUI";
import { HUBS, WHY } from "../lib/content";

const TIMELINE = [
  { year: "2019", title: "Founded in Espoo", desc: "Yobsman-Tech begins as a Finnish IT support and maintenance practice with a global ambition." },
  { year: "2021", title: "Software & data practices", desc: "Custom software development and data analysis divisions launch, serving clients across the Nordics." },
  { year: "2023", title: "International expansion", desc: "Delivery operations extend into Europe, the Middle East and Africa with remote-first consultation." },
  { year: "2025", title: "KAGAYO is born", desc: "The legal-technology subsidiary KAGAYO — The Law Meet — launches as a mobile and web platform." },
  { year: "2026", title: "Global platform", desc: "A multilingual digital platform in 18 languages, AI integration practice and global service mesh." },
];

const VALUES = [
  { title: "Precision", desc: "We sweat details others ignore. Finnish engineering is our foundation." },
  { title: "Trust", desc: "Security, privacy and honest communication in every engagement." },
  { title: "Borderless", desc: "Talent, clients and ideas without geography. The world is our office." },
  { title: "Forward", desc: "We build for what comes next — AI, automation and platforms that scale." },
];

export default function About() {
  return (
    <div data-testid="about-page">
      <PageHero eyebrow="About Yobsman-Tech"
        title="An AFRO - Finnish technology company with a global operating vision"
        desc="Yobsman-Tech is a global information technology company established in Finland — engineering software, AI, data and IT operations for organizations across multiple countries." />

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-2 gap-16">
          <Reveal>
            <p className="mono-label mb-4">Who we are</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight">Engineers, analysts and consultants united by one standard</h2>
            <p className="mt-6 text-zinc-600 leading-relaxed">
              We are a technology partner for organizations that take their digital operations seriously. From service desk
              and computer maintenance to custom software, AI integration and quality assurance, our teams deliver
              dependable technology across borders, languages and time zones.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mono-label mb-4">Our story</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight">Born in Finland. Built for the world.</h2>
            <p className="mt-6 text-zinc-600 leading-relaxed">
              Founded in Espoo — Finland's technology heartland — Yobsman-Tech grew from a local IT practice into an
              international operation. Our subsidiary KAGAYO extends that mission into legal technology, making the law
              accessible through a mobile and web platform.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-[#F4F4F5] text-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-light" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead light eyebrow="Mission · Vision · Values" title="What drives every line of code" />
          <div className="grid md:grid-cols-2 gap-5 mb-14">
            <Reveal><div className="rounded-2xl bg-white border border-black/10 p-8 h-full">
              <p className="mono-label !text-zinc-600 mb-3">Our mission</p>
              <p className="text-lg text-zinc-500 leading-relaxed">To engineer dependable, future-focused technology that helps organizations operate, grow and transform — anywhere in the world.</p>
            </div></Reveal>
            <Reveal delay={0.08}><div className="rounded-2xl bg-zinc-950 text-white p-8 h-full">
              <p className="mono-label mb-3">Our vision</p>
              <p className="text-lg text-zinc-300 leading-relaxed">A world where world-class technology expertise is never limited by geography, language or scale.</p>
            </div></Reveal>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="rounded-2xl bg-white border border-black/10 p-7 h-full hover:border-black/30 transition-colors duration-300">
                  <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="Timeline" title="From Espoo to everywhere" />
          <div className="relative border-s border-black/10 ms-2 space-y-12">
            {TIMELINE.map((e, i) => (
              <Reveal key={e.year} delay={i * 0.05}>
                <div className="relative ps-10">
                  <span className="absolute -start-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white" />
                  <span className="font-mono text-sm text-zinc-500">{e.year}</span>
                  <h3 className="font-display text-xl font-semibold text-zinc-900 mt-1">{e.title}</h3>
                  <p className="text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">{e.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="Global presence" title="Operating hubs" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HUBS.map((h, i) => (
              <Reveal key={h.city} delay={i * 0.05}>
                <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-7 h-full">
                  <span className="mono-label">{h.coords}</span>
                  <h3 className="font-display text-xl font-semibold text-zinc-900 mt-3">{h.city}</h3>
                  <p className="text-sm text-zinc-500">{h.country} — {h.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHead eyebrow="Our technology approach" title="Why organizations choose Yobsman-Tech" />
          <div className="space-y-0">
            {WHY.map((w, i) => (
              <Reveal key={w.n} delay={i * 0.05}>
                <div className="grid md:grid-cols-12 gap-4 items-baseline py-8 border-t border-black/10">
                  <span className="md:col-span-2 font-mono text-sm text-zinc-600">{w.n}</span>
                  <h3 className="md:col-span-4 font-display text-2xl font-semibold text-zinc-900">{w.title}</h3>
                  <p className="md:col-span-6 text-sm text-zinc-600 leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
