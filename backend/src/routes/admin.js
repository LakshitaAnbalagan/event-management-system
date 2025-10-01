const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Import models for direct database queries
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Prize = require('../models/Prize');
const User = require('../models/User');
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

// Route to list all available events with their IDs
router.get('/list-events', async (req, res) => {
  try {
    const events = await Event.find({}).select('_id name startDate venue').limit(10);
    const eventsWithCounts = [];
    
    for (const event of events) {
      const registrationCount = await Registration.countDocuments({ event: event._id });
      eventsWithCounts.push({
        id: event._id,
        name: event.name,
        startDate: event.startDate,
        venue: event.venue,
        registrationCount,
        urls: {
          registrations: `/admin/events/${event._id}/registrations/detailed`,
          attendance: `/admin/events/${event._id}/attendance`,
          prizes: `/admin/events/${event._id}/prizes`
        }
      });
    }
    
    res.json({
      success: true,
      data: eventsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Real data test routes
router.get('/test-events/:eventId/registrations/detailed', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, status = 'all', registrationType = 'all', search = '' } = req.query;
    
    console.log(`📋 Real registrations endpoint called for event: ${eventId}`);
    
    // Verify event ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build filter
    const filter = { event: eventId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (registrationType && registrationType !== 'all') {
      filter.registrationType = registrationType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregation pipeline to get registrations with attendance data
    const pipeline = [
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'registration',
          as: 'attendance',
        },
      },
      {
        $unwind: {
          path: '$attendance',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const registrations = await Registration.aggregate(pipeline);

    const totalRegistrations = await Registration.countDocuments(filter);
    const totalPages = Math.ceil(totalRegistrations / parseInt(limit));

    // Get statistics
    const attendanceStats = await Attendance.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$attendanceStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const statistics = {
      totalRegistrations,
      present: attendanceStats.find((s) => s._id === 'present')?.count || 0,
      absent: attendanceStats.find((s) => s._id === 'absent')?.count || 0,
      late: attendanceStats.find((s) => s._id === 'late')?.count || 0,
    };

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          venue: event.venue
        },
        registrations,
        statistics,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRegistrations,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    const { eventId } = req.params;
    console.error('❌ Error in test registrations route:', error);
    console.error('❌ Error details:', {
      eventId,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message,
      eventId: eventId
    });
  }
});

router.get('/test-events/:eventId/attendance', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;
    
    console.log(`✅ Real attendance endpoint called for event: ${eventId}`);
    
    // Verify event ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build filter
    const filter = { event: eventId };
    if (status && status !== 'all') {
      filter.attendanceStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get attendance records
    const attendance = await Attendance.find(filter)
      .populate('user', 'name email phone college department')
      .populate('registration', 'registrationNumber registrationType teamName')
      .populate('markedBy', 'name')
      .sort({ markedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAttendance = await Attendance.countDocuments(filter);
    const totalPages = Math.ceil(totalAttendance / parseInt(limit));

    // Get summary statistics
    const attendanceStats = await Attendance.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$attendanceStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRegistrations = await Registration.countDocuments({ event: eventId });
    const attendanceMarked = await Attendance.countDocuments({ event: eventId });

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          venue: event.venue
        },
        attendance,
        statistics: {
          attendanceStats,
          totalRegistrations,
          attendanceMarked,
          attendanceNotMarked: totalRegistrations - attendanceMarked
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAttendance,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error in test attendance route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
});

router.get('/test-events/:eventId/prizes', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, position } = req.query;
    
    console.log(`🏆 Real prizes endpoint called for event: ${eventId}`);
    
    // Verify event ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Build filter
    const filter = { event: eventId };
    if (position && position !== 'all') {
      filter.position = position;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prizes = await Prize.find(filter)
      .populate('event', 'name')
      .populate('winner.user', 'name email phone college department')
      .populate('winner.registration', 'registrationNumber registrationType teamName')
      .populate('awardedBy', 'name')
      .sort({ awardedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPrizes = await Prize.countDocuments(filter);
    const totalPages = Math.ceil(totalPrizes / parseInt(limit));

    // Get prize statistics
    const prizeStats = await Prize.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
          totalValue: { $sum: '$prizeValue' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          venue: event.venue
        },
        prizes,
        statistics: {
          prizeStats,
          totalPrizes
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPrizes,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error in test prizes route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prizes',
      error: error.message
    });
  }
});

// Test routes for marking attendance and prizes (no auth required)
router.post('/test-events/:eventId/registrations/:registrationId/attendance', async (req, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const { attendanceStatus, notes } = req.body;

    console.log(`✅ Marking attendance for registration: ${registrationId}`);

    if (!['present', 'absent', 'late'].includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be one of: present, absent, late'
      });
    }

    // Verify event and registration exist
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registration = await Registration.findById(registrationId)
      .populate('user', 'name email');
    if (!registration || registration.event.toString() !== eventId) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this event'
      });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      event: eventId,
      registration: registrationId
    });

    if (attendance) {
      // Get admin user for updating attendance
      let adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        adminUser = new User({
          name: 'System Admin',
          email: 'admin@kongu.edu',
          password: 'admin123',
          role: 'admin',
          isVerified: true
        });
        await adminUser.save();
      }

      // Update existing attendance
      attendance.attendanceStatus = attendanceStatus;
      attendance.notes = notes || '';
      attendance.markedAt = new Date();
      attendance.markedBy = adminUser._id;
      
      if (attendanceStatus === 'present' && !attendance.checkInTime) {
        attendance.checkInTime = new Date();
      }
    } else {
      // Get or create a default admin user for marking attendance
      let adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        // Create a default admin if none exists
        adminUser = new User({
          name: 'System Admin',
          email: 'admin@kongu.edu',
          password: 'admin123',
          role: 'admin',
          isVerified: true
        });
        await adminUser.save();
      }

      // Create new attendance record
      attendance = new Attendance({
        event: eventId,
        registration: registrationId,
        user: registration.user._id,
        attendanceStatus,
        notes: notes || '',
        checkInTime: attendanceStatus === 'present' ? new Date() : null,
        markedBy: adminUser._id,
        markedAt: new Date()
      });
    }

    await attendance.save();

    // Populate the response
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email')
      .populate('registration', 'registrationNumber')
      .populate('markedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance: populatedAttendance }
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
});

