import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  addToWaitlist,
  getWaitlistStats,
  getAllWaitlistEntries,
  confirmEmail,
  unsubscribe
} from '../controllers/waitlistController.js';

const router = express.Router();

// Rate limiting: max 5 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many requests from this IP, please try again later.'
});

// Validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// Routes
router.post('/join', limiter, validateEmail, addToWaitlist);
router.get('/stats', getWaitlistStats);
router.get('/all', getAllWaitlistEntries); // Should be protected in production
router.get('/confirm/:token', confirmEmail);
router.post('/unsubscribe', validateEmail, unsubscribe);

export default router;
