const cloudinary = require('cloudinary').v2;

// Initialize Cloudinary if credentials are provided
let cloudinaryInitialized = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryInitialized = true;
    console.log('✅ Cloudinary initialized');
  } catch (error) {
    console.error('❌ Cloudinary initialization error:', error);
  }
} else {
  console.warn('⚠️  Cloudinary credentials not provided. File uploads will be disabled.');
}

/**
 * Upload file buffer to Cloudinary
 */
async function uploadFile(buffer, filename, folder = 'uploads') {
  if (!cloudinaryInitialized) {
    throw new Error(
      'Cloudinary not initialized. Check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  return new Promise((resolve, reject) => {
    const ext = filename.split('.').pop().toLowerCase();
    // Determine resource type
    let resourceType = 'auto';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
      resourceType = 'video';
    } else if (['mp3', 'wav', 'ogg', 'webm'].includes(ext) && folder.includes('voice')) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio too
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sdasp/${folder}`,
        public_id: `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

module.exports = { uploadFile };
