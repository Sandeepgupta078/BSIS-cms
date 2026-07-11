import mongoose from "mongoose";

/**
 * Member
 * ------
 * Members are the people who register through the separate authentication
 * backend (the "src" auth service). Both backends connect to the SAME
 * MongoDB database, and the auth backend stores its users in the `users`
 * collection (mongoose.model("User") -> "users").
 *
 * This model is a read/manage view over that same collection. The third
 * argument to mongoose.model() pins it explicitly to "users" so the CMS
 * can list and manage members without duplicating data.
 *
 * NOTE: The CMS's own login accounts (models/User.js) also live in the
 * `users` collection when the databases are shared. Members are
 * distinguished by the fields only the auth backend sets (memberCategory,
 * firstName, tenant, ...). Every query in memberController.js filters on
 * that, so CMS admins/editors never show up as members and vice versa.
 *
 * IMPORTANT: This model must never hash or modify passwords — the auth
 * backend owns authentication. Password and verification-token fields are
 * select:false and are stripped from every response.
 */
const memberSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    contactNumber: { type: String, trim: true },

    // Owned by the auth backend — never exposed or modified by the CMS
    password: { type: String, select: false },

    organisationName: { type: String, trim: true },
    memberCategory: { type: String, trim: true },
    designation: { type: String, trim: true },
    city: { type: String, trim: true },
    website: { type: String, default: null },

    role: { type: String, default: "USER" },
    isVerified: { type: Boolean, default: false },

    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },

    tenant: {
      type: String,
      enum: ["bsis", "startuptalks", "bsf"],
      default: "bsis",
    },
  },
  {
    timestamps: true,
    strict: false, // tolerate any extra fields the auth backend may add later
  }
);

// Third argument pins this model to the auth backend's "users" collection.
export default mongoose.model("Member", memberSchema, "users");
