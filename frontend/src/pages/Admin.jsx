import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { api, errMsg } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { Field, inputCls, CTAButton } from "../components/FormUI";

const STATUS_OPTIONS = {
  quotes: ["new", "in_review", "quoted", "flight_paid", "in_transit", "balance_due", "closed"],
  contacts: ["new", "in_progress", "resolved"],
  appointments: ["confirmed", "completed", "cancelled"],
  applications: ["received", "reviewing", "interview", "rejected", "hired"],
  documentation_leads: ["new", "contacted", "qualified", "booked", "closed"],
};
const ROLES = ["user", "admin", "hr", "support", "sales", "content"];
const NEXT_STAGE = { new: "in_review", in_review: "quoted", quoted: "flight_paid", flight_paid: "in_transit", in_transit: "balance_due", balance_due: "closed" };

const CONTENT_COLLS = {
  jobs: { fields: ["title", "department", "location", "country", "employment_type", "work_mode", "deadline", "responsibilities", "requirements", "benefits"] },
  leadership: { fields: ["name", "position", "bio", "expertise", "photo", "linkedin"] },
  partners: { fields: ["name", "desc", "url"] },
  posts: { fields: ["title", "category", "author", "published_at", "image", "excerpt", "content"] },
  services: { fields: ["title", "desc", "icon", "code"] },
};

