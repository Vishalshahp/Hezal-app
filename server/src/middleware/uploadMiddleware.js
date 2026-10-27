import multer from 'multer';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

export const uploadSingleImage = (fieldName = 'image') => {
  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB max
    },
    fileFilter
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            status: 'error',
            message: 'File size exceeds 5MB limit. Please upload a smaller image.'
          });
        }
        return res.status(400).json({
          success: false,
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: err.message
        });
      }
      next();
    });
  };
};

export default {
  uploadSingleImage
};
