import express from "express";
import {
  getPosts, getPostBySlug,
  getAllPostsAdmin, getPostById, createPost, updatePost, deletePost,
} from "../controllers/newsController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getPosts);
router.get("/slug/:slug", getPostBySlug);

// Admin
router.use(protect, restrictTo("admin", "editor"));
router.get("/admin", getAllPostsAdmin);
router.post("/", createPost);
router.route("/:id").get(getPostById).put(updatePost).delete(deletePost);

export default router;
