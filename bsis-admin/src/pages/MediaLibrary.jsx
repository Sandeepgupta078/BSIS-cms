import { useEffect, useRef, useState } from "react";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, Icon, Modal, Pagination, Spinner, fmtBytes, fmtDate } from "../components/ui";

export default function MediaLibrary() {
  const toast = useToast();
  const [media, setMedia] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/media", { params: { page, limit: 24, search: search || undefined } });
      setMedia(res.data.media || []);
      setPagination(res.data.pagination);
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
  }, [page, search]);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      if (files.length === 1) {
        const fd = new FormData();
        fd.append("file", files[0]);
        await api.post("/api/media/upload", fd);
      } else {
        const fd = new FormData();
        [...files].slice(0, 10).forEach((f) => fd.append("files", f));
        await api.post("/api/media/upload-multiple", fd);
      }
      toast(`Uploaded ${Math.min(files.length, 10)} file(s)`);
      setPage(1);
      load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setUploading(false);
    }
  };

  const saveAlt = async () => {
    setBusy(true);
    try {
      const res = await api.put(`/api/media/${selected._id}`, { altText: selected.altText });
      setMedia((ms) => ms.map((m) => (m._id === selected._id ? res.data.media : m)));
      toast("Alt text saved");
      setSelected(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/media/${toDelete._id}`);
      setMedia((ms) => ms.filter((m) => m._id !== toDelete._id));
      toast("Media deleted");
      setToDelete(null);
      setSelected(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url).then(
      () => toast("URL copied"),
      () => toast("Couldn't copy — select it manually.", "error")
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Media library</h1>
          <p>Images and files stored on Cloudinary. Use them anywhere on the site.</p>
        </div>
        <div className="head-actions">
          <div className="search-box">
            <Icon.search />
            <input className="input" placeholder="Search by name…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          </div>
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Icon.upload /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <input ref={fileRef} type="file" multiple hidden accept="image/*,.pdf,.mp4" onChange={(e) => upload(e.target.files)} />
        </div>
      </div>

      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
      >
        <Icon.upload style={{ width: 22, height: 22 }} />
        <div style={{ marginTop: 6, fontWeight: 600 }}>Drop files here or click to upload</div>
        <div style={{ fontSize: 12 }}>Images, PDF or MP4 · up to 10 MB each · 10 files at a time</div>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : media.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: 40 }}>No media yet. Upload your first files above.</p>
        ) : (
          <div style={{ padding: 16 }}>
            <div className="media-grid">
              {media.map((m) => (
                <div key={m._id} className="media-item" onClick={() => setSelected({ ...m })}>
                  <div className="media-thumb">
                    {m.resourceType === "image" ? (
                      <img src={m.url} alt={m.altText || m.originalName} loading="lazy" />
                    ) : (
                      <Icon.pages style={{ width: 30, height: 30, color: "#b9c3d6" }} />
                    )}
                  </div>
                  <div className="media-meta">
                    <div className="media-name">{m.originalName || m.publicId}</div>
                    <div className="media-size">{m.format?.toUpperCase()} · {fmtBytes(m.bytes)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPage} />
      </div>

      {selected && (
        <Modal
          title="Media details"
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn-danger" onClick={() => setToDelete(selected)}><Icon.trash /> Delete</button>
              <button className="btn btn-ghost" onClick={() => copyUrl(selected.url)}><Icon.copy /> Copy URL</button>
              <button className="btn btn-primary" onClick={saveAlt} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </>
          }
        >
          {selected.resourceType === "image" && (
            <img src={selected.url} alt={selected.altText || ""} style={{ borderRadius: 10, marginBottom: 14, maxHeight: 260, objectFit: "contain", width: "100%", background: "var(--paper)" }} />
          )}
          <div className="field">
            <label>File</label>
            <div className="mono" style={{ wordBreak: "break-all" }}>{selected.url}</div>
            <div className="hint">
              {selected.width ? `${selected.width}×${selected.height} · ` : ""}
              {fmtBytes(selected.bytes)} · uploaded {fmtDate(selected.createdAt)}
            </div>
          </div>
          <div className="field">
            <label>Alt text (for accessibility & SEO)</label>
            <input className="input" value={selected.altText || ""} onChange={(e) => setSelected({ ...selected, altText: e.target.value })} placeholder="Describe the image" />
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete media"
          message={`Delete "${toDelete.originalName || toDelete.publicId}"? It will also be removed from Cloudinary. Pages already using this URL will show a broken image.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