router.post('/test-events/:eventId/prizes', async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      prizeName,
      prizeDescription,
      position,
      prizeValue,
      currency = 'INR',
      registrationId,
      userId,
      winnerType,
      teamName,
      notes
    } = req.body;

    console.log(`🏆 Adding prize for event: ${eventId}`);

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get or create a default admin user for awarding prizes
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        name: 'System Admin',
        email: 'admin@kongu.edu',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
    }

    // Create prize
    const prize = new Prize({
      event: eventId,
      prizeName,
      prizeDescription,
      position,
      prizeValue: parseFloat(prizeValue) || 0,
      currency,
      winner: {
        type: winnerType || 'individual',
        user: userId || null,
        registration: registrationId || null,
        teamName: teamName || null
      },
      notes: notes || '',
      awardedBy: adminUser._id,
      awardedAt: new Date()
    });

    await prize.save();

    // Populate the response
    const populatedPrize = await Prize.findById(prize._id)
      .populate('event', 'name')
      .populate('winner.user', 'name email')
      .populate('winner.registration', 'registrationNumber registrationType teamName');

    res.status(201).json({
      success: true,
      message: 'Prize added successfully',
      data: { prize: populatedPrize }
    });

  } catch (error) {
    console.error('Add prize error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add prize',
      error: error.message
    });
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

const { Parser } = require('json2csv');

router.get('/test-events/:eventId/attendance/export', async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendanceRecords = await Attendance.find({ event: eventId })
      .populate('user', 'name email phone')
      .populate('registration', 'registrationNumber');

    const fields = [
      { label: 'User Name', value: 'user.name' },
      { label: 'Email', value: 'user.email' },
      { label: 'Phone', value: 'user.phone' },
      { label: 'Registration Number', value: 'registration.registrationNumber' },
      { label: 'Status', value: 'attendanceStatus' },
      { label: 'Check-in Time', value: 'checkInTime' },
      { label: 'Notes', value: 'notes' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(attendanceRecords);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-${eventId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).send('Could not export attendance data');
  }
});

module.exports = router;
