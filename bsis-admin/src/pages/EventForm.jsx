import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui";
import { ImageField } from "../components/MediaPicker";

const empty = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  coverImage: "",
  startDate: "",
  endDate: "",
  time: "",
  venue: "",
  city: "",
  registrationLink: "",
  isFeatured: false,
  status: "draft",
};

const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function EventForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [ev, setEv] = useState(isNew ? empty : null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/api/events/${id}`)
      .then((res) => {
        const e = res.data.event;
        setEv({ ...e, startDate: toInput(e.startDate), endDate: toInput(e.endDate) });
      })
      .catch((e) => {
        toast(errMsg(e), "error");
        navigate("/events");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (patch) => setEv((e) => ({ ...e, ...patch }));

  const save = async (e) => {
    e.preventDefault();
    if (!ev.title.trim()) return toast("Event needs a title.", "error");
    if (!ev.startDate) return toast("Pick a start date.", "error");
    setSaving(true);
    try {
      const body = { ...ev, endDate: ev.endDate || undefined };
      if (isNew) {
        await api.post("/api/events", body);
        toast("Event created");
      } else {
        await api.put(`/api/events/${id}`, body);
        toast("Event saved");
      }
      navigate("/events");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !ev) return <Spinner />;

  return (
    <form onSubmit={save}>
      <div className="page-head">
        <div>
          <h1>{isNew ? "New event" : `Edit: ${ev.title}`}</h1>
          <p>Published events appear on the website's events page.</p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/events")}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Create event" : "Save changes"}</button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-pad">
          <div className="field">
            <label>Title</label>
            <input className="input" value={ev.title} onChange={(e) => set({ title: e.target.value })} placeholder="Startup Summit 2026" />
          </div>
          <div className="field">
            <label>Short description (for listing cards)</label>
            <textarea className="textarea" rows={2} value={ev.shortDescription || ""} onChange={(e) => set({ shortDescription: e.target.value })} />
          </div>
          <div className="field">
            <label>Full description (HTML allowed)</label>
            <textarea className="textarea code" rows={9} value={ev.description || ""} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <ImageField label="Cover image" value={ev.coverImage} onChange={(v) => set({ coverImage: v })} />
        </div>

        <div className="card card-pad">
          <div className="form-grid">
            <div className="field">
              <label>Start date</label>
              <input type="date" className="input" value={ev.startDate} onChange={(e) => set({ startDate: e.target.value })} />
            </div>
            <div className="field">
              <label>End date (optional)</label>
              <input type="date" className="input" value={ev.endDate} onChange={(e) => set({ endDate: e.target.value })} />
            </div>
            <div className="field">
              <label>Time</label>
              <input className="input" value={ev.time || ""} onChange={(e) => set({ time: e.target.value })} placeholder="10:00 AM – 4:00 PM" />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="select" value={ev.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="field">
              <label>Venue</label>
              <input className="input" value={ev.venue || ""} onChange={(e) => set({ venue: e.target.value })} />
            </div>
            <div className="field">
              <label>City</label>
              <input className="input" value={ev.city || ""} onChange={(e) => set({ city: e.target.value })} placeholder="Lucknow" />
            </div>
          </div>
          <div className="field">
            <label>Registration link</label>
            <input className="input" value={ev.registrationLink || ""} onChange={(e) => set({ registrationLink: e.target.value })} placeholder="https://forms…" />
          </div>
          <div className="field">
            <label>Slug (optional — generated from title)</label>
            <input className="input mono" value={ev.slug || ""} onChange={(e) => set({ slug: e.target.value })} />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={!!ev.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
            Feature this event on the homepage
          </label>
        </div>
      </div>
    </form>
  );
}
