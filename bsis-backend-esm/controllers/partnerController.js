import Partner from "../models/Partner.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/partners (public; ?category=sponsor)
export const getPartners = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  const partners = await Partner.find(query).sort("order name");
  res.json({ success: true, partners });
});

// ---- Admin ----

export const getAllPartnersAdmin = asyncHandler(async (req, res) => {
  const partners = await Partner.find().sort("category order name");
  res.json({ success: true, partners });
});

export const createPartner = asyncHandler(async (req, res) => {
  const partner = await Partner.create(req.body);
  res.status(201).json({ success: true, partner });
});

export const updatePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!partner) return res.status(404).json({ success: false, message: "Partner not found." });
  res.json({ success: true, partner });
});

export const deletePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);
  if (!partner) return res.status(404).json({ success: false, message: "Partner not found." });
  res.json({ success: true, message: "Partner deleted." });
});
