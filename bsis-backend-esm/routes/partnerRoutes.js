import express from "express";
import {
  getPartners, getAllPartnersAdmin, createPartner, updatePartner, deletePartner,
} from "../controllers/partnerController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPartners); // public

router.use(protect, restrictTo("admin", "editor"));
router.get("/admin", getAllPartnersAdmin);
router.post("/", createPartner);
router.route("/:id").put(updatePartner).delete(deletePartner);

export default router;
