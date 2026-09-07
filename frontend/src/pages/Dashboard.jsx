import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, FileText, Bell, User, Globe, LogOut } from "lucide-react";
import { api, errMsg } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { Field, inputCls, CTAButton } from "../components/FormUI";

const TABS = [
  ["overview", User], ["appointments", Calendar], ["quotes", FileText],
  ["notifications", Bell], ["languageTab", Globe],
];

const STATUS_CLS = {
  confirmed: "text-zinc-100 border-white/30", cancelled: "text-zinc-600 border-white/10 line-through",
  completed: "text-zinc-400 border-white/15", new: "text-white border-white/40",
  quoted: "text-zinc-200 border-white/25", closed: "text-zinc-500 border-white/10",
};

export default function Dashboard() {
  const { t, languages, setLang } = useI18n();
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user === false) navigate("/login");
    if (user) {
      document.title = "Dashboard — Yobsman-Tech";
      api.get("/my/overview").then((r) => setOverview(r.data)).catch(() => {});
      api.get("/my/appointments").then((r) => setAppointments(r.data)).catch(() => {});
      api.get("/my/quotes").then((r) => setQuotes(r.data)).catch(() => {});
      setProfile({ name: user.name, phone: user.phone || "", company: user.company || "", country: user.country || "", language: user.language || "en", notify_email: user.notify_email !== false, notify_appointments: user.notify_appointments !== false });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (tab === "notifications" && user) {
      api.get("/my/notifications").then((r) => setNotifications(r.data)).catch(() => {});
    }
  }, [tab, user]);

  if (!user) return <div className="pt-40 pb-24 text-center text-zinc-500">{t("common.loading")}</div>;

  const cancelAppt = async (id) => {
    try {
      await api.patch(`/my/appointments/${id}/cancel`);
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch("/my/profile", profile);
      setUser(data);
      setLang(data.language || "en");
      toast.success(t("dashboard.saved"));
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const now = new Date().toISOString();
  const upcoming = appointments.filter((a) => a.status === "confirmed" && a.start_utc >= now);
  const past = appointments.filter((a) => !(a.status === "confirmed" && a.start_utc >= now));

  return (
    <div data-testid="dashboard-page" className="pt-28 sm:pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <p className="mono-label mb-2">Client Portal</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-50">{t("dashboard.welcome")}, {user.name}</h1>
          </div>
          <button data-testid="dashboard-logout-btn" onClick={async () => { await logout(); navigate("/"); }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:border-white/50 hover:text-white transition-[border-color,color] duration-300">
            <LogOut size={15} /> {t("nav.logout")}
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-white/10 mb-10" role="tablist">
          {[...TABS.slice(0, 3), ["profile", User], ...TABS.slice(3)].map(([key, Icon]) => (
            <button key={key} data-testid={`dash-tab-${key}`} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-[color,border-color] duration-300 ${tab === key ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"}`}>
              <Icon size={15} /> {t(`dashboard.${key}`)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div data-testid="dash-overview" className="grid sm:grid-cols-3 gap-5">
            {[
              [t("dashboard.appointments"), overview?.appointments ?? "—"],
              [t("dashboard.upcoming"), overview?.upcoming ?? "—"],
              [`${t("dashboard.notifications")} (${t("dashboard.unread")})`, overview?.unread_notifications ?? "—"],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#0D0D10] p-8">
                <p className="font-display text-4xl font-bold text-zinc-50">{val}</p>
                <p className="mono-label mt-3">{label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "appointments" && (
          <div data-testid="dash-appointments" className="space-y-8">
            {appointments.length === 0 && <p className="text-sm text-zinc-500">{t("dashboard.noAppointments")}</p>}
            {[["upcoming", upcoming], ["past", past]].map(([label, list]) => list.length > 0 && (
              <div key={label}>
                <p className="mono-label mb-4">{t(`dashboard.${label}`)}</p>
                <div className="space-y-px rounded-2xl overflow-hidden border border-white/10 bg-white/10">
                  {list.map((a) => (
                    <div key={a.id} data-testid={`appt-row-${a.id}`} className="bg-[#0A0A0C] px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold text-zinc-100">{a.service}</p>
                        <p className="font-mono text-xs text-zinc-500 mt-1">{a.date} · {a.time} ({a.timezone})</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-mono uppercase tracking-widest border rounded-full px-3 py-1 ${STATUS_CLS[a.status] || "text-zinc-400 border-white/15"}`}>{a.status}</span>
                        {a.status === "confirmed" && a.start_utc >= now && (
                          <button data-testid={`appt-cancel-${a.id}`} onClick={() => cancelAppt(a.id)}
                            className="text-xs text-zinc-500 hover:text-red-300 transition-colors duration-200 underline underline-offset-4 decoration-white/20">
                            {t("dashboard.cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "quotes" && (
          <div data-testid="dash-quotes">
            {quotes.length === 0 ? <p className="text-sm text-zinc-500">{t("dashboard.noQuotes")}</p> : (
              <div className="space-y-px rounded-2xl overflow-hidden border border-white/10 bg-white/10">
                {quotes.map((q) => (
                  <div key={q.id} data-testid={`quote-row-${q.id}`} className="bg-[#0A0A0C] px-6 py-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-semibold text-zinc-100">{q.service}</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xl truncate">{q.description}</p>
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-widest border rounded-full px-3 py-1 ${STATUS_CLS[q.status] || "text-zinc-400 border-white/15"}`}>{q.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && profile && (
          <form onSubmit={saveProfile} data-testid="dash-profile-form" className="max-w-2xl rounded-2xl border border-white/10 bg-[#0D0D10] p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={t("form.fullName")} htmlFor="p-name"><input id="p-name" data-testid="profile-name-input" className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
              <Field label={t("form.phone")} htmlFor="p-phone"><input id="p-phone" data-testid="profile-phone-input" className={inputCls} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
              <Field label={t("form.company")} htmlFor="p-company"><input id="p-company" data-testid="profile-company-input" className={inputCls} value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></Field>
              <Field label={t("form.country")} htmlFor="p-country"><input id="p-country" data-testid="profile-country-input" className={inputCls} value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
              <input data-testid="profile-notify-email" type="checkbox" checked={profile.notify_email} onChange={(e) => setProfile({ ...profile, notify_email: e.target.checked })} className="accent-white" />
              Email communications
            </label>
            <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
              <input data-testid="profile-notify-appt" type="checkbox" checked={profile.notify_appointments} onChange={(e) => setProfile({ ...profile, notify_appointments: e.target.checked })} className="accent-white" />
              Appointment reminders
            </label>
            <CTAButton data-testid="profile-save-btn" type="submit">{t("dashboard.save")}</CTAButton>
          </form>
        )}

        {tab === "notifications" && (
          <div data-testid="dash-notifications" className="max-w-2xl space-y-3">
            {notifications.length === 0 && <p className="text-sm text-zinc-500">{t("dashboard.noNotifications")}</p>}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-white/10 bg-[#0D0D10] p-5">
                <p className="font-display font-semibold text-sm text-zinc-100">{n.title}</p>
                <p className="text-xs text-zinc-500 mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "languageTab" && profile && (
          <div data-testid="dash-language" className="max-w-md rounded-2xl border border-white/10 bg-[#0D0D10] p-8 space-y-5">
            <Field label={t("form.language")} htmlFor="d-lang">
              <select id="d-lang" data-testid="dash-language-select" className={inputCls} value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            </Field>
            <CTAButton data-testid="dash-language-save" onClick={saveProfile}>{t("dashboard.save")}</CTAButton>
          </div>
        )}
      </div>
    </div>
  );
}
