import { useEffect, useState } from "react";
import { CheckCircle, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { PageHero, Field, inputCls, CTAButton } from "../components/FormUI";

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", company: "", country: "", subject: "", service: "", message: "", contact_method: "email", consent: false, website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => { document.title = "Contact — Yobsman-Tech"; }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/contact", form);
      setDone(data.message);
      toast.success(data.message);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <PageHero eyebrow="Contact" title={t("contact.title")} desc={t("contact.desc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            {done ? (
              <div data-testid="contact-success" className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-12 text-center">
                <CheckCircle size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-700 leading-relaxed">{done}</p>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form" className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 sm:p-10 space-y-5">
                <input type="text" name="website" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t("form.fullName")} htmlFor="c-name"><input id="c-name" data-testid="contact-name-input" required className={inputCls} value={form.full_name} onChange={set("full_name")} /></Field>
                  <Field label={t("form.email")} htmlFor="c-email"><input id="c-email" data-testid="contact-email-input" type="email" required className={inputCls} value={form.email} onChange={set("email")} /></Field>
                  <Field label={t("form.phone")} htmlFor="c-phone"><input id="c-phone" data-testid="contact-phone-input" className={inputCls} value={form.phone} onChange={set("phone")} /></Field>
                  <Field label={t("form.company")} htmlFor="c-company"><input id="c-company" data-testid="contact-company-input" className={inputCls} value={form.company} onChange={set("company")} /></Field>
                  <Field label={t("form.country")} htmlFor="c-country"><input id="c-country" data-testid="contact-country-input" className={inputCls} value={form.country} onChange={set("country")} /></Field>
                  <Field label={t("form.subject")} htmlFor="c-subject"><input id="c-subject" data-testid="contact-subject-input" required className={inputCls} value={form.subject} onChange={set("subject")} /></Field>
                  <Field label={t("form.serviceInterest")} htmlFor="c-service">
                    <select id="c-service" data-testid="contact-service-select" className={inputCls} value={form.service} onChange={set("service")}>
                      <option value="">—</option>
                      {["IT Support / Service Desk", "Data Analysis", "Software Development", "Computer Maintenance", "AI Integration", "Mobile Application Development", "Quality Assurance & Testing", "Remote IT Consultation", "On-Board Courier (OBC)", "KAGAYO"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label={t("form.contactMethod")} htmlFor="c-method">
                    <select id="c-method" data-testid="contact-method-select" className={inputCls} value={form.contact_method} onChange={set("contact_method")}>
                      <option value="email">{t("form.emailMethod")}</option>
                      <option value="phone">{t("form.phoneMethod")}</option>
                    </select>
                  </Field>
                </div>
                <Field label={t("form.message")} htmlFor="c-message"><textarea id="c-message" data-testid="contact-message-input" required rows={5} className={inputCls} value={form.message} onChange={set("message")} /></Field>
                <label className="flex items-start gap-3 text-xs text-zinc-600 cursor-pointer">
                  <input data-testid="contact-consent-checkbox" type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-0.5 accent-zinc-950" />
                  {t("form.consent")}
                </label>
                <CTAButton data-testid="contact-submit-btn" type="submit" disabled={busy}>{busy ? t("common.submitting") : t("form.sendMessage")}</CTAButton>
              </form>
            )}
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 space-y-6">
              <div>
                <p className="mono-label mb-2">{t("contact.emailLabel")}</p>
                <a data-testid="contact-email-link" href="mailto:info@yobsman-tech.com" className="text-zinc-900 hover:text-zinc-950 text-sm underline underline-offset-4 decoration-black/30">info@yobsman-tech.com</a>
                <br />
                <a href="mailto:quote@yobsman-tech.com" className="text-zinc-600 hover:text-zinc-950 text-sm underline underline-offset-4 decoration-black/30 mt-1 inline-block">quote@yobsman-tech.com</a>
              </div>
              <div>
                <p className="mono-label mb-2">{t("contact.phoneLabel")}</p>
                <p className="text-sm text-zinc-700">{t("contact.phoneValue")}</p>
              </div>
              <div>
                <p className="mono-label mb-2">{t("contact.hq")}</p>
                <p data-testid="contact-hq" className="text-sm text-zinc-700">{t("contact.hqValue")}</p>
              </div>
              <div>
                <p className="mono-label mb-2">{t("contact.regions")}</p>
                <p className="text-sm text-zinc-700">{t("contact.regionsValue")}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8">
              <p className="mono-label mb-4">{t("contact.follow")}</p>
              <div className="flex gap-3">
                {[["LinkedIn", Linkedin, "#"], ["X", Twitter, "#"], ["Facebook", Facebook, "https://www.facebook.com/profile.php?id=61569349950144"], ["Instagram", Instagram, "#"]].map(([name, Icon, url]) => (
                  <a key={name} href={url} {...(url !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})} aria-label={name} className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-500 hover:text-zinc-950 hover:border-black/40 transition-[color,border-color] duration-300">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 relative overflow-hidden min-h-[180px]">
              <div className="absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
              <div className="relative">
                <span className="w-2 h-2 rounded-full bg-zinc-950 pulse-dot inline-block" />
                <p className="font-mono text-xs tracking-widest uppercase text-zinc-600 mt-3">60.1699° N, 24.9384° E</p>
                <p className="font-display text-lg font-semibold text-zinc-900 mt-1">Espoo / Helsinki, Finland</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
