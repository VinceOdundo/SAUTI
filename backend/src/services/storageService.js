const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documents");
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

exports.uploadToLocal = async (file) => {
  try {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Write file to local storage
    await fs.writeFile(filePath, file.buffer);

    return {
      Location: `/uploads/documents/${fileName}`,
      Key: fileName,
      path: filePath,
    };
  } catch (error) {
    console.error("Local upload error:", error);
    throw new Error("Failed to upload document");
  }
};

exports.deleteFromLocal = async (key) => {
  try {
    const filePath = path.join(UPLOADS_DIR, key);
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Local delete error:", error);
    throw new Error("Failed to delete document");
  }
};

exports.getLocalPath = (key) => {
  return path.join(UPLOADS_DIR, key);
};
