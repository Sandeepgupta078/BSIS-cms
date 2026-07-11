import mongoose from "mongoose";

/*
 * The core of the CMS. Every page on bsis.in is a document here.
 * A page = ordered list of flexible "sections".
 *
 * section.type  -> which React component renders it on the frontend
 *                  e.g. "hero", "textBlock", "imageGrid", "cardList",
 *                       "cta", "faq", "stats", "testimonials", "gallery",
 *                       "video", "contactInfo", "customHtml"
 * section.data  -> free-form JSON matching that component's props
 *                  e.g. hero: { heading, subheading, image, buttonText, buttonLink }
 *
 * Adding a new kind of section needs NO backend change - only a new
 * component + form on the frontend/admin.
 */
const sectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    // Content flow for this section: "ltr" (default) or "rtl"
    // e.g. hero/textBlock with image -> image left vs image right
    layout: { type: String, enum: ["ltr", "rtl"], default: "ltr" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Page title is required"], trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // fast public lookups by slug
    },
    // SEO - fully manageable from the CMS
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [String],
    ogImage: { type: String }, // social share image URL

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    isHomepage: { type: Boolean, default: false },
    showInNav: { type: Boolean, default: false },
    navOrder: { type: Number, default: 0 },

    // Nested pages: a page can live inside another page (one level or deeper)
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Page", default: null, index: true },

    // Hide from the public site without unpublishing (soft hide)
    isHidden: { type: Boolean, default: false },

    // Page-level text/content direction: left-to-right or right-to-left
    direction: { type: String, enum: ["ltr", "rtl"], default: "ltr" },

    sections: [sectionSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Only one page can be the homepage
pageSchema.pre("save", async function (next) {
  if (this.isHomepage && this.isModified("isHomepage")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isHomepage: false }
    );
  }
  next();
});

export default mongoose.model("Page", pageSchema);
