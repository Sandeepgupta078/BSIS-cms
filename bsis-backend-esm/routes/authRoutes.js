import express from "express";
import rateLimit from "express-rate-limit";
import {
  login, logout, getMe, updatePassword,
  getUsers, createUser, updateUser, deleteUser,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Brute-force protection on login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);

router.use(protect); // everything below requires login
router.get("/me", getMe);
router.put("/update-password", updatePassword);

router.use(restrictTo("admin")); // user management is admin-only
router.route("/users").get(getUsers).post(createUser);
router.route("/users/:id").put(updateUser).delete(deleteUser);

export default router;
