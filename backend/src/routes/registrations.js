const express = require('express');
const { body } = require('express-validator');
const {
  createRegistration,
  getUserRegistrations,
  getRegistrationById,
  updateRegistration,
  cancelRegistration,
  getUserRegistrationStats
} = require('../controllers/registrationController');
const { authenticateToken, requireStudent } = require('../middleware/auth');
const { uploadPaymentScreenshot, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Simplified validation rules for registration
const createRegistrationValidation = [
  body('registrationType')
    .isIn(['individual', 'team'])
    .withMessage('Registration type must be individual or team')
];

// Protected routes (require authentication)
router.use(authenticateToken);

// Registration routes
router.post('/event/:eventId', 
  requireStudent,
  uploadPaymentScreenshot.single('paymentScreenshot'),
  handleUploadError,
  createRegistrationValidation,
  createRegistration
);

router.get('/', requireStudent, getUserRegistrations);
router.get('/stats', requireStudent, getUserRegistrationStats);
router.get('/:id', requireStudent, getRegistrationById);

router.put('/:id', 
  requireStudent,
  uploadPaymentScreenshot.single('paymentScreenshot'),
  handleUploadError,
  updateRegistration
);

router.delete('/:id', requireStudent, cancelRegistration);

module.exports = router;
