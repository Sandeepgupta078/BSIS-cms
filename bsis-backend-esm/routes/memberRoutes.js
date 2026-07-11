import express from "express";
import {
  getMembers,
  getMemberStats,
  getMember,
  updateMember,
  setMemberVerified,
  deleteMember,
} from "../controllers/memberController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All member-management routes require a logged-in CMS account
router.use(protect);

// Admins and editors can view and edit member profiles
router.get("/", restrictTo("admin", "editor"), getMembers);
router.get("/stats", restrictTo("admin", "editor"), getMemberStats);
router.get("/:id", restrictTo("admin", "editor"), getMember);
router.put("/:id", restrictTo("admin", "editor"), updateMember);
router.patch("/:id/verify", restrictTo("admin", "editor"), setMemberVerified);

// Deleting a member account is admin-only
router.delete("/:id", restrictTo("admin"), deleteMember);

export default router;
