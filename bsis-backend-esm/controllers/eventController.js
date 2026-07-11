import Event from "../models/Event.js";
import slugify from "../utils/slugify.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/apiFeatures.js";

// GET /api/events (public: only published; ?upcoming=true, ?featured=true)
export const getEvents = asyncHandler(async (req, res) => {
  const query = { status: "published" };
  if (req.query.upcoming === "true") query.startDate = { $gte: new Date() };
  if (req.query.past === "true") query.startDate = { $lt: new Date() };
  if (req.query.featured === "true") query.isFeatured = true;

  const { items, pagination } = await paginate(Event, query, {
    ...req.query,
    sort: req.query.past === "true" ? "-startDate" : "startDate",
  });
  res.json({ success: true, events: items, pagination });
});

// GET /api/events/slug/:slug (public)
export const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, status: "published" });
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  res.json({ success: true, event });
});

// ---- Admin ----

// GET /api/events/admin (all, including drafts)
export const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const { items, pagination } = await paginate(Event, {}, req.query);
  res.json({ success: true, events: items, pagination });
});

// GET /api/events/:id
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  res.json({ success: true, event });
});

// POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  const body = { ...req.body, createdBy: req.user._id };
  if (body.slug) body.slug = slugify(body.slug);
  const event = await Event.create(body);
  res.status(201).json({ success: true, event });
});

// PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.slug) body.slug = slugify(body.slug);
  const event = await Event.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  res.json({ success: true, event });
});

// DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: "Event not found." });
  res.json({ success: true, message: "Event deleted." });
});
