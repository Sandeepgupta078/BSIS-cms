import SiteSettings from "../models/SiteSettings.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/settings  (public - frontend loads navbar/footer/logo from here)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  res.json({ success: true, settings });
});

// PUT /api/settings  (admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.key; // singleton key is not editable
  const settings = await SiteSettings.findOneAndUpdate({ key: "main" }, body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  res.json({ success: true, settings });
});
