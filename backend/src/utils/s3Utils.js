const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload file to S3
 * @param {Object} file - File object from multer
 * @param {String} path - Path in S3 bucket
 * @returns {Promise<String>} - URL of uploaded file
 */
exports.uploadToS3 = async (file, path) => {
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${path}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

/**
 * Delete file from S3
 * @param {String} fileUrl - Full URL of file to delete
 * @returns {Promise<void>}
 */
exports.deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split(`${BUCKET_NAME}/`)[1];

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};
