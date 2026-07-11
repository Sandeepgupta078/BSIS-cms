import TeamMember from "../models/TeamMember.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/team (public; ?category=leadership)
export const getTeam = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  const team = await TeamMember.find(query).sort("category order name");
  res.json({ success: true, team });
});

// ---- Admin ----

export const getAllTeamAdmin = asyncHandler(async (req, res) => {
  const team = await TeamMember.find().sort("category order name");
  res.json({ success: true, team });
});

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: "Team member not found." });
  res.json({ success: true, member });
});

export const createMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.create(req.body);
  res.status(201).json({ success: true, member });
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!member) return res.status(404).json({ success: false, message: "Team member not found." });
  res.json({ success: true, member });
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: "Team member not found." });
  res.json({ success: true, message: "Team member deleted." });
});

// PATCH /api/team/reorder  body: { memberIds: ["id1","id2",...] }
export const reorderTeam = asyncHandler(async (req, res) => {
  const { memberIds } = req.body;
  await Promise.all(
    memberIds.map((id, index) => TeamMember.findByIdAndUpdate(id, { order: index }))
  );
  res.json({ success: true, message: "Order updated." });
});
