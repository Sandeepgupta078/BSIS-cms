import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Icon, Modal, Spinner, StatusBadge } from "../components/ui";
import { ImageField } from "../components/MediaPicker";
import { SECTION_TYPES, SectionForm, sectionSummary, typeMeta } from "../components/SectionForm";

const emptyPage = {
  title: "",
  slug: "",
  status: "draft",
  isHomepage: false,
  showInNav: false,
  navOrder: 0,
  parent: null,
  isHidden: false,
  direction: "ltr",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  sections: [],
};

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

export default function PageEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const parentFromQuery = params.get("parent");

  const [page, setPage] = useState(isNew ? { ...emptyPage, parent: parentFromQuery || null } : null);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openSection, setOpenSection] = useState(null); // section key currently expanded
  const [showAdd, setShowAdd] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  // Pages available as a parent (for "add page inside a page")
  useEffect(() => {
    api
      .get("/api/pages")
      .then((res) => setAllPages(res.data.pages || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) {
      setPage({ ...emptyPage, parent: parentFromQuery || null });
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/pages/${id}`)
      .then((res) => {
        const p = res.data.page;
        p.sections = [...(p.sections || [])].sort((a, b) => a.order - b.order);
        setPage(p);
      })
      .catch((e) => {
        toast(errMsg(e), "error");
        navigate("/pages");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (patch) => {
    setPage((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  const setSections = (sections) => set({ sections });

  const sectionKey = (s, i) => s._id || s._key || `idx-${i}`;

  /* ---------- Section operations ---------- */
  const addSection = (typeDef) => {
    const s = {
      _key: `new-${Date.now()}`,
      type: typeDef.type,
      isVisible: true,
      order: page.sections.length,
      data: JSON.parse(JSON.stringify(typeDef.data)),
    };
    setSections([...page.sections, s]);
    setShowAdd(false);
    setOpenSection(s._key);
  };

  const updateSection = (i, patch) =>
    setSections(page.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const removeSection = (i) => setSections(page.sections.filter((_, idx) => idx !== i));

  const moveSection = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= page.sections.length) return;
    const arr = [...page.sections];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSections(arr);
  };

  /* ---------- Save ---------- */
  const save = async () => {
    if (!page.title.trim()) return toast("Give the page a title first.", "error");
    setSaving(true);
    try {
      const body = {
        ...page,
        slug: page.slug || slugify(page.title),
        parent: page.parent ? (page.parent._id || page.parent) : null,
        sections: page.sections.map((s, i) => {
          const { _key, ...rest } = s;
          return { ...rest, order: i };
        }),
      };
      let res;
      if (isNew) {
        res = await api.post("/api/pages", body);
        toast("Page created");
        navigate(`/pages/${res.data.page._id}`, { replace: true });
      } else {
        res = await api.put(`/api/pages/${id}`, body);
        const p = res.data.page;
        p.sections = [...(p.sections || [])].sort((a, b) => a.order - b.order);
        setPage(p);
        toast("Page saved");
      }
      setDirty(false);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (isNew) return;
    try {
      const res = await api.patch(`/api/pages/${id}/publish`);
      set({ status: res.data.page.status });
      setDirty(false);
      toast(res.data.page.status === "published" ? "Page published" : "Moved to draft");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const publicUrl = useMemo(() => (page?.slug ? `/api/pages/slug/${page.slug}` : null), [page?.slug]);

  if (loading || !page) return <Spinner />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isNew ? "New page" : page.title || "Untitled page"}</h1>
          <p>
            {!isNew && <StatusBadge status={page.status} />}{" "}
            {page.slug && <span className="mono muted">/{page.slug}</span>}
            {dirty && <span className="badge badge-amber" style={{ marginLeft: 8 }}>Unsaved changes</span>}
          </p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => navigate("/pages")}>Back</button>
          {!isNew && (
            <button className="btn btn-dark" onClick={togglePublish}>
              {page.status === "published" ? <><Icon.eyeOff /> Unpublish</> : <><Icon.eye /> Publish</>}
            </button>
          )}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create page" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* ---------- Left: sections ---------- */}
        <div>
          {page.sections.length === 0 && (
            <div className="card card-pad" style={{ textAlign: "center", marginBottom: 12 }}>
              <h3 style={{ marginBottom: 6 }}>This page has no sections yet</h3>
              <p className="muted" style={{ margin: "0 0 6px" }}>
                A page is a stack of sections. Add a hero, some text, stats — in any order.
              </p>
            </div>
          )}

          {page.sections.map((s, i) => {
            const key = sectionKey(s, i);
            const meta = typeMeta(s.type);
            const open = openSection === key;
            return (
              <div key={key} className={`section-card ${s.isVisible === false ? "hidden-section" : ""}`}>
                <div className="section-head" onClick={() => setOpenSection(open ? null : key)}>
                  <span className="section-type-chip">{meta?.name || s.type}</span>
                  <span className="section-title-preview">{sectionSummary(s)}</span>
                  <div className="section-controls" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-icon mono"
                      style={{ width: "auto", padding: "0 8px", fontSize: 11, fontWeight: 700 }}
                      title={
                        (s.layout || "ltr") === "ltr"
                          ? "Layout: left → right (click for right → left)"
                          : "Layout: right → left (click for left → right)"
                      }
                      onClick={() => updateSection(i, { layout: (s.layout || "ltr") === "ltr" ? "rtl" : "ltr" })}
                    >
                      {(s.layout || "ltr").toUpperCase()}
                    </button>
                    <button className="btn-icon" title="Move up" disabled={i === 0} onClick={() => moveSection(i, -1)}><Icon.up /></button>
                    <button className="btn-icon" title="Move down" disabled={i === page.sections.length - 1} onClick={() => moveSection(i, 1)}><Icon.down /></button>
                    <button
                      className="btn-icon"
                      title={s.isVisible === false ? "Show section" : "Hide section"}
                      onClick={() => updateSection(i, { isVisible: s.isVisible === false })}
                    >
                      {s.isVisible === false ? <Icon.eyeOff /> : <Icon.eye />}
                    </button>
                    <button className="btn-icon" title="Delete section" onClick={() => removeSection(i)}><Icon.trash /></button>
                    <button className="btn-icon" title={open ? "Collapse" : "Edit"}>{open ? <Icon.up /> : <Icon.edit />}</button>
                  </div>
                </div>
                {open && (
                  <div className="section-body">
                    <SectionForm type={s.type} data={s.data} onChange={(data) => updateSection(i, { data })} />
                  </div>
                )}
              </div>
            );
          })}

          <button className="btn btn-ghost" style={{ width: "100%", padding: 12, borderStyle: "dashed" }} onClick={() => setShowAdd(true)}>
            <Icon.plus /> Add section
          </button>
        </div>

        {/* ---------- Right: page settings ---------- */}
        <div className="editor-side">
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Page settings</h3>
            <div className="field">
              <label>Title</label>
              <input
                className="input"
                value={page.title}
                onChange={(e) => {
                  const title = e.target.value;
                  set(slugTouched ? { title } : { title, slug: slugify(title) });
                }}
                placeholder="About us"
              />
            </div>
            <div className="field">
              <label>Slug (URL)</label>
              <input
                className="input mono"
                value={page.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: slugify(e.target.value) });
                }}
                placeholder="about-us"
              />
              {publicUrl && <div className="hint">Public API: GET {publicUrl}</div>}
            </div>
            <div className="field">
              <label>Parent page (nest inside)</label>
              <select
                className="input"
                value={page.parent ? (page.parent._id || page.parent) : ""}
                onChange={(e) => set({ parent: e.target.value || null })}
              >
                <option value="">— None (top-level page) —</option>
                {allPages
                  .filter((p) => p._id !== id)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.parent ? "↳ " : ""}{p.title} (/{p.slug})
                    </option>
                  ))}
              </select>
              <div className="hint">Sub-pages appear nested under their parent in the Pages list and site navigation.</div>
            </div>
            <div className="field">
              <label>Content direction</label>
              <div className="seg">
                {["ltr", "rtl"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={(page.direction || "ltr") === d ? "active" : ""}
                    onClick={() => set({ direction: d })}
                  >
                    {d === "ltr" ? "Left → Right" : "Right → Left"}
                  </button>
                ))}
              </div>
              <div className="hint">How this page's content flows on the website.</div>
            </div>
            <label className="checkbox-row field">
              <input type="checkbox" checked={!!page.isHidden} onChange={(e) => set({ isHidden: e.target.checked })} />
              Hide from the website (keeps its published status)
            </label>
            <label className="checkbox-row field">
              <input type="checkbox" checked={!!page.isHomepage} onChange={(e) => set({ isHomepage: e.target.checked })} />
              Set as homepage
            </label>
            <label className="checkbox-row field">
              <input type="checkbox" checked={!!page.showInNav} onChange={(e) => set({ showInNav: e.target.checked })} />
              Show in navbar
            </label>
            {page.showInNav && (
              <div className="field">
                <label>Navbar order</label>
                <input type="number" className="input" value={page.navOrder || 0} onChange={(e) => set({ navOrder: Number(e.target.value) })} />
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>SEO</h3>
            <div className="field">
              <label>Meta title</label>
              <input className="input" value={page.metaTitle || ""} onChange={(e) => set({ metaTitle: e.target.value })} />
            </div>
            <div className="field">
              <label>Meta description</label>
              <textarea className="textarea" rows={3} value={page.metaDescription || ""} onChange={(e) => set({ metaDescription: e.target.value })} />
            </div>
            <ImageField label="Social share image" value={page.ogImage} onChange={(v) => set({ ogImage: v })} />
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add a section" onClose={() => setShowAdd(false)} wide>
          <div className="add-section-grid">
            {SECTION_TYPES.map((t) => (
              <button key={t.type} className="add-section-btn" onClick={() => addSection(t)}>
                <div className="t">{t.name}</div>
                <div className="d">{t.desc}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
