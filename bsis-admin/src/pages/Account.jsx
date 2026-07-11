import { useState } from "react";
import api, { errMsg } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Icon } from "../components/ui";

export default function Account() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const changePassword = async () => {
    if (form.newPassword.length < 8) return toast("New password must be at least 8 characters.", "error");
    if (form.newPassword !== form.confirm) return toast("New passwords do not match.", "error");
    setBusy(true);
    try {
      const res = await api.put("/api/auth/update-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      // Backend issues a fresh token after a password change — keep the session alive
      if (res.data.token) localStorage.setItem("bsis_token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("bsis_user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password updated");
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
          <h1>My account</h1>
          <p>Your sign-in details for this CMS.</p>
        </div>
      </div>

      <div className="editor-layout">
        <div className="card card-pad">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}><Icon.key style={{ width: 15, height: 15, verticalAlign: "-2px" }} /> Change password</h3>
          <div className="field">
            <label>Current password</label>
            <input
              className="input"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <div className="field">
            <label>New password (min 8 characters)</label>
            <input
              className="input"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input
              className="input"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" onClick={changePassword} disabled={busy || !form.currentPassword || !form.newPassword}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </div>

        <div className="editor-side">
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Profile</h3>
            <div className="field">
              <label>Name</label>
              <div className="row-title">{user?.name}</div>
            </div>
            <div className="field">
              <label>Email</label>
              <div className="mono" style={{ fontSize: 13 }}>{user?.email}</div>
            </div>
            <div className="field">
              <label>Role</label>
              <span className={`badge ${user?.role === "admin" ? "badge-accent" : "badge-blue"}`}>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
