import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie("token", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password." });
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Incorrect email or password." });
  }
  sendToken(user, 200, res);
});

// POST /api/auth/logout
export const logout = (req, res) => {
  res.cookie("token", "loggedout", { httpOnly: true, expires: new Date(Date.now() + 5000) });
  res.json({ success: true, message: "Logged out." });
};

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/update-password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: "Current password is incorrect." });
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// ---- Admin-only user management ----

// GET /api/auth/users
export const getUsers = asyncHandler(async (req, res) => {
  // The `users` collection is shared with the auth backend (members).
  // Only CMS staff accounts (admin/editor) belong on this screen —
  // members are managed separately under /api/members.
  const users = await User.find({ role: { $in: ["admin", "editor"] } }).sort("-createdAt");
  res.json({ success: true, users });
});

// POST /api/auth/users  (admin creates editors/admins)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  user.password = undefined;
  res.status(201).json({ success: true, user });
});

// PUT /api/auth/users/:id  (change role / activate / deactivate)
export const updateUser = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, role, isActive },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, user });
});

// DELETE /api/auth/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, message: "User deleted." });
});
