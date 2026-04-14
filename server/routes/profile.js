const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadFile } = require('../utils/firebase');

const router = express.Router();

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

/**
 * GET /api/profile/:id
 * Get any user's profile (public)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

/**
 * PATCH /api/profile
 * Update user profile (name, bio)
 */
router.patch(
  '/',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, bio } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      }).select('-passwordHash');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }
);

/**
 * POST /api/profile/picture
 * Upload profile picture
 */
router.post('/picture', authenticate, uploadSingle('picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate image type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'File must be an image' });
    }

    // Upload to Firebase
    const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, 'profile-pictures');

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: fileUrl },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile picture uploaded successfully', user });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
  }
});

/**
 * DELETE /api/profile/picture
 * Remove profile picture
 */
router.delete('/picture', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { profilePicture: '' } },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile picture removed successfully', user });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ message: 'Failed to remove profile picture', error: error.message });
  }
});

/**
 * POST /api/profile/skills
 * Add skill to user profile
 */
router.post(
  '/skills',
  authenticate,
  [body('skill').trim().notEmpty().withMessage('Skill is required').isLength({ max: 50 }).withMessage('Skill must be less than 50 characters')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { skill } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if skill already exists (case-insensitive)
      const skillLower = skill.toLowerCase();
      if (user.skills && user.skills.some((s) => s.toLowerCase() === skillLower)) {
        return res.status(400).json({ message: 'Skill already exists' });
      }

      // Add skill
      user.skills = user.skills || [];
      user.skills.push(skill.trim());
      await user.save();

      res.json({ message: 'Skill added successfully', skills: user.skills });
    } catch (error) {
      console.error('Add skill error:', error);
      res.status(500).json({ message: 'Failed to add skill', error: error.message });
    }
  }
);

/**
 * DELETE /api/profile/skills/:skill
 * Remove skill from user profile
 */
router.delete('/skills/:skill', authenticate, async (req, res) => {
  try {
    const skillToRemove = decodeURIComponent(req.params.skill);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove skill (case-insensitive)
    const skillLower = skillToRemove.toLowerCase();
    user.skills = (user.skills || []).filter((s) => s.toLowerCase() !== skillLower);
    await user.save();

    res.json({ message: 'Skill removed successfully', skills: user.skills });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ message: 'Failed to remove skill', error: error.message });
  }
});

module.exports = router;

