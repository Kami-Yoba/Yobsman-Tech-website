import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, ArrowRight, Calendar, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { PageHero, Field, inputCls, CTAButton } from "../components/FormUI";

const TIMEZONES = [
  "Europe/Helsinki", "Europe/London", "Europe/Berlin", "Europe/Stockholm", "Europe/Oslo",
  "Europe/Copenhagen", "Europe/Warsaw", "Europe/Amsterdam", "Europe/Paris", "Europe/Madrid",
  "Europe/Rome", "Europe/Lisbon", "Europe/Moscow", "Asia/Dubai", "Africa/Nairobi",
  "Asia/Kolkata", "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
  "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Sao_Paulo", "UTC",
];

export default function Book() {
  const { t, languages } = useI18n();
  const [params] = useSearchParams();
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [service, setService] = useState(params.get("service") || "");
  const [date, setDate] = useState("");
  const [tz, setTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Helsinki");
  const [slots, setSlots] = useState(null);
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", language: "en", notes: "" });
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    document.title = "Book an Appointment — Yobsman-Tech";
    api.get("/content/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setTime("");
    setSlots(null);
    if (!date || !tz) return;
    api.get(`/appointments/availability?date=${date}&tz=${encodeURIComponent(tz)}`)
      .then((r) => setSlots(r.data.slots))
      .catch(() => setSlots([]));
  }, [date, tz]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const setD = (k) => (e) => setDetails({ ...details, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/appointments", { service, date, time, timezone: tz, ...details });
      setConfirmed(data.appointment);
      toast.success(data.message);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    return (
      <div data-testid="booking-page" className="pt-36 sm:pt-44 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-8">
          <div data-testid="booking-success" className="rounded-2xl border border-white/10 bg-[#0D0D10] p-12 text-center">
            <CheckCircle size={44} className="mx-auto text-zinc-200 mb-5" />
            <h1 className="font-display text-3xl font-bold text-zinc-50 mb-4">Appointment confirmed</h1>
            <div className="font-mono text-sm text-zinc-300 space-y-2 mb-6">
              <p>{confirmed.service}</p>
              <p>{confirmed.date} — {confirmed.time} ({confirmed.timezone})</p>
              <p className="text-zinc-500">30 min · UTC {confirmed.start_utc}</p>
            </div>
            <p className="text-sm text-zinc-400">{t("book.successMsg")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="booking-page">
      <PageHero eyebrow="Consultation" title={t("book.title")} desc={t("book.desc")} />
      <section className="pb-24 sm:pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 mb-8 font-mono text-[11px] uppercase tracking-widest">
            {[t("book.stepService"), t("book.stepWhen"), t("book.stepDetails")].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full border flex items-center justify-center ${step > i ? "border-white bg-white text-black" : "border-white/20 text-zinc-500"}`}>{i + 1}</span>
                <span className={step > i ? "text-zinc-200" : "text-zinc-600"}>{s}</span>
                {i < 2 && <span className="w-6 h-px bg-white/15 mx-1" />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D0D10] p-8 sm:p-10">
            {step === 1 && (
              <div data-testid="booking-step-service">
                <Field label={t("form.service")} htmlFor="b-service">
                  <select id="b-service" data-testid="booking-service-select" className={inputCls} value={service} onChange={(e) => setService(e.target.value)}>
                    <option value="">{t("form.selectService")}</option>
                    {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
                    <option value="KAGAYO">KAGAYO</option>
                  </select>
                </Field>
                <div className="mt-8 flex justify-end">
                  <CTAButton data-testid="booking-next-1" disabled={!service} onClick={() => setStep(2)}>{t("book.stepWhen")} <ArrowRight size={15} /></CTAButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div data-testid="booking-step-when" className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t("form.date")} htmlFor="b-date">
                    <div className="relative">
                      <Calendar size={15} className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input id="b-date" data-testid="booking-date-input" type="date" min={today} className={`${inputCls} ps-10 [color-scheme:dark]`} value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                  </Field>
                  <Field label={t("form.timezone")} htmlFor="b-tz">
                    <div className="relative">
                      <Globe size={15} className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <select id="b-tz" data-testid="booking-timezone-select" className={`${inputCls} ps-10`} value={tz} onChange={(e) => setTz(e.target.value)}>
                        {[...new Set([tz, ...TIMEZONES])].map((z) => <option key={z} value={z}>{z.replace("_", " ")}</option>)}
                      </select>
                    </div>
                  </Field>
                </div>
                {date && (
                  <div>
                    <p className="text-xs font-medium tracking-wide text-zinc-400 mb-3 flex items-center gap-2"><Clock size={13} /> {t("form.time")} — {tz}</p>
                    {slots === null ? (
                      <p className="text-sm text-zinc-500">{t("common.loading")}</p>
                    ) : slots.every((s) => !s.available) ? (
                      <p data-testid="booking-no-slots" className="text-sm text-zinc-500">{t("book.noSlots")}</p>
                    ) : (
                      <div data-testid="booking-slots" className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {slots.map((s) => (
                          <button key={s.time} type="button" data-testid={`slot-${s.time.replace(":", "")}`} disabled={!s.available}
                            onClick={() => setTime(s.time)}
                            className={`rounded-lg border px-2 py-2.5 font-mono text-xs transition-[border-color,background-color,color] duration-200 ${
                              time === s.time ? "border-white bg-white text-black" :
                              s.available ? "border-white/15 text-zinc-300 hover:border-white/60" : "border-white/5 text-zinc-700 cursor-not-allowed line-through"}`}>
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <button data-testid="booking-back-2" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors duration-200"><ArrowLeft size={15} /> {t("book.stepService")}</button>
                  <CTAButton data-testid="booking-next-2" disabled={!date || !time} onClick={() => setStep(3)}>{t("book.stepDetails")} <ArrowRight size={15} /></CTAButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div data-testid="booking-step-details" className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs text-zinc-300">
                  {service} · {date} · {time} ({tz}) · 30 min
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label={t("form.fullName")} htmlFor="b-name"><input id="b-name" data-testid="booking-name-input" className={inputCls} value={details.name} onChange={setD("name")} /></Field>
                  <Field label={t("form.email")} htmlFor="b-email"><input id="b-email" data-testid="booking-email-input" type="email" className={inputCls} value={details.email} onChange={setD("email")} /></Field>
                  <Field label={t("form.phone")} htmlFor="b-phone"><input id="b-phone" data-testid="booking-phone-input" className={inputCls} value={details.phone} onChange={setD("phone")} /></Field>
                  <Field label={t("form.language")} htmlFor="b-lang">
                    <select id="b-lang" data-testid="booking-language-select" className={inputCls} value={details.language} onChange={setD("language")}>
                      {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label={t("form.notes")} htmlFor="b-notes"><textarea id="b-notes" data-testid="booking-notes-input" rows={3} className={inputCls} value={details.notes} onChange={setD("notes")} /></Field>
                <div className="flex justify-between pt-2">
                  <button data-testid="booking-back-3" onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors duration-200"><ArrowLeft size={15} /> {t("book.stepWhen")}</button>
                  <CTAButton data-testid="booking-confirm-btn" disabled={busy || !details.name || !details.email} onClick={submit}>
                    {busy ? t("common.submitting") : t("form.confirmBooking")}
                  </CTAButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
