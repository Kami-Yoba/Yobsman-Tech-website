import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardList, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { Reveal, SectionHead } from "./Reveal";
import { Field, inputCls, linkBtnCls } from "./FormUI";

const DOC_SERVICE = "Documentation Assistance";
const SERVICE_KEYS = ["immigration", "tax", "drafting", "submission", "everyday"];
const STAGE_KEYS = ["starting", "collecting", "ready", "submitted"];
const URGENCY_KEYS = ["flexible", "month", "week", "urgent"];

const localizedAt = (value, index, field) => (Array.isArray(value) && value[index]?.[field]) || "";
const localizedList = (value, key) => (value && Array.isArray(value[key]) ? value[key] : []);

export default function SmartChecklist() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({
    service_type: "", country: "", stage: "", urgency: "",
    name: "", email: "", consent: false, website: "",
  });

  useEffect(() => {
    if (user) {
      setAnswers((current) => ({
        ...current,
        name: current.name || user.name || "",
        email: current.email || user.email || "",
      }));
    }
  }, [user]);

  const servicesT = t("docChecklist.services");
  const stagesT = t("docChecklist.stages");
  const urgencyT = t("docChecklist.urgency");
  const serviceOptions = SERVICE_KEYS.map((key, i) => ({
    key,
    title: localizedAt(servicesT, i, "title"),
    desc: localizedAt(servicesT, i, "desc"),
  }));
  const stageOptions = STAGE_KEYS.map((key, i) => ({
    key,
    title: localizedAt(stagesT, i, "title"),
    desc: localizedAt(stagesT, i, "desc"),
  }));
  const urgencyOptions = URGENCY_KEYS.map((key, i) => ({
    key,
    title: localizedAt(urgencyT, i, "title"),
    desc: localizedAt(urgencyT, i, "desc"),
  }));

  const checklist = useMemo(() => {
    if (!answers.service_type) return [];
    const base = t("docChecklist.base");
    const tasks = t("docChecklist.tasks");
    const stageItems = t("docChecklist.stageItems");
    const urgencyItems = t("docChecklist.urgencyItems");
    const countryItem = t("docChecklist.countryItem").replace("{country}", answers.country || t("docChecklist.countryFallback"));
    return [...new Set([
      ...(Array.isArray(base) ? base : []),
      countryItem,
      ...localizedList(tasks, answers.service_type),
      ...localizedList(stageItems, answers.stage),
      ...localizedList(urgencyItems, answers.urgency),
    ])];
  }, [answers, t]);

  const serviceTitle = serviceOptions.find((o) => o.key === answers.service_type)?.title || "";
  const stageTitle = stageOptions.find((o) => o.key === answers.stage)?.title || "";
  const urgencyTitle = urgencyOptions.find((o) => o.key === answers.urgency)?.title || "";
  const checklistText = checklist.map((item, i) => `${i + 1}. ${item}`).join("\n");
  const quoteUrl = useMemo(() => {
    const description = [
      `${t("docChecklist.resultTitle")}`,
      `${t("docChecklist.serviceLabel")}: ${serviceTitle}`,
      `${t("docChecklist.countryLabel")}: ${answers.country}`,
      `${t("docChecklist.stageLabel")}: ${stageTitle}`,
      `${t("docChecklist.urgencyLabel")}: ${urgencyTitle}`,
      "",
      checklistText,
    ].join("\n");
    const params = new URLSearchParams({
      service: DOC_SERVICE,
      project_type: "Consultation",
      timeline: answers.urgency === "urgent" || answers.urgency === "week" ? "ASAP" : answers.urgency === "month" ? "1–3 months" : "Flexible",
      description,
    });
    return `/quote?${params.toString()}`;
  }, [answers.country, answers.urgency, checklistText, serviceTitle, stageTitle, t, urgencyTitle]);

  const canNext = [
    Boolean(answers.service_type),
    answers.country.trim().length > 1,
    Boolean(answers.stage),
    Boolean(answers.urgency),
  ][step];

  const update = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/documentation-checklist", {
        ...answers,
        name: answers.name.trim(),
        email: answers.email.trim(),
        country: answers.country.trim(),
        checklist,
        language: lang,
      });
      setResult(data);
      toast.success(t("docChecklist.saved"));
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const copyChecklist = async () => {
    await navigator.clipboard.writeText(checklistText);
    toast.success(t("docChecklist.copied"));
  };

  const stepsT = t("docChecklist.steps");

  return (
    <section data-testid="smart-checklist-section" className="py-24 border-t border-black/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <SectionHead eyebrow={t("docChecklist.eyebrow")} title={t("docChecklist.title")} desc={t("docChecklist.desc")} />
        <Reveal>
          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-10 shadow-[0_24px_80px_rgba(9,9,11,0.06)]">
            <div className="flex items-center gap-2 mb-8 overflow-x-auto" aria-label={t("docChecklist.progressLabel")}>
              {(Array.isArray(stepsT) ? stepsT : []).map((label, i) => (
                <div key={label} className="flex items-center gap-2 shrink-0">
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs ${step >= i || result ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/15 text-zinc-500"}`}>{i + 1}</span>
                  <span className={`text-xs ${step >= i || result ? "text-zinc-950" : "text-zinc-500"}`}>{label}</span>
                  {i < stepsT.length - 1 && <span className="w-5 h-px bg-black/15" />}
                </div>
              ))}
            </div>

            {result ? (
              <div data-testid="checklist-result">
                <div className="flex items-start gap-4 mb-8">
                  <CheckCircle size={28} className="text-zinc-800 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-950">{t("docChecklist.resultTitle")}</h3>
                    <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{t("docChecklist.resultDesc")}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F4F4F5] border border-black/10 p-6 sm:p-8">
                  <p className="mono-label mb-5">{serviceTitle} · {answers.country} · {urgencyTitle}</p>
                  <ol className="space-y-4">
                    {checklist.map((item, i) => (
                      <li key={item} data-testid={`checklist-item-${i + 1}`} className="flex gap-4 text-sm sm:text-base text-zinc-700 leading-relaxed">
                        <span className="font-mono text-xs text-zinc-400 pt-1">{String(i + 1).padStart(2, "0")}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button type="button" data-testid="checklist-copy-btn" onClick={copyChecklist} className={linkBtnCls.ghost}>
                    <Copy size={16} /> {t("docChecklist.copy")}
                  </button>
                  <Link to={quoteUrl} data-testid="checklist-quote-link" className={linkBtnCls.solid}>
                    {t("docChecklist.quote")} <ArrowRight size={16} />
                  </Link>
                  <Link to={`/book?service=${encodeURIComponent(DOC_SERVICE)}`} data-testid="checklist-book-link" className={linkBtnCls.ghost}>
                    {t("docChecklist.book")}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="smart-checklist-form">
                <input type="text" name="website" value={answers.website} onChange={(e) => update("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                {step === 0 && (
                  <div data-testid="checklist-step-service">
                    <h3 className="font-display text-2xl font-semibold text-zinc-950 mb-6">{t("docChecklist.serviceQuestion")}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {serviceOptions.map((option) => (
                        <button key={option.key} type="button" data-testid={`checklist-service-${option.key}`} onClick={() => update("service_type", option.key)}
                          className={`text-start rounded-2xl border p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 ${answers.service_type === option.key ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/10 bg-[#F4F4F5] hover:border-black/30"}`}>
                          <ClipboardList size={19} className={answers.service_type === option.key ? "text-zinc-300" : "text-zinc-500"} />
                          <span className="block font-display text-base font-semibold mt-4">{option.title}</span>
                          <span className={`block text-xs leading-relaxed mt-2 ${answers.service_type === option.key ? "text-zinc-300" : "text-zinc-600"}`}>{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div data-testid="checklist-step-country">
                    <Field label={t("docChecklist.countryQuestion")} htmlFor="checklist-country">
                      <input id="checklist-country" data-testid="checklist-country-input" required minLength={2} className={inputCls}
                        value={answers.country} onChange={(e) => update("country", e.target.value)} placeholder={t("docChecklist.countryPlaceholder")} />
                    </Field>
                    <p className="mt-3 text-xs text-zinc-500">{t("docChecklist.countryHint")}</p>
                  </div>
                )}

                {step === 2 && (
                  <div data-testid="checklist-step-stage">
                    <h3 className="font-display text-2xl font-semibold text-zinc-950 mb-6">{t("docChecklist.stageQuestion")}</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {stageOptions.map((option) => (
                        <button key={option.key} type="button" data-testid={`checklist-stage-${option.key}`} onClick={() => update("stage", option.key)}
                          className={`text-start rounded-2xl border p-5 transition-colors duration-300 ${answers.stage === option.key ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/10 bg-[#F4F4F5] hover:border-black/30"}`}>
                          <span className="block font-display text-base font-semibold">{option.title}</span>
                          <span className={`block text-xs leading-relaxed mt-2 ${answers.stage === option.key ? "text-zinc-300" : "text-zinc-600"}`}>{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div data-testid="checklist-step-urgency">
                    <h3 className="font-display text-2xl font-semibold text-zinc-950 mb-6">{t("docChecklist.urgencyQuestion")}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {urgencyOptions.map((option) => (
                        <button key={option.key} type="button" data-testid={`checklist-urgency-${option.key}`} onClick={() => update("urgency", option.key)}
                          className={`text-start rounded-2xl border p-5 transition-colors duration-300 ${answers.urgency === option.key ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/10 bg-[#F4F4F5] hover:border-black/30"}`}>
                          <span className="block font-display text-base font-semibold">{option.title}</span>
                          <span className={`block text-xs leading-relaxed mt-2 ${answers.urgency === option.key ? "text-zinc-300" : "text-zinc-600"}`}>{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div data-testid="checklist-step-contact" className="space-y-5">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-zinc-950">{t("docChecklist.contactTitle")}</h3>
                      <p className="mt-2 text-sm text-zinc-600">{t("docChecklist.contactDesc")}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label={t("form.fullName")} htmlFor="checklist-name">
                        <input id="checklist-name" data-testid="checklist-name-input" required minLength={2} className={inputCls} value={answers.name} onChange={(e) => update("name", e.target.value)} />
                      </Field>
                      <Field label={t("form.email")} htmlFor="checklist-email">
                        <input id="checklist-email" data-testid="checklist-email-input" required type="email" className={inputCls} value={answers.email} onChange={(e) => update("email", e.target.value)} />
                      </Field>
                    </div>
                    <label className="flex items-start gap-3 text-xs text-zinc-600 cursor-pointer">
                      <input data-testid="checklist-consent-checkbox" type="checkbox" required checked={answers.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-0.5 accent-zinc-950" />
                      {t("docChecklist.consent")}
                    </label>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-between gap-4">
                  <button type="button" data-testid="checklist-back-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 disabled:opacity-0 transition-colors duration-200">
                    <ArrowLeft size={15} /> {t("docChecklist.back")}
                  </button>
                  {step < 4 ? (
                    <button type="button" data-testid="checklist-next-btn" onClick={() => setStep(step + 1)} disabled={!canNext} className={`${linkBtnCls.solid} disabled:opacity-40 disabled:pointer-events-none`}>
                      {t("docChecklist.next")} <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button type="submit" data-testid="checklist-generate-btn" disabled={busy || !answers.consent} className={`${linkBtnCls.solid} disabled:opacity-40 disabled:pointer-events-none`}>
                      {busy ? t("docChecklist.generating") : t("docChecklist.generate")} <Send size={15} />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
