const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getDetailedEventRegistrations,
  updateRegistrationStatus,
  exportEventRegistrations,
  getDashboardStats,
  getAllUsers,
  markAttendance,
  getEventAttendance,
  addEventPrize,
  getEventPrizes,
  updateEventPrize,
  deleteEventPrize
} = require('../controllers/adminController');

// Import functions from simpleAdminController for compatibility
const {
  getStats,
  getEvents,
  getEvent,
  getUsers,
  getEventRegistrations
} = require('../controllers/simpleAdminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads (using memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
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

// Test routes without authentication (temporary for debugging)
router.get('/test-events-no-auth', getEvents);
router.get('/test-stats-no-auth', getStats);

// Mock test routes with simple responses
router.get('/test-events/:eventId/registrations/detailed', (req, res) => {
  const { eventId } = req.params;
  console.log(`📋 Mock registrations endpoint called for event: ${eventId}`);
  
  res.json({
    success: true,
    data: {
      event: { id: eventId, name: 'Test Event', startDate: new Date(), venue: 'Test Venue' },
      registrations: [],
      statistics: { totalRegistrations: 0, approvedRegistrations: 0, pendingRegistrations: 0, rejectedRegistrations: 0 },
      pagination: { currentPage: 1, totalPages: 1, totalRegistrations: 0, hasNextPage: false, hasPrevPage: false }
    }
  });
});

router.get('/test-events/:eventId/attendance', (req, res) => {
  const { eventId } = req.params;
  console.log(`✅ Mock attendance endpoint called for event: ${eventId}`);
  
  res.json({
    success: true,
    data: {
      event: { id: eventId, name: 'Test Event', startDate: new Date(), venue: 'Test Venue' },
      attendance: [],
      statistics: { attendanceStats: [], totalRegistrations: 0, attendanceMarked: 0, attendanceNotMarked: 0 },
      pagination: { currentPage: 1, totalPages: 1, totalAttendance: 0, hasNextPage: false, hasPrevPage: false }
    }
  });
});

router.get('/test-events/:eventId/prizes', (req, res) => {
  const { eventId } = req.params;
  console.log(`🏆 Mock prizes endpoint called for event: ${eventId}`);
  
  res.json({
    success: true,
    data: {
      event: { id: eventId, name: 'Test Event', startDate: new Date(), venue: 'Test Venue' },
      prizes: [],
      statistics: { prizeStats: [], totalPrizes: 0 },
      pagination: { currentPage: 1, totalPages: 1, totalPrizes: 0, hasNextPage: false, hasPrevPage: false }
    }
  });
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
router.post('/events', upload.fields([{ name: 'poster' }, { name: 'paymentQR' }]), eventValidation, createEvent);
router.put('/events/:id', upload.fields([{ name: 'poster' }, { name: 'paymentQR' }]), eventValidation, updateEvent);
router.delete('/events/:id', deleteEvent);

// Registration management routes
router.get('/events/:id/registrations', getEventRegistrations);
router.get('/events/:eventId/registrations/detailed', getDetailedEventRegistrations);
router.put('/registrations/:registrationId/status', updateRegistrationStatus);
router.get('/events/:eventId/registrations/export', exportEventRegistrations);

// Attendance management routes
router.post('/events/:eventId/registrations/:registrationId/attendance', markAttendance);
router.get('/events/:eventId/attendance', getEventAttendance);

// Prize management routes
router.post('/events/:eventId/prizes', upload.single('prizeImage'), addEventPrize);
router.get('/events/:eventId/prizes', getEventPrizes);
router.put('/prizes/:prizeId', upload.single('prizeImage'), updateEventPrize);
router.delete('/prizes/:prizeId', deleteEventPrize);

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
