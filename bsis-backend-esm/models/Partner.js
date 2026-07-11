import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Partner name is required"],
      trim: true,
    },
    logo: { type: String, required: true },
    websiteUrl: String,
    category: {
      type: String,
      enum: [
        "Government Partners",
        "Industry Association Partners",
        "Media Partners",
        "Strategic Partners",
        "other",
      ],
      default: "other",
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Partner", partnerSchema);
