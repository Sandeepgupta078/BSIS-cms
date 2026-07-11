import mongoose from "mongoose";
import validator from "validator";

// Stores contact-form submissions from the public site so the
// admin can view/manage enquiries inside the CMS.
const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: String,
    subject: String,
    message: { type: String, required: [true, "Message is required"] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ContactSubmission", contactSubmissionSchema);
