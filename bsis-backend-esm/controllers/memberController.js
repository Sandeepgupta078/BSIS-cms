import Member from "../models/Member.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * Members and CMS staff share the `users` collection (both backends use the
 * same database). Only documents created by the auth backend carry
 * `memberCategory`, so this filter is applied to EVERY query to keep CMS
 * admin/editor accounts out of the members list.
 */
const MEMBER_FILTER = { memberCategory: { $exists: true, $ne: null } };

// Fields that must never leave the API
const SAFE_FIELDS = "-password -emailVerificationToken -emailVerificationExpires";

// Profile fields the CMS is allowed to edit (never password/email tokens)
const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "contactNumber",
  "organisationName",
  "memberCategory",
  "designation",
  "city",
  "website",
  "tenant",
  "isVerified",
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/members?q=&category=&tenant=&verified=&page=&limit=&sort=
export const getMembers = asyncHandler(async (req, res) => {
  const query = { ...MEMBER_FILTER };

  const { q, category, tenant, verified } = req.query;

  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    query.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { organisationName: rx },
      { city: rx },
      { designation: rx },
    ];
  }
  if (category) query.memberCategory = category;
  if (tenant) query.tenant = tenant;
  if (verified === "true") query.isVerified = true;
  if (verified === "false") query.isVerified = { $ne: true };

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";

  const [members, total] = await Promise.all([
    Member.find(query).select(SAFE_FIELDS).sort(sort).skip(skip).limit(limit),
    Member.countDocuments(query),
  ]);

  res.json({
    success: true,
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

// GET /api/members/stats  (totals + filter options for the dashboard)
export const getMemberStats = asyncHandler(async (req, res) => {
  const [total, verified, categories, tenants, recent] = await Promise.all([
    Member.countDocuments(MEMBER_FILTER),
    Member.countDocuments({ ...MEMBER_FILTER, isVerified: true }),
    Member.distinct("memberCategory", MEMBER_FILTER),
    Member.distinct("tenant", MEMBER_FILTER),
    Member.find(MEMBER_FILTER).select(SAFE_FIELDS).sort("-createdAt").limit(5),
  ]);

  res.json({
    success: true,
    stats: {
      total,
      verified,
      unverified: total - verified,
      categories: categories.filter(Boolean).sort(),
      tenants: tenants.filter(Boolean).sort(),
    },
    recent,
  });
});

// GET /api/members/:id
export const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({
    _id: req.params.id,
    ...MEMBER_FILTER,
  }).select(SAFE_FIELDS);
  if (!member)
    return res.status(404).json({ success: false, message: "Member not found." });
  res.json({ success: true, member });
});

// PUT /api/members/:id  (edit profile fields — never credentials)
export const updateMember = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of EDITABLE_FIELDS) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, ...MEMBER_FILTER },
    { $set: updates },
    { new: true, runValidators: true }
  ).select(SAFE_FIELDS);

  if (!member)
    return res.status(404).json({ success: false, message: "Member not found." });
  res.json({ success: true, member });
});

// PATCH /api/members/:id/verify  { isVerified: true|false }
export const setMemberVerified = asyncHandler(async (req, res) => {
  const isVerified = !!req.body.isVerified;
  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, ...MEMBER_FILTER },
    { $set: { isVerified } },
    { new: true }
  ).select(SAFE_FIELDS);

  if (!member)
    return res.status(404).json({ success: false, message: "Member not found." });
  res.json({ success: true, member });
});

// DELETE /api/members/:id
export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findOneAndDelete({
    _id: req.params.id,
    ...MEMBER_FILTER,
  });
  if (!member)
    return res.status(404).json({ success: false, message: "Member not found." });
  res.json({ success: true, message: "Member deleted." });
});
