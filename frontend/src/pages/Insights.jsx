import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { useI18n } from "../i18n";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/FormUI";

export default function Insights() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (slug) {
      api.get(`/content/posts/${slug}`).then((r) => {
        setPost(r.data);
        document.title = `${r.data.title} — Yobsman-Tech Insights`;
      }).catch(() => setPost(false));
    } else {
      document.title = "Insights — Yobsman-Tech";
      api.get("/content/posts").then((r) => setPosts(r.data)).catch(() => {});
    }
  }, [slug]);

  if (slug) {
    if (post === null) return <div className="pt-40 pb-24 text-center text-zinc-500">{t("common.loading")}</div>;
    if (post === false) return <div className="pt-40 pb-24 text-center text-zinc-400">Article not found.</div>;
    return (
      <article data-testid="insight-article" className="pt-36 sm:pt-44 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors duration-200 mb-8">
            <ArrowLeft size={15} /> {t("sections.insightsTitle")}
          </Link>
          <p className="mono-label mb-4">{post.category} · {post.published_at} · {post.author}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.08]">{post.title}</h1>
          <img src={post.image} alt={post.title} loading="lazy" className="w-full aspect-[2/1] object-cover rounded-2xl border border-white/10 mt-10 grayscale" />
          <div className="mt-10 space-y-6">
            {post.content.split("\n\n").map((p, i) => (
              <p key={i} className="text-base text-zinc-300 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div data-testid="insights-page">
      <PageHero eyebrow={t("sections.insightsEyebrow")} title={t("sections.insightsTitle")}
        desc="Technology, AI, cybersecurity, software, data and company news from the Yobsman-Tech team." />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link to={`/insights/${p.slug}`} data-testid={`post-card-${p.slug}`}
                className="group block rounded-2xl border border-white/10 bg-[#0D0D10] overflow-hidden hover:border-white/30 hover:-translate-y-1 transition-[border-color,transform] duration-500">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-700" />
                </div>
                <div className="p-6">
                  <p className="mono-label mb-3">{p.category} · {p.published_at}</p>
                  <h2 className="font-display text-lg font-semibold text-zinc-100 leading-snug">{p.title}</h2>
                  <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-white transition-colors duration-300">
                    {t("common.readMore")} <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
