import { useEffect, useState } from "react";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import {
  ConfirmDialog,
  EmptyState,
  Icon,
  Modal,
  Spinner,
} from "../components/ui";
import { ImageField } from "../components/MediaPicker";

const CATEGORIES = [
  "Government Partners",
  "Industry Association Partners",
  "Media Partners",
  "Strategic Partners",
  "other",
];
const emptyPartner = {
  name: "",
  logo: "",
  websiteUrl: "",
  category: "Government Partners",
  isActive: true,
  order: 0,
};

export default function Partners() {
  const toast = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/partners/admin");
      setPartners(res.data.partners || []);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  const save = async () => {
    if (!editing.name.trim())
      return toast("Partner name is required.", "error");
    if (!editing.logo) return toast("Add a logo — it's required.", "error");
    setBusy(true);
    try {
      if (editing._id) {
        const res = await api.put(`/api/partners/${editing._id}`, editing);
        setPartners((ps) =>
          ps.map((p) => (p._id === editing._id ? res.data.partner : p)),
        );
        toast("Partner saved");
      } else {
        const res = await api.post("/api/partners", editing);
        setPartners((ps) => [...ps, res.data.partner]);
        toast("Partner added");
      }
      setEditing(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/partners/${toDelete._id}`);
      setPartners((ps) => ps.filter((p) => p._id !== toDelete._id));
      toast("Partner deleted");
      setToDelete(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Partners</h1>
          <p>Logos shown in the website's partners and sponsors sections.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEditing({ ...emptyPartner })}
        >
          <Icon.plus /> Add partner
        </button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : partners.length === 0 ? (
          <EmptyState
            title="No partners yet"
            sub="Add partner logos to display them on the site."
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Category</th>
                  <th>Website</th>
                  <th>Active</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="logo-cell">
                        <img
                          className="thumb-sm"
                          style={{ objectFit: "contain", background: "#fff" }}
                          src={p.logo}
                          alt=""
                        />
                        <div className="row-title">{p.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{p.category}</span>
                    </td>
                    <td>
                      {p.websiteUrl ? (
                        <a href={p.websiteUrl} target="_blank" rel="noreferrer">
                          {p.websiteUrl
                            .replace(/^https?:\/\//, "")
                            .slice(0, 30)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {p.isActive ? (
                        <span className="badge badge-green">Yes</span>
                      ) : (
                        <span className="badge badge-gray">Hidden</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => setEditing({ ...p })}
                        >
                          <Icon.edit />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete"
                          onClick={() => setToDelete(p)}
                        >
                          <Icon.trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing._id ? "Edit partner" : "Add partner"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save partner"}
              </button>
            </>
          }
        >
          <div className="field">
            <label>Name</label>
            <input
              className="input"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </div>
          <ImageField
            label="Logo (required)"
            value={editing.logo}
            onChange={(v) => setEditing({ ...editing, logo: v })}
          />
          <div className="form-grid">
            <div className="field">
              <label>Category</label>
              <select
                className="select"
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Display order</label>
              <input
                type="number"
                className="input"
                value={editing.order || 0}
                onChange={(e) =>
                  setEditing({ ...editing, order: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="field">
            <label>Website URL</label>
            <input
              className="input"
              value={editing.websiteUrl || ""}
              onChange={(e) =>
                setEditing({ ...editing, websiteUrl: e.target.value })
              }
              placeholder="https://…"
            />
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={!!editing.isActive}
              onChange={(e) =>
                setEditing({ ...editing, isActive: e.target.checked })
              }
            />
            Visible on the website
          </label>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete partner"
          message={`Remove "${toDelete.name}" permanently?`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
