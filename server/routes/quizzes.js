const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { Quiz, QuizAttempt, User, Notification } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Rate limiter for quiz password verification
const quizPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many password attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/quizzes
 * Create a new quiz (Moderator/Admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('Moderator', 'Admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('questions.*.question').notEmpty().withMessage('Each question must have text'),
    body('questions.*.options').isArray({ min: 2 }).withMessage('At least 2 options per question'),
    body('questions.*.correctAnswer')
      .isInt({ min: 0 })
      .withMessage('Correct answer index is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('expiresAt').isISO8601().withMessage('Valid expiry date is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, password, questions, duration, expiresAt } = req.body;

      // Validate expiry is in the future
      if (new Date(expiresAt) <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const quiz = new Quiz({
        title,
        description,
        createdBy: req.user._id,
        password: hashedPassword,
        questions,
        duration,
        expiresAt: new Date(expiresAt),
      });

      await quiz.save();

      // Notify all users about the new quiz
      try {
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('_id');
        if (allUsers.length > 0) {
          const notifications = allUsers.map((u) => ({
            userId: u._id,
            type: 'NewQuiz',
            title: 'New Quiz Available',
            message: `A new quiz "${title}" has been scheduled. Don't miss it!`,
            relatedQuiz: quiz._id,
          }));
          await Notification.insertMany(notifications);
        }
      } catch (notifError) {
        console.error('Quiz notification error:', notifError);
        // Don't fail the quiz creation if notification fails
      }

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz: { ...quiz.toObject(), password: undefined },
      });
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ message: 'Failed to create quiz', error: error.message });
    }
  }
);

/**
 * GET /api/quizzes
 * Get all quizzes (different views for moderators vs students)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();

    if (req.user.role === 'Moderator' || req.user.role === 'Admin') {
      // Moderators see all their quizzes
      const quizzes = await Quiz.find({ createdBy: req.user._id })
        .select('-password -questions.correctAnswer')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      return res.json(quizzes);
    }

    // Students see only active, non-expired quizzes
    const quizzes = await Quiz.find({
      isActive: true,
      expiresAt: { $gt: now },
    })
      .select('-password -questions.correctAnswer')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Check which quizzes the user has already attempted
    const attempts = await QuizAttempt.find({ userId: req.user._id });
    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.quizId.toString()] = a;
    });

    const result = quizzes.map((q) => ({
      ...q.toObject(),
      attempted: !!attemptMap[q._id.toString()],
      score: attemptMap[q._id.toString()]?.score || null,
      totalQuestions: q.questions.length,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
});

/**
 * POST /api/quizzes/:id/verify-password
 * Verify quiz password and return questions (without correct answers)
 */
router.post(
  '/:id/verify-password',
  authenticate,
  quizPasswordLimiter,
  [body('password').notEmpty().withMessage('Password is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      if (!quiz.isActive || new Date() > quiz.expiresAt) {
        return res.status(400).json({ message: 'This quiz has expired' });
      }

      // Check if already attempted
      const existing = await QuizAttempt.findOne({
        quizId: quiz._id,
        userId: req.user._id,
      });
      if (existing) {
        return res.status(400).json({ message: 'You have already attempted this quiz' });
      }

      const isMatch = await bcrypt.compare(req.body.password, quiz.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect quiz password' });
      }

      // Return questions without correct answers
      const questions = quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      }));

      res.json({
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        questions,
      });
    } catch (error) {
      console.error('Verify quiz password error:', error);
      res.status(500).json({ message: 'Failed to verify password', error: error.message });
    }
  }
);

/**
 * POST /api/quizzes/:id/submit
 * Submit quiz answers
 */
router.post(
  '/:id/submit',
  authenticate,
  [body('answers').isArray().withMessage('Answers array is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      if (!quiz.isActive || new Date() > quiz.expiresAt) {
        return res.status(400).json({ message: 'This quiz has expired' });
      }

      // Check if already attempted
      const existing = await QuizAttempt.findOne({
        quizId: quiz._id,
        userId: req.user._id,
      });
      if (existing) {
        return res.status(400).json({ message: 'You have already submitted this quiz' });
      }

      const { answers } = req.body;

      // Calculate score
      let score = 0;
      quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) {
          score++;
        }
      });

      const attempt = new QuizAttempt({
        quizId: quiz._id,
        userId: req.user._id,
        answers,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
      });

      await attempt.save();

      // Award points for quiz completion
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: score * 2 }, // 2 points per correct answer
      });

      res.json({
        message: 'Quiz submitted successfully',
        quizId: quiz._id,
        score,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((score / quiz.questions.length) * 100),
      });
    } catch (error) {
      console.error('Submit quiz error:', error);
      res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
    }
  }
);

/**
 * GET /api/quizzes/my-attempts
 * Get current user's quiz attempts (for profile)
 */
router.get('/my-attempts', authenticate, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .populate('quizId', 'title description')
      .sort({ completedAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error('Get my attempts error:', error);
    res.status(500).json({ message: 'Failed to fetch attempts', error: error.message });
  }
});

/**
 * GET /api/quizzes/:id/results
 * Get quiz results (Moderator/Admin - see all attempts for their quiz)
 */
router.get('/:id/results', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attempts = await QuizAttempt.find({ quizId: quiz._id })
      .populate('userId', 'name email')
      .sort({ score: -1 });

    res.json({
      quiz: { title: quiz.title, totalQuestions: quiz.questions.length },
      attempts,
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
});

/**
 * GET /api/quizzes/:id/preview
 * Preview a completed quiz attempt — shows questions, user answers, and correct answers.
 * Students can only preview their own attempt; creators and admins can preview any attempt.
 */
router.get('/:id/preview', authenticate, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { userId } = req.query;
    const isCreatorOrAdmin =
      req.user.role === 'Admin' || quiz.createdBy.toString() === req.user._id.toString();

    // Determine which attempt to load
    const targetUserId = isCreatorOrAdmin && userId ? userId : req.user._id;

    const attempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      userId: targetUserId,
    }).populate('userId', 'name email');

    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found for this quiz' });
    }

    // Only the attempt owner or the quiz creator/admin can view
    if (
      attempt.userId._id.toString() !== req.user._id.toString() &&
      !isCreatorOrAdmin
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build preview with correct answers
    const questions = quiz.questions.map((q, i) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: attempt.answers[i] != null ? attempt.answers[i] : -1,
      isCorrect: attempt.answers[i] === q.correctAnswer,
    }));

    res.json({
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      student: attempt.userId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
      completedAt: attempt.completedAt,
      questions,
    });
  } catch (error) {
    console.error('Quiz preview error:', error);
    res.status(500).json({ message: 'Failed to load quiz preview', error: error.message });
  }
});

/**
 * DELETE /api/quizzes/:id
 * Delete a quiz (Moderator/Admin only)
 */
router.delete('/:id', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await QuizAttempt.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(quiz._id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
});

module.exports = router;
