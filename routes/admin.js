import express from 'express';
import { body } from 'express-validator';
import {
  adminLogin,
  getAdminStats,
  getAllEntries,
  exportToCSV,
  deleteEntry,
  verifyToken
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/login', validateLogin, adminLogin);
router.get('/verify', authenticateAdmin, verifyToken);

// Protected routes (require authentication)
router.get('/stats', authenticateAdmin, getAdminStats);
router.get('/entries', authenticateAdmin, getAllEntries);
router.get('/export', authenticateAdmin, exportToCSV);
router.delete('/entries/:id', authenticateAdmin, deleteEntry);

export default router;
