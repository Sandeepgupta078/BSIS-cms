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
  "Board Members",
  "Patrons and Advisors",
  "National Councils",
  "State Committees",
  "International Councils",
  "other",
];
const emptyMember = {
  name: "",
  designation: "",
  photo: "",
  bio: "",
  category: "Board Members",
  email: "",
  linkedin: "",
  twitter: "",
  isActive: true,
};

export default function Team() {
  const toast = useToast();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // member object or emptyMember copy
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/team/admin");
      setTeam(
        (res.data.team || []).sort((a, b) => (a.order || 0) - (b.order || 0)),
      );
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
    if (!editing.name.trim() || !editing.designation.trim()) {
      return toast("Name and designation are required.", "error");
    }
    setBusy(true);
    try {
      if (editing._id) {
        const res = await api.put(`/api/team/${editing._id}`, editing);
        setTeam((t) =>
          t.map((m) => (m._id === editing._id ? res.data.member : m)),
        );
        toast("Member saved");
      } else {
        const res = await api.post("/api/team", {
          ...editing,
          order: team.length,
        });
        setTeam((t) => [...t, res.data.member]);
        toast("Member added");
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
      await api.delete(`/api/team/${toDelete._id}`);
      setTeam((t) => t.filter((m) => m._id !== toDelete._id));
      toast("Member deleted");
      setToDelete(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= team.length) return;
    const arr = [...team];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setTeam(arr);
    try {
      await api.patch("/api/team/reorder", {
        memberIds: arr.map((m) => m._id),
      });
    } catch (e) {
      toast(errMsg(e), "error");
      load();
    }
  };

  const visible = filter ? team.filter((m) => m.category === filter) : team;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Team</h1>
          <p>
            Leadership, advisors, core team and mentors shown on the website.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setEditing({ ...emptyMember })}
        >
          <Icon.plus /> Add member
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="seg">
            <button
              className={filter === "" ? "active" : ""}
              onClick={() => setFilter("")}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={filter === c ? "active" : ""}
                onClick={() => setFilter(c)}
              >
                {c.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No team members"
            sub="Add people to show them on the team page."
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Category</th>
                  <th>Contact</th>
                  <th>Active</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => {
                  const i = team.indexOf(m);
                  return (
                    <tr key={m._id}>
                      <td>
                        <div className="logo-cell">
                          {m.photo ? (
                            <img
                              className="thumb-sm"
                              style={{ borderRadius: "50%" }}
                              src={m.photo}
                              alt=""
                            />
                          ) : (
                            <div
                              className="avatar"
                              style={{
                                width: 44,
                                height: 44,
                                background: "var(--paper)",
                                color: "var(--muted)",
                              }}
                            >
                              {m.name?.[0]}
                            </div>
                          )}
                          <div>
                            <div className="row-title">{m.name}</div>
                            <div className="row-sub">{m.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue">
                          {m.category?.replace("-", " ")}
                        </span>
                      </td>
                      <td className="muted">{m.email || m.linkedin || "—"}</td>
                      <td>
                        {m.isActive ? (
                          <span className="badge badge-green">Yes</span>
                        ) : (
                          <span className="badge badge-gray">Hidden</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          {!filter && (
                            <>
                              <button
                                className="btn-icon"
                                title="Move up"
                                disabled={i === 0}
                                onClick={() => move(i, -1)}
                              >
                                <Icon.up />
                              </button>
                              <button
                                className="btn-icon"
                                title="Move down"
                                disabled={i === team.length - 1}
                                onClick={() => move(i, 1)}
                              >
                                <Icon.down />
                              </button>
                            </>
                          )}
                          <button
                            className="btn-icon"
                            title="Edit"
                            onClick={() => setEditing({ ...m })}
                          >
                            <Icon.edit />
                          </button>
                          <button
                            className="btn-icon"
                            title="Delete"
                            onClick={() => setToDelete(m)}
                          >
                            <Icon.trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal
          title={editing._id ? "Edit member" : "Add member"}
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
                {busy ? "Saving…" : "Save member"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input
                className="input"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Designation</label>
              <input
                className="input"
                value={editing.designation}
                onChange={(e) =>
                  setEditing({ ...editing, designation: e.target.value })
                }
                placeholder="President"
              />
            </div>
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
                    {c.replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                value={editing.email || ""}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>LinkedIn URL</label>
              <input
                className="input"
                value={editing.linkedin || ""}
                onChange={(e) =>
                  setEditing({ ...editing, linkedin: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Twitter / X URL</label>
              <input
                className="input"
                value={editing.twitter || ""}
                onChange={(e) =>
                  setEditing({ ...editing, twitter: e.target.value })
                }
              />
            </div>
          </div>
          <ImageField
            label="Photo"
            value={editing.photo}
            onChange={(v) => setEditing({ ...editing, photo: v })}
          />
          <div className="field">
            <label>Short bio</label>
            <textarea
              className="textarea"
              rows={3}
              value={editing.bio || ""}
              onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
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
          title="Delete member"
          message={`Remove "${toDelete.name}" from the team permanently?`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