export default function Admin() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({});

  const isAdmin = user && ["admin", "super_admin", "hr", "support", "sales", "content"].includes(user.role);

  useEffect(() => {
    if (user === false) navigate("/login");
    if (user && !isAdmin) navigate("/dashboard");
  }, [user, isAdmin, navigate]);

  const load = async (current) => {
    if (current === "overview") {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } else {
      const coll = current === "content" ? null : current;
      if (coll) {
        const { data } = await api.get(`/admin/list/${coll}`);
        setRows(data);
      }
    }
  };

  const [contentColl, setContentColl] = useState("jobs");
  const loadContent = async (coll) => {
    const { data } = await api.get(`/admin/list/${coll}`);
    setRows(data);
  };

  useEffect(() => {
    if (!isAdmin) return;
    document.title = "Admin — Yobsman-Tech";
    if (tab === "content") loadContent(contentColl);
    else load(tab).catch((e) => toast.error(errMsg(e)));
  }, [tab, isAdmin, contentColl]);

  if (!isAdmin) return <div className="pt-40 pb-24 text-center text-zinc-500">{t("common.loading")}</div>;

  const updateItem = async (coll, id, patch) => {
    try {
      await api.patch(`/admin/item/${coll}/${id}`, patch);
      setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      toast.success("Updated");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const deleteItem = async (coll, id) => {
    try {
      await api.delete(`/admin/content/${coll}/${id}`);
      setRows(rows.filter((r) => r.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const createItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/admin/content/${contentColl}`, draft);
      setRows([data, ...rows]);
      setDraft({});
      setCreating(false);
      toast.success("Created");
    } catch (err2) {
      toast.error(errMsg(err2));
    }
  };

  const tabs = ["overview", "quotes", "contacts", "appointments", "applications", "documentation_leads", "users", "content"];

  return (
    <div data-testid="admin-page" className="pt-28 sm:pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <p className="mono-label mb-2">Yobsman-Tech Internal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 mb-10">{t("admin.title")}</h1>

        <div className="flex gap-1 overflow-x-auto border-b border-black/10 mb-10" role="tablist">
          {tabs.map((key) => (
            <button key={key} data-testid={`admin-tab-${key}`} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-[color,border-color] duration-300 ${tab === key ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
              {t(`admin.${key}`)}
            </button>
          ))}
        </div>

        {tab === "overview" && stats && (
          <div data-testid="admin-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-6">
                <p className="font-display text-3xl font-bold text-zinc-950 tabular-nums">{v}</p>
                <p className="mono-label mt-2">{k.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        )}

        {["quotes", "contacts", "appointments", "applications", "documentation_leads"].includes(tab) && (
          <div data-testid={`admin-${tab}-table`} className="space-y-px rounded-2xl overflow-hidden border border-black/10 bg-black/10 overflow-x-auto">
            {rows.length === 0 && <p className="bg-[#F4F4F5] px-6 py-10 text-sm text-zinc-500">Nothing here yet.</p>}
            {rows.map((r) => (
              <div key={r.id} data-testid={`admin-row-${tab}-${r.id}`} className="bg-[#F4F4F5] px-6 py-5 grid lg:grid-cols-12 gap-3 items-center">
                <div className="lg:col-span-4">
                  <p className="font-display font-semibold text-sm text-zinc-900">{r.full_name || r.name} — {r.service || r.service_type || r.subject || r.job_title}</p>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{r.email} {r.country ? `· ${r.country}` : ""}</p>
                  {r.mission_token && (
                    <a data-testid={`admin-track-${r.id}`} href={`/track/${r.mission_token}`} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-mono text-zinc-500 underline underline-offset-2 hover:text-zinc-950">
                      OBC tracking ↗
                    </a>
                  )}
                </div>
                <p className="lg:col-span-5 text-xs text-zinc-600 truncate">{r.description || r.message || (Array.isArray(r.checklist) ? r.checklist.join(" • ") : "") || r.cover_letter || `${r.date || ""} ${r.time || ""} ${r.timezone || ""}`}</p>
                <p className="lg:col-span-2 font-mono text-[10px] text-zinc-600">{(r.created_at || "").slice(0, 10)}</p>
                <div className="lg:col-span-1 flex flex-col gap-2 items-start">
                  <select data-testid={`admin-status-${r.id}`} value={r.status} onChange={(e) => updateItem(tab, r.id, { status: e.target.value })}
                    className={`${inputCls} !py-1.5 !px-3 !text-xs`}>
                    {(STATUS_OPTIONS[tab] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {tab === "quotes" && r.mission_token && NEXT_STAGE[r.status] && (
                    <button data-testid={`admin-advance-${r.id}`} onClick={() => updateItem("quotes", r.id, { status: NEXT_STAGE[r.status] })}
                      className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-950 underline underline-offset-2">
                      Advance → {NEXT_STAGE[r.status].replace(/_/g, " ")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div data-testid="admin-users-table" className="space-y-px rounded-2xl overflow-hidden border border-black/10 bg-black/10">
            {rows.map((r) => (
              <div key={r.id} className="bg-[#F4F4F5] px-6 py-5 grid lg:grid-cols-12 gap-3 items-center">
                <div className="lg:col-span-5">
                  <p className="font-display font-semibold text-sm text-zinc-900">{r.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{r.email}</p>
                </div>
                <p className="lg:col-span-4 font-mono text-[10px] text-zinc-600">{(r.created_at || "").slice(0, 10)}</p>
                <div className="lg:col-span-3">
                  <select data-testid={`admin-role-${r.id}`} value={r.role} onChange={(e) => updateItem("users", r.id, { role: e.target.value })}
                    className={`${inputCls} !py-1.5 !px-3 !text-xs`}>
                    {ROLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "content" && (
          <div data-testid="admin-content">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {Object.keys(CONTENT_COLLS).map((c) => (
                <button key={c} data-testid={`admin-coll-${c}`} onClick={() => setContentColl(c)}
                  className={`rounded-full border px-4 py-2 text-xs transition-[border-color,color,background-color] duration-300 ${contentColl === c ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/15 text-zinc-600 hover:border-black/50"}`}>
                  {t(`admin.${c}`)}
                </button>
              ))}
              <button data-testid="admin-create-toggle" onClick={() => setCreating(!creating)}
                className="rounded-full border border-black/15 px-4 py-2 text-xs text-zinc-700 hover:border-black/50 inline-flex items-center gap-1.5 transition-colors duration-300">
                <Plus size={13} /> {t("admin.create")}
              </button>
            </div>

            {creating && (
              <form onSubmit={createItem} data-testid="admin-create-form" className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-8 mb-8 grid sm:grid-cols-2 gap-4">
                {CONTENT_COLLS[contentColl].fields.map((f) => (
                  <Field key={f} label={f} htmlFor={`cf-${f}`}>
                    {["bio", "responsibilities", "requirements", "benefits", "content", "excerpt", "desc"].includes(f) ? (
                      <textarea id={`cf-${f}`} data-testid={`create-field-${f}`} rows={2} className={inputCls} value={draft[f] || ""} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })} />
                    ) : (
                      <input id={`cf-${f}`} data-testid={`create-field-${f}`} className={inputCls} value={draft[f] || ""} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })} />
                    )}
                  </Field>
                ))}
                <div className="sm:col-span-2"><CTAButton data-testid="admin-create-submit" type="submit">{t("admin.create")}</CTAButton></div>
              </form>
            )}

            <div className="space-y-px rounded-2xl overflow-hidden border border-black/10 bg-black/10">
              {rows.map((r) => (
                <div key={r.id} data-testid={`admin-content-row-${r.id}`} className="bg-[#F4F4F5] px-6 py-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-zinc-900 truncate">{r.title || r.name}</p>
                    <p className="text-xs text-zinc-500 mt-1 truncate">{r.department || r.position || r.category || r.code || r.desc}</p>
                  </div>
                  <button data-testid={`admin-delete-${r.id}`} onClick={() => deleteItem(contentColl, r.id)} aria-label="Delete"
                    className="shrink-0 text-zinc-600 hover:text-red-300 transition-colors duration-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
