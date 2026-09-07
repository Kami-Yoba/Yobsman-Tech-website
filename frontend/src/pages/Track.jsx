import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Circle, Upload, Plane, PackageCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, API, errMsg } from "../lib/api";
import { Field, inputCls, CTAButton } from "../components/FormUI";

const STAGES = [
  "Request received",
  "Mission confirmed & quoted",
  "Flight cost paid — courier booked",
  "In transit",
  "Delivered — proof of delivery received",
  "Mission closed",
];
const STAGE_INDEX = { new: 0, in_review: 0, quoted: 1, flight_paid: 2, in_transit: 3, balance_due: 4, closed: 5 };

export default function Track() {
  const { token } = useParams();
  const [mission, setMission] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get(`/track/${token}`).then((r) => setMission(r.data)).catch(() => setNotFound(true));
  }, [token]);

  useEffect(() => {
    document.title = "OBC Mission Tracking — Yobsman-Tech";
    load();
  }, [token, load]);

  const upload = async (e) => {
    e.preventDefault();
    if (!photo) {
      toast.error("Please attach a proof-of-delivery photo");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("photo", photo);
      fd.append("note", note);
      await api.post(`/track/${token}/pod`, fd);
      toast.success("Proof of delivery received. Balance invoice has been triggered.");
      setPhoto(null);
      setNote("");
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (notFound) {
    return (
      <div data-testid="track-not-found" className="pt-40 pb-24 text-center">
        <p className="text-zinc-600">Mission not found. Check your tracking link.</p>
        <Link to="/" className="text-zinc-950 underline underline-offset-4 text-sm mt-4 inline-block">Back to home</Link>
      </div>
    );
  }
  if (!mission) {
    return <div className="pt-40 pb-24 text-center text-zinc-500"><Loader2 className="animate-spin inline-block" size={20} /></div>;
  }

  const stage = STAGE_INDEX[mission.status] ?? 0;
  const delivered = stage >= 4;

  return (
    <div data-testid="track-page" className="pt-36 sm:pt-44 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <p className="mono-label mb-4 flex items-center gap-2"><Plane size={13} /> OBC Mission Tracking</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950">On-Board Courier mission</h1>
        <p className="mt-3 font-mono text-xs text-zinc-500">Tracking ID: {mission.token}</p>

        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="mono-label mb-2">Route</p>
              <p data-testid="track-route" className="font-display text-xl font-semibold text-zinc-950">
                {mission.origin || "—"} <span className="text-zinc-400">→</span> {mission.destination || "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="mono-label mb-2">Weight</p><p className="text-sm text-zinc-800">{mission.weight || "—"}</p></div>
              <div><p className="mono-label mb-2">Deadline</p><p className="text-sm text-zinc-800">{mission.deadline || "—"}</p></div>
              <div><p className="mono-label mb-2">Requester</p><p className="text-sm text-zinc-800">{mission.full_name}</p></div>
              <div>
                <p className="mono-label mb-2">Status</p>
                <span data-testid="track-status" className="inline-block text-[11px] font-mono uppercase tracking-widest border border-black/20 rounded-full px-3 py-1 text-zinc-800">{mission.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <p className="mono-label mb-6">Milestones</p>
          <div className="relative border-s border-black/10 ms-2 space-y-8">
            {STAGES.map((label, i) => {
              const done = i < stage || (i === stage && mission.status === "closed");
              const current = i === stage && mission.status !== "closed";
              return (
                <div key={label} data-testid={`track-stage-${i}`} className="relative ps-10">
                  <span className="absolute -start-[13px] top-0">
                    {done ? <CheckCircle2 size={24} className="text-zinc-950 bg-white" />
                      : current ? <span className="block w-6 h-6 rounded-full bg-zinc-950 pulse-dot" />
                      : <Circle size={24} className="text-zinc-300 bg-white" />}
                  </span>
                  <p className={`font-display font-semibold ${done || current ? "text-zinc-950" : "text-zinc-400"}`}>{label}</p>
                  {current && <p className="text-xs text-zinc-500 mt-1">Current stage</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-black/10 bg-white p-8">
          <div className="flex items-center gap-3 mb-5">
            <PackageCheck size={20} className="text-zinc-500" />
            <h2 className="font-display text-xl font-semibold text-zinc-950">Proof of delivery</h2>
          </div>
          {mission.pod_file ? (
            <div data-testid="pod-display">
              <img src={`${API}/track/${token}/pod-image`} data-photo alt="Proof of delivery"
                className="max-h-80 rounded-xl border border-black/10 object-cover" />
              {mission.pod_note && <p className="mt-4 text-sm text-zinc-600">Courier note: {mission.pod_note}</p>}
              <p className="mt-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
                Delivered {mission.pod_at ? new Date(mission.pod_at).toLocaleString() : ""} — balance invoice issued to requester.
              </p>
            </div>
          ) : (
            <form onSubmit={upload} data-testid="pod-upload-form" className="space-y-4">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Courier partner: upload the signed/photographic proof of delivery here. Uploading marks the mission as
                delivered and automatically triggers the balance invoice in our admin panel.
              </p>
              <Field label="POD photo (required)" htmlFor="pod-photo">
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-600 hover:border-black/50 cursor-pointer transition-colors duration-300">
                  <Upload size={15} />
                  <span data-testid="pod-file-label">{photo ? photo.name : "JPG, PNG — max 5MB"}</span>
                  <input id="pod-photo" data-testid="pod-file-input" type="file" accept=".png,.jpg,.jpeg" className="sr-only"
                    onChange={(e) => setPhoto(e.target.files[0] || null)} />
                </label>
              </Field>
              <Field label="Delivery note (optional)" htmlFor="pod-note">
                <textarea id="pod-note" data-testid="pod-note-input" rows={2} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Recipient name, condition, remarks…" />
              </Field>
              <CTAButton data-testid="pod-submit-btn" type="submit" disabled={busy || delivered}>
                {busy ? "Uploading…" : "Submit proof of delivery"}
              </CTAButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
