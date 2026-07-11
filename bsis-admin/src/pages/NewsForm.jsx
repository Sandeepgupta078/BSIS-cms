import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Spinner } from "../components/ui";
import { ImageField } from "../components/MediaPicker";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "General",
  tags: [],
  author: "BSIS",
  isFeatured: false,
  status: "draft",
  metaTitle: "",
  metaDescription: "",
};

export default function NewsForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(isNew ? empty : null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    if (isNew) return;
    api
      .get(`/api/news/${id}`)
      .then((res) => {
        setPost(res.data.post);
        setTagsText((res.data.post.tags || []).join(", "));
      })
      .catch((e) => {
        toast(errMsg(e), "error");
        navigate("/news");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (patch) => setPost((p) => ({ ...p, ...patch }));

  const save = async (e) => {
    e.preventDefault();
    if (!post.title.trim()) return toast("The post needs a title.", "error");
    setSaving(true);
    try {
      const body = {
        ...post,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (isNew) {
        await api.post("/api/news", body);
        toast("Post created");
      } else {
        await api.put(`/api/news/${id}`, body);
        toast("Post saved");
      }
      navigate("/news");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !post) return <Spinner />;

  return (
    <form onSubmit={save}>
      <div className="page-head">
        <div>
          <h1>{isNew ? "New post" : `Edit: ${post.title}`}</h1>
          <p>Published posts appear in the website's news section.</p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/news")}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Create post" : "Save changes"}</button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card card-pad">
          <div className="field">
            <label>Title</label>
            <input className="input" value={post.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div className="field">
            <label>Excerpt (shown on listing cards)</label>
            <textarea className="textarea" rows={2} value={post.excerpt || ""} onChange={(e) => set({ excerpt: e.target.value })} />
          </div>
          <div className="field">
            <label>Content (HTML allowed)</label>
            <textarea className="textarea code" rows={14} value={post.content || ""} onChange={(e) => set({ content: e.target.value })} />
          </div>
          <ImageField label="Cover image" value={post.coverImage} onChange={(v) => set({ coverImage: v })} />
        </div>

        <div>
          <div className="card card-pad mb-14">
            <div className="form-grid">
              <div className="field">
                <label>Category</label>
                <input className="input" value={post.category || ""} onChange={(e) => set({ category: e.target.value })} placeholder="General" />
              </div>
              <div className="field">
                <label>Author</label>
                <input className="input" value={post.author || ""} onChange={(e) => set({ author: e.target.value })} />
              </div>
              <div className="field">
                <label>Status</label>
                <select className="select" value={post.status} onChange={(e) => set({ status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="field">
                <label>Slug (optional)</label>
                <input className="input mono" value={post.slug || ""} onChange={(e) => set({ slug: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input className="input" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="startups, funding, uttar-pradesh" />
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={!!post.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} />
              Feature this post
            </label>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>SEO</h3>
            <div className="field">
              <label>Meta title</label>
              <input className="input" value={post.metaTitle || ""} onChange={(e) => set({ metaTitle: e.target.value })} />
            </div>
            <div className="field">
              <label>Meta description</label>
              <textarea className="textarea" rows={3} value={post.metaDescription || ""} onChange={(e) => set({ metaDescription: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
