// One-time script: creates the first admin user + empty site settings.
// Run:  npm run seed:admin
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import SiteSettings from "../models/SiteSettings.js";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = process.env.ADMIN_EMAIL || "admin@bsis.in";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Admin already exists: ${email}`);
    } else {
      await User.create({
        name: process.env.ADMIN_NAME || "BSIS Admin",
        email,
        password: process.env.ADMIN_PASSWORD || "ChangeMe@123",
        role: "admin",
      });
      console.log(`Admin created: ${email}`);
      console.log("IMPORTANT: change this password after first login.");
    }

    await SiteSettings.getSettings();
    console.log("Site settings initialized.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();
