import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    designation: { type: String, required: true },
    photo: String,
    bio: String,
    category: {
      type: String,
      enum: [
        "Board Members",
        "Patrons and Advisors",
        "National Councils",
        "State Committees",
        "International Councils",
        "other",
      ],
      default: "other",
    },
    email: String,
    linkedin: String,
    twitter: String,
    order: { type: Number, default: 0 }, // display order on the team page
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("TeamMember", teamMemberSchema);
