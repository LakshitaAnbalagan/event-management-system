const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY && 
                           process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary storage
const createCloudinaryStorage = (folder) => {
  if (!hasCloudinaryConfig || !cloudinary) {
    console.warn(`⚠️  Cloudinary not configured, using local storage for ${folder}`);
    // Fallback to local storage
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads', folder);
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }

  console.log(`✅ Using Cloudinary storage for ${folder}`);
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto:good',
          format: 'jpg'
        }
      ]
    }
  });
};

// Storage for event posters
const eventPosterStorage = createCloudinaryStorage('kongu-events/posters');

// Storage for payment QR codes
const paymentQRStorage = createCloudinaryStorage('kongu-events/payment-qr');

// Storage for payment screenshots - Using local storage for now to avoid Cloudinary issues
console.log('🔧 Using local storage for payment screenshots to avoid upload issues');
const paymentScreenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/payment-screenshots');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for profile images
const profileImageStorage = createCloudinaryStorage('kongu-events/profiles');

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instances for different upload types
const uploadEventPoster = multer({
  storage: eventPosterStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const uploadPaymentQR = multer({
  storage: paymentQRStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
});

const uploadPaymentScreenshot = multer({
  storage: paymentScreenshotStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
});

// Multiple file upload for events (poster + payment QR)
const uploadEventFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${error.limit / 1024 / 1024}MB.`
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field received.'
      });
    }
  } else if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only image files are allowed.'
    });
  }

  // For any other errors, pass them to the default Express error handler
  return next(error);
};

module.exports = {
  uploadEventPoster,
  uploadPaymentQR,
  uploadPaymentScreenshot,
  uploadProfileImage,
  uploadEventFiles,
  handleUploadError
};
