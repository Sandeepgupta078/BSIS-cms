import express from "express";
import {
  getEvents, getEventBySlug,
  getAllEventsAdmin, getEventById, createEvent, updateEvent, deleteEvent,
} from "../controllers/eventController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getEvents);
router.get("/slug/:slug", getEventBySlug);

// Admin
router.use(protect, restrictTo("admin", "editor"));
router.get("/admin", getAllEventsAdmin);
router.post("/", createEvent);
router.route("/:id").get(getEventById).put(updateEvent).delete(deleteEvent);

export default router;
