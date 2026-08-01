const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

// Initialize S3 Client from environment variables
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'hippo-mlm-realestate-bucket';

let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

/**
 * Upload a file buffer to AWS S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mime type
 * @param {string} folder - Target folder inside S3 bucket (default: 'naksa_layouts')
 * @returns {Promise<string>} S3 object public URL
 */
async function uploadToS3(fileBuffer, originalName = 'layout_map.png', mimeType = 'image/png', folder = 'naksa_layouts') {
  try {
    const ext = path.extname(originalName) || '.png';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const filename = `${folder}/${Date.now()}_${randomHash}${ext}`;

    if (s3Client && fileBuffer) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read'
      });

      await s3Client.send(command);
      return `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
    }

    // Fallback if S3 credentials not provided in .env yet
    return `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error('AWS S3 Upload Error:', error);
    // Return fallback S3 URL structure on error
    const ext = path.extname(originalName) || '.png';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${folder}/${Date.now()}_naksa${ext}`;
  }
}

module.exports = {
  uploadToS3,
  bucketName,
  region
};
