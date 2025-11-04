import { validationResult } from 'express-validator';
import Waitlist from '../models/Waitlist.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import crypto from 'crypto';

// @desc    Add email to waitlist
// @route   POST /api/waitlist/join
// @access  Public
export const addToWaitlist = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, referralSource } = req.body;
    
    // Get IP and user agent for analytics
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email });
    
    if (existingEntry) {
      if (existingEntry.status === 'unsubscribed') {
        // Reactivate if previously unsubscribed
        existingEntry.status = 'pending';
        existingEntry.confirmedAt = null;
        await existingEntry.save();
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You\'ve been added to the waitlist again.',
          data: { email: existingEntry.email }
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'You\'re already on the waitlist!',
        data: { email: existingEntry.email }
      });
    }

    // Create new waitlist entry
    const waitlistEntry = await Waitlist.create({
      email,
      ipAddress,
      userAgent,
      referralSource,
      status: 'confirmed', // Auto-confirm for simplicity, or use 'pending' with email verification
      confirmedAt: new Date()
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully added to waitlist! Check your email for confirmation.',
      data: { 
        email: waitlistEntry.email,
        position: await Waitlist.countDocuments({ createdAt: { $lte: waitlistEntry.createdAt } })
      }
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join waitlist. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get waitlist statistics
// @route   GET /api/waitlist/stats
// @access  Public
export const getWaitlistStats = async (req, res) => {
  try {
    const totalCount = await Waitlist.countDocuments({ status: { $ne: 'unsubscribed' } });
    const confirmedCount = await Waitlist.countDocuments({ status: 'confirmed' });
    const todayCount = await Waitlist.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
      status: { $ne: 'unsubscribed' }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        confirmed: confirmedCount,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error getting waitlist stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};

// @desc    Get all waitlist entries (Admin only - should add auth)
// @route   GET /api/waitlist/all
// @access  Private (should be protected)
export const getAllWaitlistEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const entries = await Waitlist.find({ status: { $ne: 'unsubscribed' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Waitlist.countDocuments({ status: { $ne: 'unsubscribed' } });

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
    console.error('Error getting waitlist entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist entries'
    });
  }
};

// @desc    Confirm email (if using email verification)
// @route   GET /api/waitlist/confirm/:token
// @access  Public
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // In production, you'd verify a JWT or lookup a confirmation token
    // For now, this is a placeholder
    
    res.status(200).json({
      success: true,
      message: 'Email confirmed successfully!'
    });
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm email'
    });
  }
};

// @desc    Unsubscribe from waitlist
// @route   POST /api/waitlist/unsubscribe
// @access  Public
export const unsubscribe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    
    const entry = await Waitlist.findOne({ email });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in waitlist'
      });
    }

    entry.status = 'unsubscribed';
    await entry.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from waitlist'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe'
    });
  }
};
