import ContactSubmission from "../models/ContactSubmission.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/apiFeatures.js";

// POST /api/contact (public - the website's contact form posts here)
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  await ContactSubmission.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, message: "Thank you! Your message has been received." });
});

// ---- Admin ----

// GET /api/contact?unread=true
export const getSubmissions = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.unread === "true") query.isRead = false;
  const { items, pagination } = await paginate(ContactSubmission, query, req.query);
  res.json({ success: true, submissions: items, pagination });
});

// PATCH /api/contact/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const submission = await ContactSubmission.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found." });
  res.json({ success: true, submission });
});

// DELETE /api/contact/:id
export const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
  if (!submission) return res.status(404).json({ success: false, message: "Submission not found." });
  res.json({ success: true, message: "Submission deleted." });
});
