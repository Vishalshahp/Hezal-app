import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const isCloudinaryReady = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryReady) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
  logger.info('Cloudinary SDK configured for remote media hosting.');
} else {
  logger.info('Cloudinary credentials not provided. Using local disk upload storage.');
}

/**
 * Upload an image buffer to Cloudinary or local disk fallback
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalName - Original filename
 * @param {string} folder - Destination subfolder (e.g. 'stalls', 'products')
 * @returns {Promise<string>} Public accessible URL
 */
export const uploadImageBuffer = async (buffer, originalName, folder = 'misc') => {
  if (isCloudinaryReady) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `hezal_market/${folder}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error.message);
            return reject(new Error('Cloud image upload failed'));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local fallback: Save to /uploads and return relative URL
  const ext = path.extname(originalName) || '.jpg';
  const uniqueName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(filePath, buffer);
  const localUrl = `/uploads/${uniqueName}`;
  logger.info(`Saved local upload: ${localUrl}`);
  return localUrl;
};

export const isCloudinaryConfigured = () => isCloudinaryReady;

export default {
  uploadImageBuffer,
  isCloudinaryConfigured
};
