import { useEffect, useRef, useState } from "react";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Icon, Modal, Spinner, fmtBytes } from "./ui";

/* Modal: browse the media library or upload a new file, then pick one URL. */
export function MediaPicker({ onSelect, onClose }) {
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/media", { params: { limit: 60, search: search || undefined } });
      setMedia(res.data.media || []);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/api/media/upload", fd);
      toast("Uploaded");
      onSelect(res.data.media.url);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title="Choose an image" onClose={onClose} wide>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="search-box" style={{ flex: 1 }}>
          <Icon.search />
          <input
            className="input"
            style={{ width: "100%" }}
            placeholder="Search media…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Icon.upload /> {uploading ? "Uploading…" : "Upload new"}
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.mp4" hidden onChange={(e) => upload(e.target.files[0])} />
      </div>

      {loading ? (
        <Spinner />
      ) : media.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: 30 }}>
          No media yet. Upload your first file above.
        </p>
      ) : (
        <div className="media-grid">
          {media.map((m) => (
            <div key={m._id} className="media-item" onClick={() => onSelect(m.url)} title={m.originalName}>
              <div className="media-thumb">
                {m.resourceType === "image" ? <img src={m.url} alt={m.altText || m.originalName} loading="lazy" /> : <Icon.pages style={{ width: 30, height: 30, color: "#b9c3d6" }} />}
              </div>
              <div className="media-meta">
                <div className="media-name">{m.originalName || m.publicId}</div>
                <div className="media-size">{m.format?.toUpperCase()} · {fmtBytes(m.bytes)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* Text input + "Browse" button + thumbnail preview, for any image URL field. */
export function ImageField({ label = "Image", value, onChange, hint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div className="img-input">
        {value ? <img className="img-preview" src={value} alt="" /> : null}
        <input className="input" placeholder="https://… or browse the library" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
          <Icon.media /> Browse
        </button>
      </div>
      {hint && <div className="hint">{hint}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
