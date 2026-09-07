import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg } from "../lib/api";
import { useI18n } from "../i18n";
import { Reveal } from "../components/Reveal";
import { Field, inputCls, CTAButton } from "../components/FormUI";

export default function JobDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [job, setJob] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", cover_letter: "", portfolio_url: "", additional_info: "" });
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/content/jobs/${id}`).then((r) => {
      setJob(r.data);
      document.title = `${r.data.title} — Careers at Yobsman-Tech`;
    }).catch(() => setNotFound(true));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("job_id", id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cv) fd.append("cv", cv);
      const { data } = await api.post("/applications", fd);
      setDone(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (notFound) return <div className="pt-40 pb-24 text-center text-zinc-600">Position not found. <Link to="/careers" className="underline">Back to careers</Link></div>;
  if (!job) return <div className="pt-40 pb-24 text-center text-zinc-500">{t("common.loading")}</div>;

  return (
    <div data-testid="job-detail-page" className="pt-36 sm:pt-44 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors duration-200 mb-8">
          <ArrowLeft size={15} /> {t("nav.careers")}
        </Link>
        <Reveal>
          <p className="mono-label mb-4">{job.department}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950">{job.title}</h1>
          <p className="mt-4 text-sm text-zinc-600">{job.location}, {job.country} · {job.employment_type} · {job.work_mode} · {t("careersPage.deadline")}: {job.deadline}</p>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-12 mt-14">
          <div className="space-y-10">
            {[["responsibilities", job.responsibilities], ["requirements", job.requirements], ["benefits", job.benefits]].map(([key, val]) => (
              <Reveal key={key}>
                <h2 className="font-display text-xl font-semibold text-zinc-900 mb-3">{t(`careersPage.${key}`)}</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{val}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8">
              {done ? (
                <div data-testid="application-success" className="text-center py-10">
                  <CheckCircle size={40} className="mx-auto text-zinc-800 mb-4" />
                  <h2 className="font-display text-2xl font-semibold text-zinc-950">Application received</h2>
                  <p className="text-sm text-zinc-600 mt-3">Thank you for applying. Our talent team will review your profile.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4" data-testid="application-form">
                  <h2 className="font-display text-xl font-semibold text-zinc-950 mb-2">{t("common.applyNow")}</h2>
                  <Field label={t("form.fullName")} htmlFor="ap-name"><input id="ap-name" data-testid="app-name-input" required className={inputCls} value={form.name} onChange={set("name")} /></Field>
                  <Field label={t("form.email")} htmlFor="ap-email"><input id="ap-email" data-testid="app-email-input" type="email" required className={inputCls} value={form.email} onChange={set("email")} /></Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label={t("form.phone")} htmlFor="ap-phone"><input id="ap-phone" data-testid="app-phone-input" className={inputCls} value={form.phone} onChange={set("phone")} /></Field>
                    <Field label={t("form.country")} htmlFor="ap-country"><input id="ap-country" data-testid="app-country-input" className={inputCls} value={form.country} onChange={set("country")} /></Field>
                  </div>
                  <Field label={t("form.coverLetter")} htmlFor="ap-cover"><textarea id="ap-cover" data-testid="app-cover-input" rows={4} className={inputCls} value={form.cover_letter} onChange={set("cover_letter")} /></Field>
                  <Field label={t("form.portfolio")} htmlFor="ap-port"><input id="ap-port" data-testid="app-portfolio-input" type="url" className={inputCls} value={form.portfolio_url} onChange={set("portfolio_url")} /></Field>
                  <Field label={t("form.additionalInfo")} htmlFor="ap-add"><textarea id="ap-add" rows={2} className={inputCls} value={form.additional_info} onChange={set("additional_info")} /></Field>
                  <Field label={t("form.cv")} htmlFor="ap-cv">
                    <label className="flex items-center gap-3 rounded-xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-600 hover:border-black/50 cursor-pointer transition-colors duration-300">
                      <Upload size={15} />
                      <span data-testid="app-cv-label">{cv ? cv.name : "PDF, DOC — max 5MB"}</span>
                      <input id="ap-cv" data-testid="app-cv-input" type="file" accept=".pdf,.doc,.docx" className="sr-only"
                        onChange={(e) => setCv(e.target.files[0] || null)} />
                    </label>
                  </Field>
                  <CTAButton data-testid="app-submit-btn" type="submit" disabled={busy} className="w-full">
                    {busy ? t("common.submitting") : t("form.submitApplication")}
                  </CTAButton>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
