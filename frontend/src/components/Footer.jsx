import { Link } from "react-router-dom";
import { Linkedin, Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import { useI18n } from "../i18n";

export default function Footer() {
  const { t } = useI18n();
  const cols = [
    { title: t("footer.company"), links: [
      [t("footer.about"), "/about"], [t("footer.leadership"), "/leadership"],
      [t("footer.careers"), "/careers"], [t("footer.partners"), "/partners"]] },
    { title: t("footer.services"), links: [
      ["IT Support", "/services"], ["Data Analysis", "/services"],
      ["Software Development", "/services"], ["AI Integration", "/services"],
      ["Mobile Development", "/services"], ["QA & Testing", "/services"],
      ["IT Consultation", "/services"], ["On-Board Courier (OBC)", "/obc"],
      ["Documentation Assistance", "/documentation-assistance"]] },
    { title: t("footer.products"), links: [
      ["KAGAYO — The Law Meet", "/kagayo"], ["Insights", "/insights"]] },
    { title: t("footer.support"), links: [
      [t("nav.contact"), "/contact"], [t("nav.quote"), "/quote"], [t("nav.book"), "/book"]] },
    { title: t("footer.legal"), links: [
      [t("footer.privacy"), "/privacy"], [t("footer.terms"), "/terms"],
      [t("footer.cookiePolicy"), "/cookies"], [t("footer.accessibility"), "/accessibility"]] },
  ];
  const socials = [
    ["LinkedIn", Linkedin, "social-linkedin", "#"], ["X", Twitter, "social-x", "#"],
    ["Facebook", Facebook, "social-facebook", "https://www.facebook.com/profile.php?id=61569349950144"],
    ["Instagram", Instagram, "social-instagram", "#"],
    ["YouTube", Youtube, "social-youtube", "#"],
  ];

  return (
    <footer data-testid="footer" className="border-t border-black/10 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img src="/assets/yobsman-logo.png" alt="Yobsman-Tech" className="h-14 w-auto mb-5" />
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">{t("footer.tagline")}</p>
            <div className="flex gap-3 mt-6">
              {socials.map(([name, Icon, id, url]) => (
                <a key={name} href={url} data-testid={id} aria-label={name} {...(url !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:border-black/40 transition-[color,border-color] duration-300">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mono-label mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(([label, to], i) => (
                  <li key={`${label}-${i}`}>
                    <Link to={to} className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p data-testid="footer-rights" className="text-xs text-zinc-600">{t("footer.rights")}</p>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500">Espoo · Helsinki · Global</p>
        </div>
      </div>
    </footer>
  );
}
