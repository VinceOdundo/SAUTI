const validateDocument = (document) => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (document.size > maxSize) {
    return {
      isValid: false,
      message: "Document size must not exceed 5MB",
    };
  }

  // Check file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/heic",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(document.mimetype)) {
    return {
      isValid: false,
      message:
        "Invalid file type. Allowed types: PDF, JPEG, PNG, HEIC, DOC, DOCX",
    };
  }

  // Check file name length
  if (document.name.length > 255) {
    return {
      isValid: false,
      message: "File name is too long",
    };
  }

  // Check for malicious file extensions
  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".php",
    ".js",
    ".jsp",
    ".html",
    ".htm",
    ".asp",
  ];

  if (
    dangerousExtensions.some((ext) => document.name.toLowerCase().endsWith(ext))
  ) {
    return {
      isValid: false,
      message: "File type not allowed for security reasons",
    };
  }

  // Validate file name characters
  const validFileNameRegex = /^[a-zA-Z0-9-_. ]+$/;
  const fileName = document.name.split(".")[0];
  if (!validFileNameRegex.test(fileName)) {
    return {
      isValid: false,
      message: "File name contains invalid characters",
    };
  }

  return {
    isValid: true,
    message: "Document is valid",
  };
};

const sanitizeFileName = (fileName) => {
  // Remove any path components
  const baseName = fileName.split(/[\\/]/).pop();

  // Remove special characters
  const sanitized = baseName.replace(/[^a-zA-Z0-9-_. ]/g, "");

  // Ensure the filename isn't empty after sanitization
  if (!sanitized) {
    return "document_" + Date.now();
  }

  return sanitized;
};

const getDocumentMetadata = async (document) => {
  try {
    let metadata = {
      fileName: sanitizeFileName(document.name),
      fileSize: document.size,
      mimeType: document.mimetype,
      uploadedAt: new Date(),
      hash: await calculateFileHash(document.data),
    };

    // Extract additional metadata based on file type
    if (document.mimetype.startsWith("image/")) {
      const imageMetadata = await getImageMetadata(document.data);
      metadata = { ...metadata, ...imageMetadata };
    }

    return metadata;
  } catch (error) {
    console.error("Error getting document metadata:", error);
    throw new Error("Failed to process document metadata");
  }
};

const calculateFileHash = async (buffer) => {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const getImageMetadata = async (buffer) => {
  const sharp = require("sharp");
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
    };
  } catch (error) {
    console.error("Error getting image metadata:", error);
    return {};
  }
};

module.exports = {
  validateDocument,
  sanitizeFileName,
  getDocumentMetadata,
};
