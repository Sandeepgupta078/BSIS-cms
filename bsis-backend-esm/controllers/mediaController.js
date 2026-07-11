import cloudinary from "../config/cloudinary.js";
import Media from "../models/Media.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/apiFeatures.js";

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

// POST /api/media/upload  (multipart form-data, field name: "file")
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided. Use form-data with field 'file'." });
  }

  const folder = req.body.folder ? `bsis/${req.body.folder}` : "bsis";
  const isVideo = req.file.mimetype.startsWith("video");
  const isRaw = req.file.mimetype === "application/pdf";

  const result = await uploadToCloudinary(req.file.buffer, {
    folder,
    resource_type: isVideo ? "video" : isRaw ? "raw" : "image",
  });

  const media = await Media.create({
    url: result.secure_url,
    publicId: result.public_id,
    originalName: req.file.originalname,
    format: result.format,
    resourceType: result.resource_type,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    altText: req.body.altText || "",
    folder,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, media });
});

// POST /api/media/upload-multiple  (field name: "files", up to 10)
export const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files provided." });
  }
  const folder = req.body.folder ? `bsis/${req.body.folder}` : "bsis";

  const uploads = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, { folder, resource_type: "image" });
      return Media.create({
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        format: result.format,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        folder,
        uploadedBy: req.user._id,
      });
    })
  );

  res.status(201).json({ success: true, count: uploads.length, media: uploads });
});

// GET /api/media?page=1&limit=24&folder=bsis/events&search=logo
export const getAllMedia = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.folder) query.folder = req.query.folder;
  if (req.query.type) query.resourceType = req.query.type;
  if (req.query.search) query.originalName = { $regex: req.query.search, $options: "i" };

  const { items, pagination } = await paginate(Media, query, req.query);
  res.json({ success: true, media: items, pagination });
});

// PUT /api/media/:id  (update alt text)
export const updateMedia = asyncHandler(async (req, res) => {
  const media = await Media.findByIdAndUpdate(
    req.params.id,
    { altText: req.body.altText },
    { new: true }
  );
  if (!media) return res.status(404).json({ success: false, message: "Media not found." });
  res.json({ success: true, media });
});

// DELETE /api/media/:id  (removes from Cloudinary AND the database)
export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) return res.status(404).json({ success: false, message: "Media not found." });

  await cloudinary.uploader.destroy(media.publicId, { resource_type: media.resourceType });
  await media.deleteOne();
  res.json({ success: true, message: "Media deleted." });
});





export const getGallery = async (req, res) => {
  try {
    const media = await Media.find({
      resourceType: "image",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      media,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
