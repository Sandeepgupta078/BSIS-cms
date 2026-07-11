import express from "express";
import {
  getPageBySlug,
  getHomepage,
  getNavPages,
  getAllPages,
  getPagesTree,
  getPageById,
  createPage,
  updatePage,
  reorderSections,
  togglePublish,
  toggleHide,
  duplicatePage,
  deletePage,
} from "../controllers/pageController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public (the website consumes these)
router.get("/home", getHomepage);
router.get("/nav", getNavPages);
router.get("/slug/:slug", getPageBySlug);

// Admin
router.use(protect, restrictTo("admin", "editor"));
router.get("/tree", getPagesTree);
router.route("/").get(getAllPages).post(createPage);
router.route("/:id").get(getPageById).put(updatePage).delete(deletePage);
router.patch("/:id/sections/reorder", reorderSections);
router.patch("/:id/publish", togglePublish);
router.patch("/:id/hide", toggleHide);
router.post("/:id/duplicate", duplicatePage);

export default router;
