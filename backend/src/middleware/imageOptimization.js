import sharp from "sharp";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const optimized = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    req.file.buffer = optimized;
    next();
  } catch (error) {
    next(error);
  }
};
