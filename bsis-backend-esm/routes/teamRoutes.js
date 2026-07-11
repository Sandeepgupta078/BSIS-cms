import express from "express";
import {
  getTeam, getAllTeamAdmin, getMemberById,
  createMember, updateMember, deleteMember, reorderTeam,
} from "../controllers/teamController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTeam); // public

router.use(protect, restrictTo("admin", "editor"));
router.get("/admin", getAllTeamAdmin);
router.post("/", createMember);
router.patch("/reorder", reorderTeam);
router.route("/:id").get(getMemberById).put(updateMember).delete(deleteMember);

export default router;
