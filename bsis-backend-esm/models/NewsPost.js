import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const newsPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    excerpt: String,              // short summary for listing cards
    content: String,              // rich text HTML
    coverImage: String,
    category: { type: String, default: "General" },
    tags: [String],
    author: { type: String, default: "BSIS" },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
    metaTitle: String,
    metaDescription: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

newsPostSchema.pre("validate", function (next) {
  if (this.title && !this.slug) this.slug = slugify(this.title);
  if (this.status === "published" && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export default mongoose.model("NewsPost", newsPostSchema);
