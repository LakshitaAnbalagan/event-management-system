const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  getStats,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getUsers,
  getEventRegistrations
} = require('../controllers/simpleAdminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware to ensure admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Validation rules for event creation/update
const eventValidation = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 100 })
    .withMessage('Event name cannot exceed 100 characters')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters')
    .trim(),
  body('college')
    .optional()
    .isLength({ max: 100 })
    .withMessage('College name cannot exceed 100 characters')
    .trim(),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Please provide a valid registration deadline'),
  body('venue')
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters')
    .trim(),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be a positive integer'),
  body('registrationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Registration fee cannot be negative'),
  body('instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters')
    .trim(),
  body('registrationType')
    .optional()
    .isIn(['individual', 'team', 'both'])
    .withMessage('Invalid registration type'),
  body('whatsappGroupLink')
    .optional()
    .isURL()
    .withMessage('Please provide a valid WhatsApp group link'),
  body('paymentDetails.upiId')
    .optional()
    .trim(),
  body('paymentDetails.phoneNumber')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid phone number for payment')
];

// Dashboard and statistics routes
router.get('/stats', getStats);

// Event management routes
router.get('/events', getEvents);
router.get('/events/:id', getEvent);
router.post('/events', upload.single('image'), createEvent);
router.put('/events/:id', upload.single('image'), updateEvent);
router.delete('/events/:id', deleteEvent);
router.patch('/events/:id/status', toggleEventStatus);

// Registration management routes
router.get('/events/:eventId/registrations', getEventRegistrations);

// User management routes
router.get('/users', getUsers);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 2 files allowed.'
      });
    }
  } else if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }
  
  next(error);
});

module.exports = router;
