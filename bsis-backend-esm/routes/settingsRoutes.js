import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSettings);                                  // public
router.put("/", protect, restrictTo("admin"), updateSettings); // admin only

export default router;
