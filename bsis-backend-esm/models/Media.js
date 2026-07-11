import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },        // Cloudinary secure_url
    publicId: { type: String, required: true },   // needed for deletion
    originalName: String,
    format: String,                                // jpg, png, webp, pdf...
    resourceType: { type: String, default: "image" }, // image | video | raw
    width: Number,
    height: Number,
    bytes: Number,
    altText: { type: String, default: "" },
    folder: { type: String, default: "bsis" },     // organize in the media library
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
