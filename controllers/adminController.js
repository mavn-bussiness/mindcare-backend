import { validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import Waitlist from '../models/Waitlist.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = generateToken(email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        email: admin.email,
        role: admin.role,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// @desc    Verify admin token
// @route   GET /api/admin/verify
// @access  Private
export const verifyToken = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: { email: req.admin.email }
  });
};

// @desc    Get comprehensive admin statistics
// @route   GET /api/admin/stats
// @access  Private
export const getAdminStats = async (req, res) => {
  try {
    const totalCount = await Waitlist.countDocuments({ status: { $ne: 'unsubscribed' } });
    const confirmedCount = await Waitlist.countDocuments({ status: 'confirmed' });
    const pendingCount = await Waitlist.countDocuments({ status: 'pending' });
    const unsubscribedCount = await Waitlist.countDocuments({ status: 'unsubscribed' });
    
    // Today's signups
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await Waitlist.countDocuments({
      createdAt: { $gte: todayStart },
      status: { $ne: 'unsubscribed' }
    });

    // This week's signups
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekCount = await Waitlist.countDocuments({
      createdAt: { $gte: weekStart },
      status: { $ne: 'unsubscribed' }
    });

    // This month's signups
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthCount = await Waitlist.countDocuments({
      createdAt: { $gte: monthStart },
      status: { $ne: 'unsubscribed' }
    });

    // Growth trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Waitlist.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
        status: { $ne: 'unsubscribed' }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Latest signups
    const latestSignups = await Waitlist.find({ status: { $ne: 'unsubscribed' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email createdAt status');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalCount,
          confirmed: confirmedCount,
          pending: pendingCount,
          unsubscribed: unsubscribedCount
        },
        timeStats: {
          today: todayCount,
          thisWeek: weekCount,
          thisMonth: monthCount
        },
        growthTrend: last7Days,
        latestSignups
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};

// @desc    Get all waitlist entries with pagination and filtering
// @route   GET /api/admin/entries
// @access  Private
export const getAllEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Filter by status
    const search = req.query.search; // Search by email

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const entries = await Waitlist.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Waitlist.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get entries'
    });
  }
};

// @desc    Export waitlist to CSV
// @route   GET /api/admin/export
// @access  Private
export const exportToCSV = async (req, res) => {
  try {
    const status = req.query.status;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const entries = await Waitlist.find(query)
      .sort({ createdAt: -1 })
      .select('email status createdAt confirmedAt ipAddress');

    // Create CSV content
    const csvHeader = 'Email,Status,Signup Date,Confirmed Date,IP Address\n';
    const csvRows = entries.map(entry => {
      return `${entry.email},${entry.status},${entry.createdAt.toISOString()},${entry.confirmedAt ? entry.confirmedAt.toISOString() : 'N/A'},${entry.ipAddress || 'N/A'}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mindcare-waitlist-${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};

// @desc    Delete waitlist entry
// @route   DELETE /api/admin/entries/:id
// @access  Private
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Waitlist.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry'
    });
  }
};
