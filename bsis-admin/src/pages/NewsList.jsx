import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, Icon, Pagination, Spinner, StatusBadge, fmtDate } from "../components/ui";

export default function NewsList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/news/admin", { params: { page, limit: 20 } });
      setPosts(res.data.posts || []);
      setPagination(res.data.pagination);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/news/${toDelete._id}`);
      setPosts((ps) => ps.filter((p) => p._id !== toDelete._id));
      toast("Post deleted");
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
          <h1>News &amp; updates</h1>
          <p>Announcements, stories and press for the website's news section.</p>
        </div>
        <Link to="/news/new" className="btn btn-primary"><Icon.plus /> New post</Link>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            sub="Write your first news post and publish it."
            action={<Link to="/news/new" className="btn btn-primary"><Icon.plus /> Write post</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="logo-cell">
                        {p.coverImage && <img className="thumb-sm" src={p.coverImage} alt="" />}
                        <div>
                          <Link to={`/news/${p._id}`} className="row-title" style={{ color: "inherit" }}>
                            {p.title} {p.isFeatured && <span className="badge badge-accent">Featured</span>}
                          </Link>
                          <div className="row-sub">{p.excerpt?.slice(0, 70)}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td>{p.author}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(p.publishedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/news/${p._id}`)}><Icon.edit /></button>
                        <button className="btn-icon" title="Delete" onClick={() => setToDelete(p)}><Icon.trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPage} />
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete post"
          message={`Delete "${toDelete.title}" permanently?`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
