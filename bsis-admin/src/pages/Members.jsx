import { useEffect, useState } from "react";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import {
  ConfirmDialog,
  EmptyState,
  Icon,
  Modal,
  Pagination,
  Spinner,
  fmtDate,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

const fullName = (m) => [m.firstName, m.lastName].filter(Boolean).join(" ") || "—";

const TENANT_LABELS = { bsis: "BSIS", startuptalks: "StartupTalks", bsf: "BSF" };

export default function Members() {
  const toast = useToast();
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [search, setSearch] = useState(""); // debounced value actually sent
  const [category, setCategory] = useState("");
  const [tenant, setTenant] = useState("");
  const [verified, setVerified] = useState("");

  // Modals
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const loadStats = async () => {
    try {
      const res = await api.get("/api/members/stats");
      setStats(res.data.stats);
    } catch {
      /* stats are non-critical */
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/members", {
        params: {
          page,
          limit: 20,
          q: search || undefined,
          category: category || undefined,
          tenant: tenant || undefined,
          verified: verified || undefined,
        },
      });
      setMembers(res.data.members || []);
      setPagination(res.data.pagination);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, search, category, tenant, verified]);

  const toggleVerify = async (m) => {
    try {
      const res = await api.patch(`/api/members/${m._id}/verify`, {
        isVerified: !m.isVerified,
      });
      setMembers((ms) => ms.map((x) => (x._id === m._id ? res.data.member : x)));
      toast(res.data.member.isVerified ? "Member verified" : "Member marked unverified");
      loadStats();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const save = async () => {
    if (!editing.firstName?.trim()) return toast("First name is required.", "error");
    setBusy(true);
    try {
      const res = await api.put(`/api/members/${editing._id}`, {
        firstName: editing.firstName,
        lastName: editing.lastName,
        contactNumber: editing.contactNumber,
        organisationName: editing.organisationName,
        memberCategory: editing.memberCategory,
        designation: editing.designation,
        city: editing.city,
        website: editing.website,
        tenant: editing.tenant,
        isVerified: editing.isVerified,
      });
      setMembers((ms) => ms.map((m) => (m._id === editing._id ? res.data.member : m)));
      toast("Member updated");
      setEditing(null);
      loadStats();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/members/${toDelete._id}`);
      setMembers((ms) => ms.filter((m) => m._id !== toDelete._id));
      toast("Member deleted");
      setToDelete(null);
      loadStats();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setTenant("");
    setVerified("");
    setPage(1);
  };

  const hasFilters = q || category || tenant || verified;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Members</h1>
          <p>People registered through the member portal. Verify accounts, update profiles, and keep the directory clean.</p>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-icon" style={{ color: "var(--blue)", background: "var(--blue-soft)" }}><Icon.users /></div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total members</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon" style={{ color: "var(--green)", background: "var(--green-soft)" }}><Icon.check /></div>
            <div>
              <div className="stat-value">{stats.verified}</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon" style={{ color: "var(--amber)", background: "var(--amber-soft)" }}><Icon.key /></div>
            <div>
              <div className="stat-value">{stats.unverified}</div>
              <div className="stat-label">Pending verification</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <input
            className="input"
            style={{ width: 240 }}
            placeholder="Search name, email, organisation…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" style={{ width: 180 }} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {(stats?.categories || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" style={{ width: 150 }} value={tenant} onChange={(e) => { setTenant(e.target.value); setPage(1); }}>
            <option value="">All platforms</option>
            {(stats?.tenants || []).map((t) => <option key={t} value={t}>{TENANT_LABELS[t] || t}</option>)}
          </select>
          <select className="input" style={{ width: 150 }} value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}><Icon.x /> Clear</button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : members.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No members match your filters" : "No members yet"}
            sub={hasFilters ? "Try adjusting or clearing the filters above." : "Members appear here as soon as they register through the member portal."}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Organisation</th>
                    <th>Category</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div className="row-title">{fullName(m)}</div>
                        <div className="row-sub">{m.email}</div>
                      </td>
                      <td>
                        <div className="row-title" style={{ fontWeight: 500 }}>{m.organisationName || "—"}</div>
                        <div className="row-sub">{[m.designation, m.city].filter(Boolean).join(" · ")}</div>
                      </td>
                      <td><span className="badge badge-blue">{m.memberCategory || "—"}</span></td>
                      <td className="muted">{TENANT_LABELS[m.tenant] || m.tenant || "—"}</td>
                      <td>
                        {m.isVerified
                          ? <span className="badge badge-green">Verified</span>
                          : <span className="badge">Unverified</span>}
                      </td>
                      <td className="muted">{fmtDate(m.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-icon" title="View details" onClick={() => setViewing(m)}><Icon.eye /></button>
                          <button
                            className="btn-icon"
                            title={m.isVerified ? "Mark as unverified" : "Mark as verified"}
                            onClick={() => toggleVerify(m)}
                          >
                            <Icon.check />
                          </button>
                          <button className="btn-icon" title="Edit" onClick={() => setEditing({ ...m })}><Icon.edit /></button>
                          {isAdmin && (
                            <button className="btn-icon" title="Delete" onClick={() => setToDelete(m)}><Icon.trash /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} />
          </>
        )}
      </div>

      {/* ---- View details ---- */}
      {viewing && (
        <Modal title={fullName(viewing)} onClose={() => setViewing(null)}>
          <div className="form-grid">
            <div className="field"><label>Email</label><div>{viewing.email || "—"}</div></div>
            <div className="field"><label>Contact number</label><div>{viewing.contactNumber || "—"}</div></div>
            <div className="field"><label>Organisation</label><div>{viewing.organisationName || "—"}</div></div>
            <div className="field"><label>Designation</label><div>{viewing.designation || "—"}</div></div>
            <div className="field"><label>Member category</label><div>{viewing.memberCategory || "—"}</div></div>
            <div className="field"><label>City</label><div>{viewing.city || "—"}</div></div>
            <div className="field">
              <label>Website</label>
              <div>
                {viewing.website
                  ? <a href={viewing.website} target="_blank" rel="noreferrer">{viewing.website}</a>
                  : "—"}
              </div>
            </div>
            <div className="field"><label>Platform</label><div>{TENANT_LABELS[viewing.tenant] || viewing.tenant || "—"}</div></div>
            <div className="field">
              <label>Status</label>
              <div>{viewing.isVerified ? <span className="badge badge-green">Verified</span> : <span className="badge">Unverified</span>}</div>
            </div>
            <div className="field"><label>Joined</label><div>{fmtDate(viewing.createdAt)}</div></div>
          </div>
        </Modal>
      )}

      {/* ---- Edit ---- */}
      {editing && (
        <Modal
          title="Edit member"
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="field">
              <label>First name</label>
              <input className="input" value={editing.firstName || ""} onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} />
            </div>
            <div className="field">
              <label>Last name</label>
              <input className="input" value={editing.lastName || ""} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} />
            </div>
            <div className="field span-2">
              <label>Email</label>
              <input className="input" value={editing.email || ""} disabled />
              <div className="hint">Email is managed by the member sign-in system and can't be changed here.</div>
            </div>
            <div className="field">
              <label>Contact number</label>
              <input className="input" value={editing.contactNumber || ""} onChange={(e) => setEditing({ ...editing, contactNumber: e.target.value })} />
            </div>
            <div className="field">
              <label>City</label>
              <input className="input" value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
            </div>
            <div className="field">
              <label>Organisation</label>
              <input className="input" value={editing.organisationName || ""} onChange={(e) => setEditing({ ...editing, organisationName: e.target.value })} />
            </div>
            <div className="field">
              <label>Designation</label>
              <input className="input" value={editing.designation || ""} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} />
            </div>
            <div className="field">
              <label>Member category</label>
              <input className="input" list="member-categories" value={editing.memberCategory || ""} onChange={(e) => setEditing({ ...editing, memberCategory: e.target.value })} />
              <datalist id="member-categories">
                {(stats?.categories || []).map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="field">
              <label>Platform</label>
              <select className="input" value={editing.tenant || "bsis"} onChange={(e) => setEditing({ ...editing, tenant: e.target.value })}>
                <option value="bsis">BSIS</option>
                <option value="startuptalks">StartupTalks</option>
                <option value="bsf">BSF</option>
              </select>
            </div>
            <div className="field span-2">
              <label>Website</label>
              <input className="input" value={editing.website || ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="https://…" />
            </div>
            <div className="field span-2">
              <label className="checkbox-row">
                <input type="checkbox" checked={!!editing.isVerified} onChange={(e) => setEditing({ ...editing, isVerified: e.target.checked })} />
                <span>Verified member (can sign in to the member portal)</span>
              </label>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Delete ---- */}
      {toDelete && (
        <ConfirmDialog
          title="Delete member?"
          message={`This permanently removes ${fullName(toDelete)} (${toDelete.email}) and they will no longer be able to sign in. This cannot be undone.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
