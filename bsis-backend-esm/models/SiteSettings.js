import mongoose from "mongoose";

/*
 * Singleton document - global site config manageable from CMS:
 * logo, navbar, footer, contact info, social links, announcement bar.
 * The frontend fetches this ONCE at app load.
 */
const navItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
    isExternal: { type: Boolean, default: false },
    children: [
      {
        label: String,
        url: String,
        order: { type: Number, default: 0 },
      },
    ],
  },
  { _id: true }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true }, // enforce singleton
    siteName: { type: String, default: "Bharat Startup and Innovation Society" },
    tagline: String,
    logoUrl: String,
    logoDarkUrl: String,
    faviconUrl: String,

    navbar: [navItemSchema],

    footer: {
      aboutText: String,
      copyrightText: String,
      columns: [
        {
          heading: String,
          links: [{ label: String, url: String }],
        },
      ],
    },

    contact: {
      email: String,
      phone: String,
      altPhone: String,
      address: String,
      mapEmbedUrl: String,
    },

    social: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      whatsapp: String,
    },

    announcementBar: {
      isEnabled: { type: Boolean, default: false },
      text: String,
      link: String,
    },

    // default SEO fallbacks
    defaultMetaTitle: String,
    defaultMetaDescription: String,
  },
  { timestamps: true }
);

// Helper: always get-or-create the single settings doc
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: "main" });
  if (!settings) settings = await this.create({ key: "main" });
  return settings;
};

export default mongoose.model("SiteSettings", siteSettingsSchema);
