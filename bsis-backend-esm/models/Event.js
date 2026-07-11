import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Event title is required"], trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: String,          // rich text HTML from the admin editor
    shortDescription: String,     // for cards / listings
    coverImage: String,
    gallery: [String],
    startDate: { type: Date, required: true },
    endDate: Date,
    time: String,                 // e.g. "10:00 AM - 4:00 PM"
    venue: String,
    city: String,
    registrationLink: String,
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

eventSchema.pre("validate", function (next) {
  if (this.title && !this.slug) this.slug = slugify(this.title);
  next();
});

export default mongoose.model("Event", eventSchema);
