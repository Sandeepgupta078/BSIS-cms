import NewsPost from "../models/NewsPost.js";
import slugify from "../utils/slugify.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/apiFeatures.js";

// GET /api/news (public; ?category=, ?tag=, ?featured=true)
export const getPosts = asyncHandler(async (req, res) => {
  const query = { status: "published" };
  if (req.query.category) query.category = req.query.category;
  if (req.query.tag) query.tags = req.query.tag;
  if (req.query.featured === "true") query.isFeatured = true;
  if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };

  const { items, pagination } = await paginate(NewsPost, query, { ...req.query, sort: "-publishedAt" });
  res.json({ success: true, posts: items, pagination });
});

// GET /api/news/slug/:slug (public)
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await NewsPost.findOne({ slug: req.params.slug, status: "published" });
  if (!post) return res.status(404).json({ success: false, message: "Post not found." });
  res.json({ success: true, post });
});

// ---- Admin ----

export const getAllPostsAdmin = asyncHandler(async (req, res) => {
  const { items, pagination } = await paginate(NewsPost, {}, req.query);
  res.json({ success: true, posts: items, pagination });
});

export const getPostById = asyncHandler(async (req, res) => {
  const post = await NewsPost.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found." });
  res.json({ success: true, post });
});

export const createPost = asyncHandler(async (req, res) => {
  const body = { ...req.body, createdBy: req.user._id };
  if (body.slug) body.slug = slugify(body.slug);
  const post = await NewsPost.create(body);
  res.status(201).json({ success: true, post });
});

export const updatePost = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.slug) body.slug = slugify(body.slug);
  if (body.status === "published") {
    const existing = await NewsPost.findById(req.params.id).select("publishedAt");
    if (existing && !existing.publishedAt) body.publishedAt = new Date();
  }
  const post = await NewsPost.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ success: false, message: "Post not found." });
  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await NewsPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found." });
  res.json({ success: true, message: "Post deleted." });
});
