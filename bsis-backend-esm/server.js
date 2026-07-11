import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import dns from 'node:dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = express();
connectDB();

// ---- Global middleware ----
app.set("trust proxy", 1); // needed on Render/Railway/behind Nginx for rate limiting

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like Postman (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// General API rate limit
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  }),
);

// ---- Routes ----
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok", time: new Date() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/members", memberRoutes);

// 404 for unknown API routes
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`BSIS CMS API running on port ${PORT} [${process.env.NODE_ENV}]`),
);
