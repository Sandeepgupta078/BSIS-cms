import express from "express";
import {
  uploadMedia, uploadMultiple, getAllMedia, updateMedia, deleteMedia, getGallery
} from "../controllers/mediaController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();


router.get("/gallery", getGallery);
router.use(protect, restrictTo("admin", "editor")); // entire media library is protected

router.get("/", getAllMedia);
router.post("/upload", upload.single("file"), uploadMedia);
router.post("/upload-multiple", upload.array("files", 10), uploadMultiple);
router.route("/:id").put(updateMedia).delete(deleteMedia);

export default router;
