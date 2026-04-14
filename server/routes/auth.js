const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} = require('../utils/email');

const router = express.Router();

// Rate limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { message: 'Too many email requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/register
 * Register a new student (only @iba-suk.edu.pk emails)
 */
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Restrict to Sukkur IBA University emails only
      if (!email.endsWith('@iba-suk.edu.pk')) {
        return res
          .status(400)
          .json({ message: 'Only Sukkur IBA University emails (@iba-suk.edu.pk) are allowed' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // If existing user is not verified and token expired, allow re-registration
        if (
          !existingUser.isVerified &&
          existingUser.verificationTokenExpires &&
          existingUser.verificationTokenExpires < new Date()
        ) {
          await User.deleteOne({ _id: existingUser._id });
        } else {
          return res.status(400).json({ message: 'User already exists' });
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate verification token (valid for 10 minutes)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user (unverified)
      const user = new User({
        name,
        email,
        passwordHash,
        role: 'User',
        isVerified: false,
        verificationToken: verificationTokenHash,
        verificationTokenExpires,
      });

      await user.save();

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken, name);
      } catch (emailError) {
        console.error('Verification email sending failed:', emailError);
        // Delete the user if email fails so they can try again
        await User.deleteOne({ _id: user._id });
        return res
          .status(500)
          .json({ message: 'Failed to send verification email. Please try again later.' });
      }

      res.status(201).json({
        message:
          'Registration successful! Please check your email to verify your account. The verification link expires in 10 minutes.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }
);

/**
 * POST /api/auth/verify-email
 * Verify email using token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationToken: tokenHash,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired verification token. Please register again.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post(
  '/resend-verification',
  emailLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user || user.isVerified) {
        return res.json({
          message:
            'If the account exists and is unverified, a new verification email has been sent.',
        });
      }

      // Generate new verification token (10 minutes)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      user.verificationToken = verificationTokenHash;
      user.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(email, verificationToken, user.name);

      res.json({
        message: 'If the account exists and is unverified, a new verification email has been sent.',
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification email' });
    }
  }
);

/**
 * POST /api/auth/admin/register
 * Register a new admin (requires admin secret)
 */
router.post(
  '/admin/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('adminSecret').notEmpty().withMessage('Admin secret is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, adminSecret } = req.body;

      // Verify admin secret
      if (!process.env.ADMIN_SECRET) {
        return res.status(500).json({ message: 'Server configuration error' });
      }
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret key' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin user
      const user = new User({
        name,
        email,
        passwordHash,
        role: 'Admin',
      });

      await user.save();

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ message: 'Server configuration error' });
      }
      const token = jwt.sign({ userId: user._id }, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      res.status(201).json({
        message: 'Admin registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
        },
      });
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({ message: 'Admin registration failed', error: error.message });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check email verification (only for regular users, admins/moderators bypass)
      if (user.role === 'User' && !user.isVerified) {
        return res.status(403).json({
          message:
            'Please verify your email before logging in. Check your inbox for the verification link.',
          needsVerification: true,
          email: user.email,
        });
      }

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ message: 'Server configuration error' });
      }
      const token = jwt.sign({ userId: user._id }, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Forgot password - send reset email
 */
router.post(
  '/forgot-password',
  emailLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });

      // Don't reveal if email exists (security best practice)
      if (!user) {
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set token expiration (1 hour from now)
      const resetPasswordExpires = new Date();
      resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

      // Save token to user
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = resetPasswordExpires;
      await user.save();

      // Send email
      try {
        const { sendPasswordResetEmail } = require('../utils/email');
        await sendPasswordResetEmail(email, resetToken, user.name);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Clear the token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res
          .status(500)
          .json({ message: 'Failed to send reset email. Please try again later.' });
      }

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process request', error: error.message });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      // Hash the token to compare with stored hash
      const crypto = require('crypto');
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: new Date() }, // Token not expired
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      user.passwordHash = passwordHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Send success email
      try {
        const { sendPasswordResetSuccessEmail } = require('../utils/email');
        await sendPasswordResetSuccessEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Success email sending failed:', emailError);
        // Don't fail the request if email fails
      }

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
});

module.exports = router;
