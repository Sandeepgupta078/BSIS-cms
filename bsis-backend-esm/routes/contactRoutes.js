import express from "express";
import rateLimit from "express-rate-limit";
import {
  submitContact, getSubmissions, markAsRead, deleteSubmission,
} from "../controllers/contactController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public form submission - rate limited against spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many submissions. Please try again later." },
});
router.post("/", contactLimiter, submitContact);

// Admin inbox
router.use(protect, restrictTo("admin", "editor"));
router.get("/", getSubmissions);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteSubmission);

export default router;
