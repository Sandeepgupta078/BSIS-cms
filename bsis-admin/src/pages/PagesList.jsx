import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, Icon, Spinner, StatusBadge, fmtDateTime } from "../components/ui";

/* Pages are shown as a tree: sub-pages sit indented under their parent.
   Row actions: publish/unpublish · hide/show on site · edit · add sub-page · duplicate · delete */

function flatten(nodes, depth = 0, out = []) {
  for (const n of nodes) {
    out.push({ ...n, depth });
    if (n.children?.length) flatten(n.children, depth + 1, out);
  }
  return out;
}

export default function PagesList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/pages/tree");
      setTree(res.data.pages || []);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const rows = useMemo(() => {
    let flat = flatten(tree);
    if (status) flat = flat.filter((p) => p.status === status);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      flat = flat.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
    }
    return flat;
  }, [tree, status, search]);

  const patchRow = (id, patch) =>
    setTree((t) => {
      const update = (nodes) =>
        nodes.map((n) => ({
          ...n,
          ...(n._id === id ? patch : {}),
          children: n.children ? update(n.children) : [],
        }));
      return update(t);
    });

  const togglePublish = async (page) => {
    try {
      const res = await api.patch(`/api/pages/${page._id}/publish`);
      patchRow(page._id, { status: res.data.page.status });
      toast(res.data.page.status === "published" ? "Page published" : "Page moved to draft");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const toggleHide = async (page) => {
    try {
      const res = await api.patch(`/api/pages/${page._id}/hide`);
      patchRow(page._id, { isHidden: res.data.page.isHidden });
      toast(res.data.page.isHidden ? "Page hidden from the site" : "Page visible on the site");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const duplicate = async (page) => {
    try {
      const res = await api.post(`/api/pages/${page._id}/duplicate`);
      toast("Page duplicated as draft");
      navigate(`/pages/${res.data.page._id}`);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/pages/${toDelete._id}`);
      toast("Page deleted");
      setToDelete(null);
      load();
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
          <h1>Pages</h1>
          <p>Every page on the website — nest sub-pages inside pages, hide, publish and edit content.</p>
        </div>
        <Link to="/pages/new" className="btn btn-primary"><Icon.plus /> New page</Link>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="seg">
            {["", "published", "draft"].map((s) => (
              <button key={s} className={status === s ? "active" : ""} onClick={() => setStatus(s)}>
                {s === "" ? "All" : s === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
          <div className="search-box" style={{ marginLeft: "auto" }}>
            <Icon.search />
            <input className="input" placeholder="Search pages…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No pages found"
            sub="Create a page and start adding sections — hero, text, stats, FAQs and more."
            action={<Link to="/pages/new" className="btn btn-primary"><Icon.plus /> Create page</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Status</th>
                  <th>On site</th>
                  <th>Direction</th>
                  <th>Last updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p._id} className={p.isHidden ? "opacity-60" : ""}>
                    <td>
                      <div style={{ paddingLeft: p.depth * 26 }} className="flex items-start gap-2">
                        {p.depth > 0 && <span className="text-[var(--muted)] mt-0.5 select-none">↳</span>}
                        <div>
                          <Link to={`/pages/${p._id}`} className="row-title" style={{ color: "inherit" }}>
                            {p.title}{" "}
                            {p.isHomepage && (
                              <span className="badge badge-accent"><Icon.home style={{ width: 11, height: 11 }} /> Home</span>
                            )}
                            {p.isHidden && <span className="badge">Hidden</span>}
                          </Link>
                          <div className="row-sub mono">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.isHidden ? (
                        <span className="badge">Hidden</span>
                      ) : p.status === "published" ? (
                        <span className="badge badge-green">Live</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td><span className="badge badge-blue uppercase">{p.direction || "ltr"}</span></td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>
                      {fmtDateTime(p.updatedAt)}
                      {p.updatedBy?.name && <div className="row-sub">by {p.updatedBy.name}</div>}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon"
                          title={p.status === "published" ? "Unpublish (move to draft)" : "Publish"}
                          onClick={() => togglePublish(p)}
                        >
                          <Icon.globe />
                        </button>
                        <button
                          className="btn-icon"
                          title={p.isHidden ? "Show on site" : "Hide from site"}
                          onClick={() => toggleHide(p)}
                        >
                          {p.isHidden ? <Icon.eye /> : <Icon.eyeOff />}
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/pages/${p._id}`)}><Icon.edit /></button>
                        <button
                          className="btn-icon"
                          title="Add sub-page inside this page"
                          onClick={() => navigate(`/pages/new?parent=${p._id}`)}
                        >
                          <Icon.plus />
                        </button>
                        <button className="btn-icon" title="Duplicate" onClick={() => duplicate(p)}><Icon.copy /></button>
                        <button className="btn-icon" title="Delete" onClick={() => setToDelete(p)}><Icon.trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this page?"
          message={`"${toDelete.title}" and all its sections will be permanently removed. Sub-pages must be deleted or moved first.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
