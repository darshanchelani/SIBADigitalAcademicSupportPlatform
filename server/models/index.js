const mongoose = require('mongoose');
const { Schema } = mongoose;

// ========================================
// 1. USER
// ========================================
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Moderator', 'User'],
      default: 'User',
    },
    points: { type: Number, default: 0, min: 0 },
    profilePicture: { type: String }, // Firebase/Cloudinary URL for profile picture
    skills: [{ type: String, trim: true }], // Array of skills
    bio: { type: String, maxlength: 500 }, // User bio/description
    isVerified: { type: Boolean, default: false }, // Email verification status
    verificationToken: { type: String }, // Email verification token (hashed)
    verificationTokenExpires: { type: Date }, // Token expiration (10 min)
    resetPasswordToken: { type: String }, // Password reset token
    resetPasswordExpires: { type: Date }, // Token expiration date
  },
  { timestamps: true }
);

// User model uses unique:true on email field, which creates an index automatically
const User = mongoose.model('User', userSchema);

// ========================================
// 2. QUERY
// ========================================
const querySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String }, // Text or transcribed voice
    voiceFile: { type: String }, // Firebase URL for voice recording
    videoFile: { type: String }, // Firebase URL for video
    attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
    category: {
      type: String,
      enum: ['MRC', 'PRC', 'ERC'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'InProgress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    moderationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: { type: String }, // Optional reason for rejection
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for Query
querySchema.index({ category: 1, status: 1, timestamp: -1 });
querySchema.index({ title: 'text', content: 'text' }); // Text search index

const Query = mongoose.model('Query', querySchema);

// ========================================
// 3. RESPONSE
// ========================================
const responseSchema = new Schema(
  {
    queryId: { type: Schema.Types.ObjectId, ref: 'Query', required: true },
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    responseText: { type: String },
    responseType: {
      type: String,
      enum: ['Text', 'Audio', 'Video'],
      required: true,
    },
    fileUrl: { type: String }, // Audio/Video URL from Firebase
    voiceFile: { type: String }, // Voice recording URL
    videoFile: { type: String }, // Video URL
    attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for Response
responseSchema.index({ queryId: 1, timestamp: 1 });

const Response = mongoose.model('Response', responseSchema);

// ========================================
// 4. ATTACHMENT
// ========================================
const attachmentSchema = new Schema({
  queryId: { type: Schema.Types.ObjectId, ref: 'Query' }, // Nullable
  responseId: { type: Schema.Types.ObjectId, ref: 'Response' }, // Nullable
  fileUrl: { type: String, required: true },
  fileName: { type: String }, // Original filename
  fileSize: { type: Number }, // File size in bytes
  mimeType: { type: String }, // MIME type
  type: {
    type: String,
    enum: ['Image', 'Code', 'Document', 'Audio', 'Video', 'Other'],
    required: true,
  },
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

// ========================================
// 5. SESSION (Zoom)
// ========================================
const sessionSchema = new Schema({
  queryId: { type: Schema.Types.ObjectId, ref: 'Query', required: true },
  zoomLink: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  recordingUrl: { type: String }, // Nullable, added after session
});

const Session = mongoose.model('Session', sessionSchema);

// ========================================
// 6. BADGE
// ========================================
const badgeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

const Badge = mongoose.model('Badge', badgeSchema);

// ========================================
// 7. USERBADGE (Junction)
// ========================================
const userBadgeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  awardedTime: { type: Date, default: Date.now },
});

// Compound index to prevent duplicates
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

// ========================================
// 8. LEADERBOARD
// ========================================
const leaderboardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rank: { type: Number, required: true },
  score: { type: Number, required: true },
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// ========================================
// 9. ANALYTICS
// ========================================
const analyticsSchema = new Schema({
  metricType: {
    type: String,
    required: true,
    enum: ['QueryCount', 'ResponseCount', 'AvgResolutionTime', 'UserEngagement', 'CategoryUsage'],
  },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Indexes for Analytics
analyticsSchema.index({ metricType: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

// ========================================
// 10. NOTIFICATION
// ========================================
const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: {
    type: String,
    enum: ['NewQuery', 'QueryApproved', 'QueryRejected', 'NewResponse', 'General', 'NewQuiz', 'Certificate'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedQuery: { type: Schema.Types.ObjectId, ref: 'Query' },
  relatedQuiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ========================================
// 11. QUIZ
// ========================================
const quizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0 }, // index of correct option
});

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    password: { type: String, required: true }, // hashed password to access quiz
    questions: [quizQuestionSchema],
    duration: { type: Number, required: true, min: 1 }, // minutes
    expiresAt: { type: Date, required: true }, // when quiz becomes unavailable
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quizSchema.index({ expiresAt: 1, isActive: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

// ========================================
// 12. QUIZ ATTEMPT
// ========================================
const quizAttemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ type: Number }], // selected option index for each question
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quizId: 1, userId: 1 }, { unique: true });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

// ========================================
// 13. CERTIFICATE
// ========================================
const certificateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['ModeratorAppreciation'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    responseCount: { type: Number, required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who issued it
    issuedAt: { type: Date, default: Date.now },
    certificateId: { type: String, unique: true }, // Unique ID for sharing/verification
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, type: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

// ========================================
// CREATE INDEXES FOR PERFORMANCE
// ========================================
async function createIndexes() {
  try {
    await User.createIndexes();
    await Query.createIndexes();
    await Response.createIndexes();
    await Analytics.createIndexes();
    await Quiz.createIndexes();
    await QuizAttempt.createIndexes();
    await Certificate.createIndexes();
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

// Call on module load (after connection)
if (mongoose.connection.readyState === 1) {
  createIndexes();
} else {
  mongoose.connection.once('open', createIndexes);
}

// ========================================
// EXPORT ALL MODELS
// ========================================
module.exports = {
  User,
  Query,
  Response,
  Attachment,
  Session,
  Badge,
  UserBadge,
  Leaderboard,
  Analytics,
  Notification,
  Quiz,
  QuizAttempt,
  Certificate,
};
