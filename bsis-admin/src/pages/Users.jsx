import { useEffect, useState } from "react";
import api, { errMsg } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, Icon, Modal, Spinner, fmtDate } from "../components/ui";

const emptyUser = { name: "", email: "", password: "", role: "editor", isActive: true };

export default function Users() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // user object; no _id => creating
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/users");
      setUsers(res.data.users || []);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const save = async () => {
    if (!editing.name.trim()) return toast("Name is required.", "error");
    if (!editing._id && !editing.email.trim()) return toast("Email is required.", "error");
    if (!editing._id && (editing.password || "").length < 8) return toast("Password must be at least 8 characters.", "error");
    setBusy(true);
    try {
      if (editing._id) {
        const res = await api.put(`/api/auth/users/${editing._id}`, {
          name: editing.name,
          role: editing.role,
          isActive: editing.isActive,
        });
        setUsers((us) => us.map((u) => (u._id === editing._id ? res.data.user : u)));
        toast("User updated");
      } else {
        const res = await api.post("/api/auth/users", editing);
        setUsers((us) => [res.data.user, ...us]);
        toast("User created");
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
      await api.delete(`/api/auth/users/${toDelete._id}`);
      setUsers((us) => us.filter((u) => u._id !== toDelete._id));
      toast("User deleted");
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
          <h1>Users</h1>
          <p>People who can sign in to this CMS. Editors manage content; admins also manage users.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyUser })}><Icon.plus /> Add user</button>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState title="No users" sub="Add editors or admins so your team can manage the site." />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="row-title">
                        {u.name} {u._id === me?._id && <span className="badge badge-blue">You</span>}
                      </div>
                      <div className="row-sub">{u.email}</div>
                    </td>
                    <td><span className={`badge ${u.role === "admin" ? "badge-accent" : "badge-blue"}`}>{u.role}</span></td>
                    <td>{u.isActive ? <span className="badge badge-green">Active</span> : <span className="badge">Deactivated</span>}</td>
                    <td className="muted">{fmtDate(u.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" title="Edit" onClick={() => setEditing({ ...u })}><Icon.edit /></button>
                        <button
                          className="btn-icon"
                          title={u._id === me?._id ? "You cannot delete your own account" : "Delete"}
                          disabled={u._id === me?._id}
                          onClick={() => setToDelete(u)}
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
          title={editing._id ? "Edit user" : "Add user"}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </>
          }
        >
          <div className="field">
            <label>Name</label>
            <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </div>
          {!editing._id && (
            <>
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Password (min 8 characters)</label>
                <input className="input" type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
              </div>
            </>
          )}
          <div className="field">
            <label>Role</label>
            <select className="input" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
              <option value="editor">Editor — manages pages, media & content</option>
              <option value="admin">Admin — everything, including users</option>
            </select>
          </div>
          {editing._id && (
            <label className="checkbox-row field">
              <input
                type="checkbox"
                checked={!!editing.isActive}
                disabled={editing._id === me?._id}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              Active (unchecking blocks sign-in)
            </label>
          )}
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this user?"
          message={`${toDelete.name} (${toDelete.email}) will lose access permanently.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
