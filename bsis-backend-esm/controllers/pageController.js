import Page from "../models/Page.js";
import slugify from "../utils/slugify.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ---------- PUBLIC ----------

// GET /api/pages/slug/:slug  -> the public site renders pages from this
export const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, status: "published", isHidden: false });
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  // Only send visible sections, sorted by order
  const pageObj = page.toObject();
  pageObj.sections = pageObj.sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  // Published, non-hidden sub-pages of this page (for sub-navigation on the site)
  pageObj.children = await Page.find({ parent: page._id, status: "published", isHidden: false })
    .select("title slug navOrder direction")
    .sort("navOrder title");

  res.json({ success: true, page: pageObj });
});

// GET /api/pages/home  -> homepage without knowing the slug
export const getHomepage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ isHomepage: true, status: "published", isHidden: false });
  if (!page) return res.status(404).json({ success: false, message: "Homepage not set." });
  const pageObj = page.toObject();
  pageObj.sections = pageObj.sections.filter((s) => s.isVisible).sort((a, b) => a.order - b.order);
  res.json({ success: true, page: pageObj });
});

// GET /api/pages/nav  -> published pages flagged for the navbar
export const getNavPages = asyncHandler(async (req, res) => {
  // Top-level nav pages with their nav-flagged sub-pages nested under them
  const pages = await Page.find({ status: "published", showInNav: true, isHidden: false, parent: null })
    .select("title slug navOrder")
    .sort("navOrder")
    .lean();
  const children = await Page.find({
    status: "published", showInNav: true, isHidden: false, parent: { $ne: null },
  })
    .select("title slug navOrder parent")
    .sort("navOrder")
    .lean();
  const byParent = {};
  children.forEach((c) => {
    const key = String(c.parent);
    (byParent[key] = byParent[key] || []).push(c);
  });
  pages.forEach((p) => { p.children = byParent[String(p._id)] || []; });
  res.json({ success: true, pages });
});

// ---------- ADMIN (protected) ----------

// GET /api/pages  -> list all (drafts included) for the CMS dashboard
export const getAllPages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };
  if (req.query.parent === "null") filter.parent = null;
  else if (req.query.parent) filter.parent = req.query.parent;

  const pages = await Page.find(filter)
    .select("title slug status isHomepage showInNav isHidden direction parent updatedAt")
    .populate("updatedBy", "name")
    .populate("parent", "title slug")
    .sort("-updatedAt");
  res.json({ success: true, count: pages.length, pages });
});

// GET /api/pages/:id  -> full page for the editor (includes draft sections)
export const getPageById = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });
  res.json({ success: true, page });
});

// POST /api/pages
export const createPage = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  body.slug = body.slug ? slugify(body.slug) : slugify(body.title || "");
  body.createdBy = req.user._id;
  body.updatedBy = req.user._id;
  if (body.parent) {
    const parent = await Page.findById(body.parent);
    if (!parent) return res.status(400).json({ success: false, message: "Parent page not found." });
  } else {
    body.parent = null;
  }
  const page = await Page.create(body);
  res.status(201).json({ success: true, page });
});

// PUT /api/pages/:id  -> the admin editor saves the whole page (sections array included)
export const updatePage = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.slug) body.slug = slugify(body.slug);
  body.updatedBy = req.user._id;
  delete body.createdBy;

  // Nested-page safety: a page cannot be its own parent or the child of its own descendant
  if (body.parent) {
    if (String(body.parent) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: "A page cannot be its own parent." });
    }
    let cursor = await Page.findById(body.parent).select("parent");
    if (!cursor) return res.status(400).json({ success: false, message: "Parent page not found." });
    while (cursor && cursor.parent) {
      if (String(cursor.parent) === String(req.params.id)) {
        return res.status(400).json({ success: false, message: "Cannot move a page inside one of its own sub-pages." });
      }
      cursor = await Page.findById(cursor.parent).select("parent");
    }
  } else if (body.parent === "" ) {
    body.parent = null;
  }

  const page = await Page.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  // keep the "single homepage" rule when updated via findByIdAndUpdate
  if (body.isHomepage) {
    await Page.updateMany({ _id: { $ne: page._id } }, { isHomepage: false });
  }
  res.json({ success: true, page });
});

// PATCH /api/pages/:id/sections/reorder  -> body: { sectionIds: ["id1","id2",...] }
export const reorderSections = asyncHandler(async (req, res) => {
  const { sectionIds } = req.body;
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });

  sectionIds.forEach((id, index) => {
    const section = page.sections.id(id);
    if (section) section.order = index;
  });
  page.updatedBy = req.user._id;
  await page.save();
  res.json({ success: true, page });
});

// PATCH /api/pages/:id/publish  -> toggle draft/published
export const togglePublish = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });
  page.status = page.status === "published" ? "draft" : "published";
  page.updatedBy = req.user._id;
  await page.save();
  res.json({ success: true, page });
});

// POST /api/pages/:id/duplicate
export const duplicatePage = asyncHandler(async (req, res) => {
  const original = await Page.findById(req.params.id);
  if (!original) return res.status(404).json({ success: false, message: "Page not found." });

  const copy = original.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.title = `${copy.title} (Copy)`;
  copy.slug = `${copy.slug}-copy-${Date.now()}`;
  copy.status = "draft";
  copy.isHomepage = false;
  copy.createdBy = req.user._id;
  copy.updatedBy = req.user._id;

  const page = await Page.create(copy);
  res.status(201).json({ success: true, page });
});

// DELETE /api/pages/:id
export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });
  if (page.isHomepage) {
    return res.status(400).json({ success: false, message: "Cannot delete the homepage. Set another page as homepage first." });
  }
  const childCount = await Page.countDocuments({ parent: page._id });
  if (childCount > 0) {
    return res.status(400).json({ success: false, message: `This page has ${childCount} sub-page(s). Delete or move them first.` });
  }
  await page.deleteOne();
  res.json({ success: true, message: "Page deleted." });
});

// PATCH /api/pages/:id/hide  -> toggle hidden on the public site (keeps its status)
export const toggleHide = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ success: false, message: "Page not found." });
  page.isHidden = !page.isHidden;
  page.updatedBy = req.user._id;
  await page.save();
  res.json({ success: true, page });
});

// GET /api/pages/tree  -> all pages (drafts + hidden included) as a nested tree for the CMS
export const getPagesTree = asyncHandler(async (req, res) => {
  const pages = await Page.find({})
    .select("title slug status isHomepage showInNav isHidden direction parent navOrder updatedAt")
    .populate("updatedBy", "name")
    .sort("navOrder title")
    .lean();

  const byId = {};
  pages.forEach((p) => { p.children = []; byId[String(p._id)] = p; });
  const roots = [];
  pages.forEach((p) => {
    const parentKey = p.parent ? String(p.parent) : null;
    if (parentKey && byId[parentKey]) byId[parentKey].children.push(p);
    else roots.push(p);
  });
  res.json({ success: true, count: pages.length, pages: roots });
});
