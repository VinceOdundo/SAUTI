const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");
const { createValidationError } = require("./errorHandler");

// Local storage configuration
const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(LOCAL_UPLOAD_DIR);
  } catch {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  }
};

// Process image with sharp
const processImage = async (buffer, options = {}) => {
  const {
    width = 1200,
    height = 1200,
    quality = 80,
    format = "jpeg",
  } = options;

  return sharp(buffer)
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, { quality })
    .toBuffer();
};

// Upload to local storage
const uploadToStorage = async (buffer, fileName, mimeType) => {
  try {
    if (!buffer || !fileName || !mimeType) {
      throw createValidationError("Missing required upload parameters");
    }

    // Process image if it's an image file
    if (mimeType.startsWith("image/")) {
      buffer = await processImage(buffer, {
        format: mimeType === "image/png" ? "png" : "jpeg",
      });
    }

    await ensureUploadDir();
    const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Delete file from storage
const deleteFromStorage = async (fileUrl) => {
  try {
    const filePath = path.join(LOCAL_UPLOAD_DIR, fileUrl.split("/").pop());
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadToStorage,
  deleteFromStorage,
  processImage,
};
