import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { PageHero, Field, inputCls, CTAButton, linkBtnCls } from "../components/FormUI";

const BUDGETS = ["< €5,000", "€5,000 – €15,000", "€15,000 – €50,000", "€50,000+", "To be discussed"];
const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "6+ months", "Flexible"];
const PROJECT_TYPES = ["New build", "Modernization", "Ongoing support", "Consultation", "Other"];

export default function Quote() {
  const { t, languages } = useI18n();
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    full_name: "", company: "", email: "", phone: "", country: "", contact_method: "email",
    service: params.get("service") || "", project_type: params.get("project_type") || "", budget: params.get("budget") || "", description: params.get("description") || "",
    timeline: params.get("timeline") || "", language: "en", consent: false, website: "",
    obc_origin: "", obc_destination: "", obc_weight: "", obc_deadline: "",
  });
  const isOBC = form.service === "On-Board Courier (OBC)";
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    document.title = "Request a Quote — Yobsman-Tech";
    api.get("/content/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let attachment = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await api.post("/upload", fd);
        attachment = up.data.file;
      }
      const { data } = await api.post("/quotes", { ...form, attachment });
      setDone(data);
      toast.success("Quote request received");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="quote-page">
      <PageHero eyebrow="Quotation" title={t("quote.title")} desc={t("quote.desc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {done ? (
            <div data-testid="quote-success" className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-12 sm:p-16 text-center">
              <CheckCircle size={44} className="mx-auto text-zinc-800 mb-5" />
              <h2 className="font-display text-2xl font-semibold text-zinc-950 mb-4">Request received</h2>
              <p className="text-zinc-600 leading-relaxed max-w-xl mx-auto">{done.message}</p>
              {done.tracking_url && (
                <div className="mt-8">
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">OBC mission created — save this link</p>
                  <a href={done.tracking_url} data-testid="quote-tracking-link" className={linkBtnCls.solid}>Track your shipment</a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={submit} data-testid="quote-form" className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 sm:p-10 space-y-5">
              <input type="text" name="website" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("form.fullName")} htmlFor="q-name"><input id="q-name" data-testid="quote-name-input" required className={inputCls} value={form.full_name} onChange={set("full_name")} /></Field>
                <Field label={t("form.company")} htmlFor="q-company"><input id="q-company" data-testid="quote-company-input" className={inputCls} value={form.company} onChange={set("company")} /></Field>
                <Field label={t("form.email")} htmlFor="q-email"><input id="q-email" data-testid="quote-email-input" type="email" required className={inputCls} value={form.email} onChange={set("email")} /></Field>
                <Field label={t("form.phone")} htmlFor="q-phone"><input id="q-phone" data-testid="quote-phone-input" className={inputCls} value={form.phone} onChange={set("phone")} /></Field>
                <Field label={t("form.country")} htmlFor="q-country"><input id="q-country" data-testid="quote-country-input" className={inputCls} value={form.country} onChange={set("country")} /></Field>
                <Field label={t("form.contactMethod")} htmlFor="q-method">
                  <select id="q-method" data-testid="quote-method-select" className={inputCls} value={form.contact_method} onChange={set("contact_method")}>
                    <option value="email">{t("form.emailMethod")}</option>
                    <option value="phone">{t("form.phoneMethod")}</option>
                  </select>
                </Field>
                <Field label={t("form.service")} htmlFor="q-service">
                  <select id="q-service" data-testid="quote-service-select" required className={inputCls} value={form.service} onChange={set("service")}>
                    <option value="">{t("form.selectService")}</option>
                    {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                    <option value="KAGAYO">KAGAYO</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label={t("form.projectType")} htmlFor="q-ptype">
                  <select id="q-ptype" data-testid="quote-project-type-select" className={inputCls} value={form.project_type} onChange={set("project_type")}>
                    <option value="">—</option>
                    {PROJECT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label={t("form.budget")} htmlFor="q-budget">
                  <select id="q-budget" data-testid="quote-budget-select" className={inputCls} value={form.budget} onChange={set("budget")}>
                    <option value="">—</option>
                    {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label={t("form.timeline")} htmlFor="q-timeline">
                  <select id="q-timeline" data-testid="quote-timeline-select" className={inputCls} value={form.timeline} onChange={set("timeline")}>
                    <option value="">—</option>
                    {TIMELINES.map((tl) => <option key={tl} value={tl}>{tl}</option>)}
                  </select>
                </Field>
                <Field label={t("form.language")} htmlFor="q-lang">
                  <select id="q-lang" data-testid="quote-language-select" className={inputCls} value={form.language} onChange={set("language")}>
                    {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
                  </select>
                </Field>
                {isOBC && (
                  <>
                    <Field label="Origin (city, country)" htmlFor="q-origin">
                      <input id="q-origin" data-testid="quote-obc-origin" required className={inputCls} value={form.obc_origin} onChange={set("obc_origin")} placeholder="e.g. Helsinki, Finland" />
                    </Field>
                    <Field label="Destination (city, country)" htmlFor="q-dest">
                      <input id="q-dest" data-testid="quote-obc-destination" required className={inputCls} value={form.obc_destination} onChange={set("obc_destination")} placeholder="e.g. Lagos, Nigeria" />
                    </Field>
                    <Field label="Shipment weight" htmlFor="q-weight">
                      <input id="q-weight" data-testid="quote-obc-weight" className={inputCls} value={form.obc_weight} onChange={set("obc_weight")} placeholder="e.g. 4 kg" />
                    </Field>
                    <Field label="Delivery deadline" htmlFor="q-deadline">
                      <input id="q-deadline" data-testid="quote-obc-deadline" type="date" className={`${inputCls} [color-scheme:light]`} value={form.obc_deadline} onChange={set("obc_deadline")} />
                    </Field>
                  </>
                )}
              </div>
              <Field label={t("form.description")} htmlFor="q-desc"><textarea id="q-desc" data-testid="quote-description-input" required rows={5} className={inputCls} value={form.description} onChange={set("description")} /></Field>
              <Field label={t("form.attachment")} htmlFor="q-file">
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-600 hover:border-black/50 cursor-pointer transition-colors duration-300">
                  <Upload size={15} />
                  <span data-testid="quote-file-label">{file ? file.name : "PDF, DOC, TXT — max 5MB"}</span>
                  <input id="q-file" data-testid="quote-file-input" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => setFile(e.target.files[0] || null)} />
                </label>
              </Field>
              <label className="flex items-start gap-3 text-xs text-zinc-600 cursor-pointer">
                <input data-testid="quote-consent-checkbox" type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-0.5 accent-zinc-950" />
                {t("form.consent")}
              </label>
              <CTAButton data-testid="quote-submit-btn" type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy ? t("common.submitting") : t("form.submitQuote")}
              </CTAButton>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
