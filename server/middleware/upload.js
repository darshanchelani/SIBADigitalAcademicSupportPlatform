const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (files will be uploaded to Firebase)
const storage = multer.memoryStorage();

// File filter: only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|webm|mp4|mov|avi|mkv|zip|rar|7z/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('audio/') ||
                   file.mimetype.startsWith('video/') ||
                   file.mimetype.includes('pdf') ||
                   file.mimetype.includes('document') ||
                   file.mimetype.includes('text/');

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images, documents, audio, video, archives'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Middleware for multiple file uploads
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

// Middleware for multiple fields (voice, video, attachments)
const uploadFields = (fields) => upload.fields(fields);

module.exports = { uploadSingle, uploadMultiple, uploadFields };

