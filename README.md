# SDASP — Sukkur IBA Digital Academic Support Platform

> A full-stack Progressive Web Application (PWA) built for **Sukkur IBA University** that automates the student query–response workflow with AI-powered moderation, real-time notifications, gamification, quizzes, and an admin analytics dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Project Structure](#project-structure)
5. [Database Schema (12 Collections)](#database-schema-12-collections)
6. [Features in Detail](#features-in-detail)
   - [Authentication & Email Verification](#1-authentication--email-verification)
   - [Forgot / Reset Password](#2-forgot--reset-password)
   - [Query Posting with Voice, Video & File Attachments](#3-query-posting-with-voice-video--file-attachments)
   - [Moderation Queue & AI Draft Response](#4-moderation-queue--ai-draft-response)
   - [Real-Time Notifications](#5-real-time-notifications)
   - [Knowledge Base Search](#6-knowledge-base-search)
   - [Gamification System](#7-gamification-system)
   - [Quiz System](#8-quiz-system)
   - [Admin Dashboard & Analytics](#9-admin-dashboard--analytics)
   - [Peer-to-Peer Responses](#10-peer-to-peer-responses)
   - [Zoom Session Scheduling](#11-zoom-session-scheduling)
   - [In-App Confirm Dialog](#12-in-app-confirm-dialog)
7. [Complete REST API Reference](#complete-rest-api-reference)
8. [Security Implementation](#security-implementation)
9. [Error Logging System](#error-logging-system)
10. [Performance & Scalability](#performance--scalability)
11. [PWA & Responsive Design](#pwa--responsive-design)
12. [Accessibility](#accessibility)
13. [Design System & Color Palette](#design-system--color-palette)
14. [Environment Variables](#environment-variables)
15. [Installation & Setup](#installation--setup)
16. [Running the Application](#running-the-application)
17. [Testing](#testing)
18. [Deployment](#deployment)
19. [Scheduled Jobs (Cron)](#scheduled-jobs-cron)
20. [Third-Party Services](#third-party-services)
21. [Troubleshooting](#troubleshooting)
22. [License](#license)

---

## Project Overview

SDASP is a university-wide query resolution platform designed exclusively for Sukkur IBA University students and staff. Students submit queries (text, voice, video, or file attachments) which go through a moderation pipeline. Moderators can leverage AI-generated draft responses (OpenAI GPT / Google Gemini) to respond efficiently. The system includes gamification (points, badges, leaderboards), a password-protected quiz system, a knowledge base of resolved queries, admin analytics, and a full notification system.

### Key Highlights

| Requirement                      | Implementation                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| **Restricted sign-up**           | Only `@iba-suk.edu.pk` university emails accepted                                    |
| **Email verification**           | Verification token sent on registration; expires in **10 minutes**                   |
| **Login blocked until verified** | Unverified users cannot access the system                                            |
| **Password reset via email**     | Secure token-based reset with 1-hour expiry                                          |
| **HTTPS on all endpoints**       | Helmet.js sets Strict-Transport-Security, X-Frame-Options, CSP headers               |
| **RESTful API design**           | All 12 modules accessed via REST endpoints under `/api`                              |
| **Email notification service**   | Account verification, password reset, password reset success emails via Brevo        |
| **Error logging system**         | Daily rotating log files — failed API requests, server crashes, unhandled rejections |
| **PWA manifest + responsive**    | Installable on mobile browsers; works offline for cached pages                       |
| **Pages load under 3 seconds**   | Vite code-splitting + gzip compression + CDN-ready static assets                     |
| **100 concurrent users**         | MongoDB Atlas connection pooling + Express async handlers + compressed responses     |
| **File storage**                 | Cloudinary (images, audio, video, documents — up to 50 MB)                           |
| **AI draft responses**           | OpenAI GPT-3.5-turbo primary; Google Gemini 1.5 Flash fallback; template fallback    |
| **Moderator notifications**      | In-app notification bell with unread count; auto-polls every 30 seconds              |
| **Quiz system**                  | Password-protected, timed quizzes with auto-expiry and one attempt per student       |
| **In-app confirm dialogs**       | All destructive actions use accessible modal dialogs instead of browser `confirm()`  |

---

## Technology Stack

### Frontend (Client)

| Technology                 | Version     | Purpose                         |
| -------------------------- | ----------- | ------------------------------- |
| React                      | 18.2+       | UI component library            |
| Vite                       | 5.0+        | Build tool & dev server         |
| Tailwind CSS               | 3.3+        | Utility-first CSS framework     |
| React Router DOM           | 6.20+       | Client-side routing             |
| Axios                      | 1.6+        | HTTP client                     |
| React Hot Toast            | 2.4+        | Toast notifications             |
| React Dropzone             | 14.2+       | Drag & drop file uploads        |
| Chart.js + react-chartjs-2 | 4.4+ / 5.2+ | Analytics charts                |
| vite-plugin-pwa            | 0.17+       | PWA service worker generation   |
| Workbox                    | 7.0+        | Offline caching strategies      |
| Google Fonts               | —           | Inter (sans) + Fraunces (serif) |

### Backend (Server)

| Technology         | Version | Purpose                                      |
| ------------------ | ------- | -------------------------------------------- |
| Node.js            | ≥ 18.0  | JavaScript runtime                           |
| Express.js         | 4.18+   | Web framework                                |
| Mongoose           | 8.0+    | MongoDB ODM                                  |
| JWT (jsonwebtoken) | 9.0+    | Stateless authentication                     |
| bcryptjs           | 2.4+    | Password hashing (10 salt rounds)            |
| @getbrevo/brevo    | —       | Transactional email (verification, resets)   |
| Multer             | 1.4+    | Multipart form-data parsing (memory storage) |
| Cloudinary         | 2.x     | Cloud file storage (images, audio, video)    |
| Helmet             | 8.x     | Security HTTP headers                        |
| Compression        | 1.x     | Gzip response compression                    |
| express-validator  | 7.0+    | Request body validation & sanitization       |
| express-rate-limit | —       | Rate limiting on auth endpoints              |
| Axios              | 1.6+    | AI API HTTP calls (OpenAI, Gemini)           |
| node-cron          | 3.0+    | Scheduled leaderboard updates + quiz expiry  |
| dotenv             | 16.3+   | Environment variable management              |

### Database

| Technology       | Purpose                              |
| ---------------- | ------------------------------------ |
| MongoDB Atlas    | Cloud-hosted MongoDB cluster         |
| Mongoose Schemas | 12 collections with compound indexes |

### DevOps & Tooling

| Tool             | Purpose                                |
| ---------------- | -------------------------------------- |
| Render.com       | Production deployment (single web svc) |
| Nodemon          | Auto-restart server on file changes    |
| Jest + Supertest | Server-side unit & integration testing |
| Concurrently     | Run client + server simultaneously     |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite PWA)                    │
│                                                                      │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Landing  │  │  Auth Pages   │  │  Dashboards   │  │  Query/KB    │ │
│  │  Page    │  │ Login,Register│  │ Student,Mod,  │  │  Form,Search │ │
│  │         │  │ Verify,Reset  │  │ Admin         │  │  Response    │ │
│  └─────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Quizzes      │  │  Gamification │  │  Profile & User Profile  │  │
│  │  (Student +   │  │  Leaderboard  │  │  (edit, skills, avatar)  │  │
│  │   Management) │  │  Points,Badge │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                         │  Axios HTTP (Bearer JWT)  │                │
└─────────────────────────┼───────────────────────────┼────────────────┘
                          │         HTTPS             │
┌─────────────────────────┼───────────────────────────┼────────────────┐
│                      SERVER (Express.js + Node.js)                   │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ Helmet   │  │Compress  │  │  CORS     │  │ Error Logger     │   │
│  │ Security │  │ Gzip     │  │ Middleware │  │ (daily log files)│   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     RESTful API Routes                         │  │
│  │  /api/auth         /api/queries      /api/responses            │  │
│  │  /api/moderator    /api/admin        /api/gamification         │  │
│  │  /api/kb           /api/analytics    /api/sessions             │  │
│  │  /api/notifications /api/profile     /api/quizzes              │  │
│  │  /api/health                                                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ JWT Auth │  │ Multer   │  │ AI Module │  │ Cron Jobs        │   │
│  │Middleware│  │ Upload   │  │ OpenAI /  │  │ (Leaderboard     │   │
│  │+ Roles  │  │ (Memory) │  │ Gemini    │  │ + Quiz expiry)   │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
   │  MongoDB    │ │ Cloudinary  │ │  Brevo Email │
   │  Atlas      │ │ File Storage│ │  Service     │
   │  (12 cols)  │ │ (img,audio, │ │  (verify,    │
   │             │ │  video,docs)│ │   reset)     │
   └─────────────┘ └─────────────┘ └──────────────┘
```

---

## Project Structure

```
SDASP/
├── package.json                    # Root — concurrently runs client + server
├── README.md                       # This file
├── render.yaml                     # Render.com deployment config
│
├── client/                         # ── FRONTEND (React + Vite + Tailwind) ──
│   ├── package.json                # Client dependencies
│   ├── index.html                  # HTML entry point + PWA meta tags
│   ├── vite.config.js              # Vite config (PWA plugin, proxy /api)
│   ├── tailwind.config.js          # Tailwind CSS configuration (sage palette)
│   ├── postcss.config.js           # PostCSS (autoprefixer + tailwind)
│   ├── public/
│   │   └── manifest.json           # PWA manifest (icons, theme, display)
│   └── src/
│       ├── main.jsx                # React entry — BrowserRouter + StrictMode
│       ├── App.jsx                 # Routes definition + ProtectedRoute + ConfirmProvider
│       ├── index.css               # Tailwind layers + component classes + typography
│       ├── contexts/
│       │   └── AuthContext.jsx     # Auth provider — login, register, logout, token mgmt
│       ├── components/
│       │   ├── Layout.jsx          # Dashboard shell — TopNav + Sidebar + Outlet
│       │   ├── TopNav.jsx          # Top navigation — search, notifications bell, profile
│       │   ├── Sidebar.jsx         # Side nav — role-aware menu links
│       │   ├── ErrorBoundary.jsx   # React error boundary wrapper
│       │   └── ConfirmDialog.jsx   # In-app confirm dialog (Context + Provider + Modal)
│       └── pages/
│           ├── Landing.jsx         # Public landing page (editorial layout)
│           ├── Login.jsx           # Login form + unverified email resend option
│           ├── Register.jsx        # Registration (restricted to @iba-suk.edu.pk)
│           ├── VerifyEmail.jsx     # Email verification token handler
│           ├── ForgotPassword.jsx  # Request password reset email
│           ├── ResetPassword.jsx   # Set new password with token
│           ├── AdminLogin.jsx      # Admin-specific login
│           ├── AdminRegister.jsx   # Admin registration (requires admin secret)
│           ├── StudentDashboard.jsx# Student home — my queries, stat cards, quick actions
│           ├── ModeratorDashboard.jsx # Moderation queue — tabs, filters, approve/reject
│           ├── ModerationQueueDetail.jsx # Single query — AI draft editor, responses
│           ├── AdminDashboard.jsx  # Admin overview — stats, charts
│           ├── AdminUsers.jsx      # User management (CRUD, role changes)
│           ├── AdminQueries.jsx    # All queries management
│           ├── AdminBadges.jsx     # Badge management (create, assign, delete)
│           ├── AdminResponses.jsx  # All responses management
│           ├── QueryForm.jsx       # Post new query — voice recording, file upload
│           ├── ResponseView.jsx    # View query + responses + post reply
│           ├── KBSearch.jsx        # Knowledge base full-text search
│           ├── Gamification.jsx    # Points, badges, leaderboard table
│           ├── Analytics.jsx       # Admin analytics charts (Chart.js)
│           ├── Profile.jsx         # User profile — edit name, bio, skills, avatar
│           ├── UserProfile.jsx     # Public user profile view (read-only)
│           ├── QuizManagement.jsx  # Moderator/Admin: create, view results, delete quizzes
│           └── StudentQuiz.jsx     # Student: take quizzes, timed attempt, results
│
└── server/                         # ── BACKEND (Express.js + Node.js) ──
    ├── package.json                # Server dependencies
    ├── index.js                    # Express app — middleware, routes, SPA fallback, error handler
    ├── jest.config.js              # Jest test configuration
    ├── logs/                       # Auto-created — daily error log files
    │   └── error-YYYY-MM-DD.log   # Rotating daily error logs
    ├── middleware/
    │   ├── auth.js                 # JWT authenticate + role authorize middleware
    │   ├── ai.js                   # AI draft generation (OpenAI → Gemini → fallback)
    │   └── upload.js               # Multer config (memory storage, 50MB limit, file filter)
    ├── models/
    │   └── index.js                # All 12 Mongoose schemas + indexes + exports
    ├── routes/
    │   ├── auth.js                 # Register, login, verify-email, forgot/reset password
    │   ├── profile.js              # User profile CRUD + picture upload/delete + skills
    │   ├── queries.js              # Query CRUD + moderator notifications
    │   ├── responses.js            # Response creation (peers + moderators)
    │   ├── kb.js                   # Knowledge base search + category counts
    │   ├── moderator.js            # Moderation queue, approve/reject, AI draft, templates
    │   ├── admin.js                # Admin user/query/response/badge management
    │   ├── gamification.js         # Points, badges, leaderboard
    │   ├── analytics.js            # Dashboard metrics + time-series data
    │   ├── sessions.js             # Zoom session scheduling
    │   ├── notifications.js        # Notification CRUD (get, read, mark-all-read)
    │   └── quizzes.js              # Quiz CRUD, password verification, submission, results
    ├── utils/
    │   ├── firebase.js             # Cloudinary upload utility
    │   ├── email.js                # Brevo transactional email (verification, reset, success)
    │   └── cron.js                 # Scheduled jobs (leaderboard rebuild + quiz expiry)
    └── tests/
        ├── setup.js                # Jest test setup (test DB connection)
        ├── auth.test.js            # Authentication endpoint tests
        ├── query.test.js           # Query posting tests
        └── moderator.test.js       # Moderation flow tests
```

---

## Database Schema (12 Collections)

### 1. User

| Field                      | Type     | Details                                                                   |
| -------------------------- | -------- | ------------------------------------------------------------------------- |
| `name`                     | String   | Required, trimmed                                                         |
| `email`                    | String   | Required, unique, lowercase, must end with `@iba-suk.edu.pk` for students |
| `passwordHash`             | String   | bcrypt hash (10 salt rounds)                                              |
| `role`                     | Enum     | `Admin`, `Moderator`, `User` (default: `User`)                            |
| `points`                   | Number   | Gamification score (default: 0, min: 0)                                   |
| `profilePicture`           | String   | Cloudinary URL                                                            |
| `skills`                   | [String] | Array of skill tags                                                       |
| `bio`                      | String   | Max 500 characters                                                        |
| `isVerified`               | Boolean  | Email verification status (default: `false`)                              |
| `verificationToken`        | String   | SHA-256 hashed email verification token                                   |
| `verificationTokenExpires` | Date     | Expiration timestamp (10 minutes after creation)                          |
| `resetPasswordToken`       | String   | SHA-256 hashed password reset token                                       |
| `resetPasswordExpires`     | Date     | Expiration timestamp (1 hour after creation)                              |
| `createdAt` / `updatedAt`  | Date     | Mongoose timestamps                                                       |

**Index:** Unique on `email`.

### 2. Query

| Field              | Type                    | Details                                    |
| ------------------ | ----------------------- | ------------------------------------------ |
| `userId`           | ObjectId → User         | Query author                               |
| `title`            | String                  | Max 200 chars, required                    |
| `content`          | String                  | Text description                           |
| `voiceFile`        | String                  | Cloudinary URL for voice recording         |
| `videoFile`        | String                  | Cloudinary URL for video                   |
| `attachments`      | [ObjectId → Attachment] | File attachments                           |
| `category`         | Enum                    | `MRC`, `PRC`, `ERC`                        |
| `status`           | Enum                    | `Open`, `InProgress`, `Resolved`, `Closed` |
| `moderationStatus` | Enum                    | `Pending`, `Approved`, `Rejected`          |
| `rejectionReason`  | String                  | Optional reason for rejection              |
| `timestamp`        | Date                    | Creation time                              |

**Indexes:** `{ category, status, timestamp }` compound; `{ title, content }` text search.

### 3. Response

| Field          | Type                    | Details                        |
| -------------- | ----------------------- | ------------------------------ |
| `queryId`      | ObjectId → Query        | Parent query                   |
| `moderatorId`  | ObjectId → User         | Responder (moderator or peer)  |
| `responseText` | String                  | Text content                   |
| `responseType` | Enum                    | `Text`, `Audio`, `Video`       |
| `fileUrl`      | String                  | Legacy file URL                |
| `voiceFile`    | String                  | Voice recording Cloudinary URL |
| `videoFile`    | String                  | Video Cloudinary URL           |
| `attachments`  | [ObjectId → Attachment] | File attachments               |
| `timestamp`    | Date                    | Response time                  |

**Index:** `{ queryId, timestamp }` compound.

### 4. Attachment

| Field        | Type                | Details                                                |
| ------------ | ------------------- | ------------------------------------------------------ |
| `queryId`    | ObjectId → Query    | Nullable                                               |
| `responseId` | ObjectId → Response | Nullable                                               |
| `fileUrl`    | String              | Cloudinary URL                                         |
| `fileName`   | String              | Original file name                                     |
| `fileSize`   | Number              | Size in bytes                                          |
| `mimeType`   | String              | MIME type                                              |
| `type`       | Enum                | `Image`, `Code`, `Document`, `Audio`, `Video`, `Other` |

### 5. Session (Zoom)

| Field           | Type             | Details                    |
| --------------- | ---------------- | -------------------------- |
| `queryId`       | ObjectId → Query | Related query              |
| `zoomLink`      | String           | Zoom meeting URL           |
| `scheduledTime` | Date             | Scheduled meeting time     |
| `recordingUrl`  | String           | Post-session recording URL |

### 6. Badge

| Field         | Type   | Details           |
| ------------- | ------ | ----------------- |
| `name`        | String | Unique badge name |
| `description` | String | Badge description |

### 7. UserBadge (Junction)

| Field         | Type             | Details                |
| ------------- | ---------------- | ---------------------- |
| `userId`      | ObjectId → User  | Badge recipient        |
| `badgeId`     | ObjectId → Badge | Awarded badge          |
| `awardedTime` | Date             | When badge was awarded |

**Index:** `{ userId, badgeId }` unique compound (prevents duplicates).

### 8. Leaderboard

| Field    | Type            | Details              |
| -------- | --------------- | -------------------- |
| `userId` | ObjectId → User | Unique per user      |
| `rank`   | Number          | Leaderboard position |
| `score`  | Number          | Points snapshot      |

Updated daily at midnight via `node-cron`.

### 9. Analytics

| Field        | Type   | Details                                                                               |
| ------------ | ------ | ------------------------------------------------------------------------------------- |
| `metricType` | Enum   | `QueryCount`, `ResponseCount`, `AvgResolutionTime`, `UserEngagement`, `CategoryUsage` |
| `value`      | Number | Metric value                                                                          |
| `timestamp`  | Date   | Measurement time                                                                      |

**Index:** `{ metricType, timestamp }` compound.

### 10. Notification

| Field          | Type             | Details                                                                |
| -------------- | ---------------- | ---------------------------------------------------------------------- |
| `userId`       | ObjectId → User  | Notification recipient                                                 |
| `type`         | Enum             | `NewQuery`, `QueryApproved`, `QueryRejected`, `NewResponse`, `General` |
| `title`        | String           | Notification title                                                     |
| `message`      | String           | Notification body                                                      |
| `relatedQuery` | ObjectId → Query | Optional link to a query                                               |
| `isRead`       | Boolean          | Read status (default: `false`)                                         |
| `createdAt`    | Date             | Creation time                                                          |

**Index:** `{ userId, isRead, createdAt }` compound.

### 11. Quiz

| Field         | Type            | Details                               |
| ------------- | --------------- | ------------------------------------- |
| `title`       | String          | Required, max 200 chars               |
| `description` | String          | Optional, max 500 chars               |
| `createdBy`   | ObjectId → User | Quiz creator (Moderator/Admin)        |
| `password`    | String          | bcrypt hashed quiz password           |
| `questions`   | [QuizQuestion]  | Embedded subdocuments                 |
| `duration`    | Number          | Time limit in minutes (min: 1)        |
| `expiresAt`   | Date            | Quiz availability deadline            |
| `isActive`    | Boolean         | Default `true`, set `false` on expiry |

**QuizQuestion subdocument:**

| Field           | Type     | Details                     |
| --------------- | -------- | --------------------------- |
| `question`      | String   | Question text               |
| `options`       | [String] | Answer options              |
| `correctAnswer` | Number   | Index of the correct option |

**Index:** `{ expiresAt, isActive }` compound.

### 12. QuizAttempt

| Field            | Type            | Details                        |
| ---------------- | --------------- | ------------------------------ |
| `quizId`         | ObjectId → Quiz | The quiz taken                 |
| `userId`         | ObjectId → User | The student                    |
| `answers`        | [Number]        | Selected option indices        |
| `score`          | Number          | Number of correct answers      |
| `totalQuestions` | Number          | Total questions in the quiz    |
| `startedAt`      | Date            | When the attempt began         |
| `completedAt`    | Date            | When the attempt was submitted |

**Index:** `{ quizId, userId }` unique compound (one attempt per user per quiz).

---

## Features in Detail

### 1. Authentication & Email Verification

**Registration Flow:**

1. Student submits name, email (`@iba-suk.edu.pk` only), and password
2. Server validates email domain — rejects non-university emails
3. Password is hashed with bcrypt (10 salt rounds)
4. A 32-byte random verification token is generated, SHA-256 hashed, and stored
5. Token expiration is set to **10 minutes** from creation
6. Verification email is sent via Brevo transactional API with a styled HTML template
7. User is created with `isVerified: false`
8. If email sending fails, the user record is deleted so they can retry

**Verification Flow:**

1. User clicks the email link → opens `/verify-email?token=<raw-token>`
2. Client sends token to `POST /api/auth/verify-email`
3. Server hashes the token with SHA-256 and looks up the user
4. If token is valid and not expired → user is marked `isVerified: true`
5. If token is expired → user must register again

**Login Restriction:**

- Users with `role: 'User'` and `isVerified: false` receive HTTP 403 with `needsVerification: true`
- The login page shows a "Resend verification email" option
- Admin and Moderator accounts bypass verification check

**Re-registration:**

- If an unverified user's token has expired, the system allows re-registration by deleting the stale record

**Resend Verification:**

- `POST /api/auth/resend-verification` generates a fresh 10-minute token
- Rate limited to 3 requests per minute
- Response is intentionally vague (doesn't reveal if email exists) for security

**Admin Registration:**

- Requires the `ADMIN_SECRET` environment variable to match
- No email verification needed — admin is immediately verified
- Returns JWT + user data on success

### 2. Forgot / Reset Password

**Forgot Password Flow:**

1. User enters email on `/forgot-password` page
2. Server generates a 32-byte reset token, hashes it with SHA-256, stores it with 1-hour expiry
3. Password reset email is sent via Brevo with a styled HTML template
4. Rate limited to 3 requests per minute
5. Response doesn't reveal whether the email exists (security best practice)

**Reset Password Flow:**

1. User clicks link → enters new password on `/reset-password` page
2. Server verifies the hashed token and checks expiration
3. New password is bcrypt-hashed and saved
4. Reset token is cleared from the database
5. A "password reset successful" confirmation email is sent

### 3. Query Posting with Voice, Video & File Attachments

**Query Creation:**

- Title (required, max 200 chars), description (optional), and category (MRC/PRC/ERC)
- Voice recording via browser `MediaRecorder` API (WebM format, 5-minute max)
- Video file upload (accept `video/*`, max 50 MB)
- File attachments via drag-and-drop (React Dropzone) — multiple files, max 50 MB each
- All files uploaded to **Cloudinary** via streaming upload

**Upload Process:**

1. Multer parses multipart form data into memory buffers
2. Each buffer is streamed to Cloudinary with auto resource-type detection
3. Cloudinary returns a secure HTTPS URL
4. URLs are stored in the Query/Attachment documents

**Supported File Types:**
`jpeg`, `jpg`, `png`, `gif`, `pdf`, `doc`, `docx`, `txt`, `mp3`, `wav`, `webm`, `mp4`, `mov`, `avi`, `mkv`, `zip`, `rar`, `7z`

**Moderation:**

- All new queries start as `moderationStatus: 'Pending'`
- Regular users only see `Approved` queries (unless viewing their own)
- Moderators and Admins see all queries

**Gamification:**

- Posting a query awards **+10 points** to the student

### 4. Moderation Queue & AI Draft Response

**Moderator Dashboard:**

- Three tabs: All Queries, Pending Approval, Active Queries
- Statistics cards: Pending count, Total active, Open, In Progress, My Responses, Today's responses
- Search by title/content/user, filter by category/status, sort by oldest/newest/category/status

**Query Approval/Rejection:**

- `POST /api/moderator/approve-query` — sets `moderationStatus: 'Approved'`
- `POST /api/moderator/reject-query` — sets `moderationStatus: 'Rejected'` with optional reason
- Rejection uses an in-app confirm dialog if no reason is provided

**AI Draft Generation:**

- `POST /api/moderator/generate-draft` — generates a response draft
- **Priority chain:**
  1. **OpenAI GPT-3.5-turbo** (if `OPENAI_API_KEY` is set) — 300 max tokens, 0.7 temperature
  2. **Google Gemini 1.5 Flash** (if `GEMINI_API_KEY` is set) — fallback
  3. **Template response** — if neither API key is configured, returns a generic template
- Response includes `{ draft, confidence, model }` so the moderator knows the source
- Drafts are **transient** — not saved until the moderator edits and explicitly submits

**Response Templates:**

- Pre-built templates: Acknowledgment, Need Clarification, Resolution, Escalation
- Moderator can select a template as a starting point

### 5. Real-Time Notifications

**When a student posts a query:**

- The server creates a `Notification` document for **every Moderator and Admin** in the system
- Notification type: `NewQuery`
- Contains the query title, category, and a link to the moderation queue

**Notification UI (TopNav):**

- Bell icon with unread count badge
- Auto-polls `GET /api/notifications/unread-count` every **30 seconds**
- Clicking the bell opens a dropdown panel with the latest 50 notifications
- Each notification shows title, message, and timestamp
- Clicking a notification marks it as read and navigates to the related query
- "Mark all read" button clears all unread notifications
- Dropdown closes when clicking outside (click-away listener)
- Dynamic aria-label shows unread count for screen readers

**Only visible to Moderators and Admins** — students do not see the notification bell.

### 6. Knowledge Base Search

- Full-text search across all `Approved` queries using MongoDB regex (case-insensitive)
- Filter by category (MRC, PRC, ERC)
- Configurable result limit
- Results show query title, category badge, status, author name, and creation date
- Click to view full query details with all responses
- Category counts via MongoDB aggregation (resolved queries only)

### 7. Gamification System

**Points:**

| Action               | Points         |
| -------------------- | -------------- |
| Post a query         | +10            |
| Post a peer response | +5             |
| Correct quiz answer  | +2 per correct |

**Badges:**

- Admin-created badge system (create/edit/delete badges)
- Badges awarded to specific users via the admin panel
- UserBadge junction table prevents duplicate awards
- Badges visible on user profiles and public profile pages

**Leaderboard:**

- Top 100 users ranked by points
- Generated on-the-fly when accessed (also synced to Leaderboard collection)
- Cron job rebuilds nightly at midnight
- Admin can manually refresh via `POST /api/gamification/update-leaderboard`
- Shows rank, user name, and score in a table

### 8. Quiz System

**Quiz Creation (Moderator/Admin):**

- Title, description, password, duration (minutes), expiry date
- Multiple choice questions with 2+ options and one correct answer
- Quiz password is bcrypt-hashed before storage

**Taking a Quiz (Student):**

1. Student sees list of active, non-expired quizzes
2. Student enters quiz password (verified via bcrypt, rate limited 10/15min)
3. On success, questions are returned (without correct answers)
4. Timer starts counting down based on quiz duration
5. Student selects answers and submits
6. If unanswered questions remain, an in-app confirm dialog warns before submission
7. Score is calculated, `score × 2` points awarded to the student
8. One attempt per student per quiz (enforced by unique compound index)

**Auto-Expiry:**

- Cron job runs every 5 minutes to deactivate quizzes past their `expiresAt` date

**Results:**

- Students see their own score and percentage after submission
- Quiz creators and admins can view all attempts via `GET /api/quizzes/:id/results`

### 9. Admin Dashboard & Analytics

**Admin Dashboard:**

- System-wide statistics: total users, queries, responses, categories
- User management: search, filter by role, change roles, adjust points, delete users
- Query management: view/filter/delete all queries
- Badge management: create badges, award to users, delete badges
- Response management: view/edit/delete all responses

**Analytics (Chart.js):**

- Metric types: `QueryCount`, `ResponseCount`, `AvgResolutionTime`, `UserEngagement`, `CategoryUsage`
- Time-series chart data for trend analysis
- Optional date range filtering
- Category usage breakdown
- Average resolution time in hours

### 10. Peer-to-Peer Responses

- Any authenticated user (not just moderators) can respond to approved queries
- Users **cannot** respond to their own queries (enforced server-side)
- Response form supports: text, voice recording, video upload, file attachments
- Auto-detects response type based on media attached
- Peer responses set query status to `InProgress` and award **+5 points**
- Moderator/Admin responses set query status to `Resolved`
- Responses display the responder's role

### 11. Zoom Session Scheduling

- Sessions linked to specific queries
- Stores Zoom meeting link and scheduled time
- Optional recording URL added after the session
- Mock implementation if Zoom API keys not configured
- Managed via `POST /api/sessions` endpoints (Mod/Admin only)

### 12. In-App Confirm Dialog

All destructive or important actions use a custom `ConfirmDialog` component instead of the browser's native `window.confirm()`:

- **Promise-based API:** `const ok = await confirm({ title, message, confirmLabel, tone })`
- **Keyboard accessible:** Tab trap between Cancel/Confirm, Escape to cancel, Enter to confirm
- **Focus management:** Auto-focuses Cancel button, restores previous focus on close
- **Body scroll lock:** Prevents background scrolling while dialog is open
- **Backdrop click dismiss:** Clicking outside the dialog cancels
- **Tone variants:** `primary` (question icon) and `danger` (warning icon with red styling)
- **ARIA compliant:** `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`

Used in: AdminBadges, AdminQueries, AdminResponses, AdminUsers, ModerationQueueDetail, ModeratorDashboard, Profile, QuizManagement, StudentQuiz.

---

## Complete REST API Reference

All endpoints are prefixed with `/api`. Authentication required unless marked 🔓 (public).

### Authentication (`/api/auth`)

| Method | Endpoint               | Auth | Rate Limit | Description                                                          |
| ------ | ---------------------- | ---- | ---------- | -------------------------------------------------------------------- |
| POST   | `/register`            | 🔓   | 10/15min   | Register student (only `@iba-suk.edu.pk`). Sends verification email. |
| POST   | `/verify-email`        | 🔓   | —          | Verify email with token. Body: `{ token }`                           |
| POST   | `/resend-verification` | 🔓   | 3/min      | Resend verification email. Body: `{ email }`                         |
| POST   | `/admin/register`      | 🔓   | —          | Register admin (requires `adminSecret`). Returns JWT + user.         |
| POST   | `/login`               | 🔓   | 10/15min   | Login. Returns JWT + user. 403 if unverified.                        |
| POST   | `/forgot-password`     | 🔓   | 3/min      | Request password reset. Body: `{ email }`                            |
| POST   | `/reset-password`      | 🔓   | —          | Reset password. Body: `{ token, password }`                          |
| GET    | `/me`                  | 🔒   | —          | Get current authenticated user profile.                              |

### Profile (`/api/profile`)

| Method | Endpoint         | Auth | Description                                              |
| ------ | ---------------- | ---- | -------------------------------------------------------- |
| GET    | `/`              | 🔒   | Get current user profile                                 |
| GET    | `/:id`           | 🔒   | Get any user's public profile (with badges & quiz stats) |
| PATCH  | `/`              | 🔒   | Update name, bio                                         |
| POST   | `/picture`       | 🔒   | Upload profile picture (image only, to Cloudinary)       |
| DELETE | `/picture`       | 🔒   | Remove profile picture                                   |
| POST   | `/skills`        | 🔒   | Add a skill (max 50 chars, case-insensitive dedup)       |
| DELETE | `/skills/:skill` | 🔒   | Remove a skill                                           |

### Queries (`/api/queries`)

| Method | Endpoint      | Auth         | Description                                                                                         |
| ------ | ------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| GET    | `/`           | 🔒           | Get queries (filters: `category`, `status`, `userId`, `search`, `moderationStatus`)                 |
| GET    | `/:id`        | 🔒           | Get single query with responses                                                                     |
| POST   | `/`           | 🔒           | Create query (multipart: `title`, `content`, `category`, `attachments[]`, `voiceFile`, `videoFile`) |
| PATCH  | `/:id/status` | 🔒 Mod/Admin | Update query status (`Open`, `InProgress`, `Resolved`)                                              |

### Responses (`/api/responses`)

| Method | Endpoint | Auth | Description                                                                                                       |
| ------ | -------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| GET    | `/`      | 🔒   | Get responses (filter: `queryId`)                                                                                 |
| POST   | `/`      | 🔒   | Create response (multipart: `queryId`, `responseText`, `responseType`, `voiceFile`, `videoFile`, `attachments[]`) |

### Knowledge Base (`/api/kb`)

| Method | Endpoint      | Auth | Description                                                     |
| ------ | ------------- | ---- | --------------------------------------------------------------- |
| GET    | `/search`     | 🔒   | Regex search across approved queries (`q`, `category`, `limit`) |
| GET    | `/categories` | 🔒   | Get resolved query counts by category                           |

### Moderation (`/api/moderator`)

| Method | Endpoint           | Auth         | Description                                                                    |
| ------ | ------------------ | ------------ | ------------------------------------------------------------------------------ |
| GET    | `/queue`           | 🔒 Mod/Admin | Get moderation queue (filter: `type=all\|pending\|active`)                     |
| POST   | `/approve-query`   | 🔒 Mod/Admin | Approve pending query. Body: `{ queryId }`                                     |
| POST   | `/reject-query`    | 🔒 Mod/Admin | Reject pending query. Body: `{ queryId, rejectionReason? }`                    |
| POST   | `/generate-draft`  | 🔒 Mod/Admin | Generate AI draft. Body: `{ queryId }`. Returns `{ draft, confidence, model }` |
| POST   | `/submit-response` | 🔒 Mod/Admin | Submit response. Body: `{ queryId, responseText, responseType }`               |
| GET    | `/templates`       | 🔒 Mod/Admin | Get response templates (Acknowledgment, Clarification, Resolution, Escalation) |
| POST   | `/close-query`     | 🔒 Mod/Admin | Close a query. Body: `{ queryId }`                                             |
| GET    | `/stats`           | 🔒 Mod/Admin | Get moderator statistics                                                       |

### Admin (`/api/admin`)

| Method | Endpoint             | Auth     | Description                                     |
| ------ | -------------------- | -------- | ----------------------------------------------- |
| GET    | `/users`             | 🔒 Admin | Get all users (pagination, search, role filter) |
| GET    | `/users/:id`         | 🔒 Admin | Get single user                                 |
| PATCH  | `/users/:id/role`    | 🔒 Admin | Change user role (cannot change own)            |
| PATCH  | `/users/:id/points`  | 🔒 Admin | Set user points                                 |
| DELETE | `/users/:id`         | 🔒 Admin | Delete user + all related data                  |
| GET    | `/queries`           | 🔒 Admin | Get all queries (pagination, filters)           |
| PATCH  | `/queries/:id`       | 🔒 Admin | Update query (title, status, category)          |
| DELETE | `/queries/:id`       | 🔒 Admin | Delete query + responses & attachments          |
| GET    | `/responses`         | 🔒 Admin | Get all responses (pagination, filter)          |
| PATCH  | `/responses/:id`     | 🔒 Admin | Update response text/type                       |
| DELETE | `/responses/:id`     | 🔒 Admin | Delete response                                 |
| GET    | `/badges`            | 🔒 Admin | Get all badges                                  |
| POST   | `/badges`            | 🔒 Admin | Create badge (name + description)               |
| PATCH  | `/badges/:id`        | 🔒 Admin | Update badge                                    |
| DELETE | `/badges/:id`        | 🔒 Admin | Delete badge + user associations                |
| POST   | `/badges/:id/assign` | 🔒 Admin | Assign badge to user                            |

### Gamification (`/api/gamification`)

| Method | Endpoint              | Auth     | Description                  |
| ------ | --------------------- | -------- | ---------------------------- |
| GET    | `/points`             | 🔒       | Get current user's points    |
| GET    | `/badges`             | 🔒       | Get current user's badges    |
| GET    | `/leaderboard`        | 🔒       | Get leaderboard (top 100)    |
| POST   | `/update-leaderboard` | 🔒 Admin | Manually refresh leaderboard |
| POST   | `/award-badge`        | 🔒 Admin | Award badge to a user        |

### Quizzes (`/api/quizzes`)

| Method | Endpoint               | Auth         | Rate Limit | Description                                                |
| ------ | ---------------------- | ------------ | ---------- | ---------------------------------------------------------- |
| POST   | `/`                    | 🔒 Mod/Admin | —          | Create quiz (title, password, questions, duration, expiry) |
| GET    | `/`                    | 🔒           | —          | List quizzes (role-aware filtering)                        |
| POST   | `/:id/verify-password` | 🔒           | 10/15min   | Verify quiz password, returns questions (no answers)       |
| POST   | `/:id/submit`          | 🔒           | —          | Submit quiz answers, get score, earn points                |
| GET    | `/my-attempts`         | 🔒           | —          | Get current user's quiz attempts                           |
| GET    | `/:id/results`         | 🔒 Mod/Admin | —          | Get all attempts for a quiz                                |
| DELETE | `/:id`                 | 🔒 Mod/Admin | —          | Delete quiz + all attempts                                 |

### Analytics (`/api/analytics`)

| Method | Endpoint     | Auth     | Description                                                     |
| ------ | ------------ | -------- | --------------------------------------------------------------- |
| GET    | `/dashboard` | 🔒 Admin | Dashboard metrics (queryCount, responseCount, avgResTime, etc.) |
| GET    | `/metrics`   | 🔒 Admin | Time-series Analytics docs (filter by metricType, days)         |

### Sessions (`/api/sessions`)

| Method | Endpoint         | Auth         | Description                       |
| ------ | ---------------- | ------------ | --------------------------------- |
| POST   | `/schedule`      | 🔒 Mod/Admin | Schedule Zoom session for a query |
| PATCH  | `/:id/recording` | 🔒 Mod/Admin | Update session with recording URL |

### Notifications (`/api/notifications`)

| Method | Endpoint         | Auth | Description                      |
| ------ | ---------------- | ---- | -------------------------------- |
| GET    | `/`              | 🔒   | Get notifications (latest 50)    |
| GET    | `/unread-count`  | 🔒   | Get unread notification count    |
| PATCH  | `/:id/read`      | 🔒   | Mark single notification as read |
| PATCH  | `/mark-all-read` | 🔒   | Mark all notifications as read   |

### Health Check

| Method | Endpoint      | Auth | Description                           |
| ------ | ------------- | ---- | ------------------------------------- |
| GET    | `/api/health` | 🔓   | Returns `{ status: 'ok', timestamp }` |

---

## Security Implementation

| Layer                    | Mechanism                | Details                                                                                                            |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **HTTPS Headers**        | Helmet.js                | Sets `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, referrer policy      |
| **Authentication**       | JWT (HS256)              | Stateless tokens with configurable expiry (default: 7 days). Token sent via `Authorization: Bearer <token>` header |
| **Password Storage**     | bcryptjs                 | 10 salt rounds; passwords never stored in plaintext                                                                |
| **Token Security**       | SHA-256 hashing          | Verification and reset tokens are hashed before database storage; raw tokens only exist in emails                  |
| **Input Validation**     | express-validator        | All routes validate and sanitize inputs (trim, normalizeEmail, isLength, isIn, etc.)                               |
| **File Upload Security** | Multer file filter       | Whitelist of allowed extensions and MIME types; 50 MB size limit                                                   |
| **Role-Based Access**    | `authorize()` middleware | Routes restricted by user role (`Admin`, `Moderator`, `User`)                                                      |
| **Rate Limiting**        | express-rate-limit       | Global: 100 req/min per IP; Auth: 10/15min; Verification: 3/min; Quiz password: 10/15min                           |
| **CORS**                 | cors middleware          | Configurable allowed origins; open in production, restricted in development                                        |
| **Email Security**       | Vague responses          | Forgot-password and resend-verification responses don't reveal whether an email exists                             |
| **Data Exposure**        | Field selection          | `passwordHash` is excluded from all API responses via `.select('-passwordHash')`                                   |
| **Self-Protection**      | Role change guards       | Admins cannot change their own role or delete themselves                                                           |
| **Quiz Security**        | bcrypt passwords         | Quiz access passwords are hashed; correct answers never sent to client until after submission                      |
| **Compression**          | compression middleware   | Gzip compression for all responses                                                                                 |
| **Proxy Trust**          | `trust proxy: 1`         | Configured for Render.com deployment behind a reverse proxy                                                        |

---

## Error Logging System

**Log Location:** `server/logs/error-YYYY-MM-DD.log`

**What Gets Logged:**

| Event                                  | Log Type              |
| -------------------------------------- | --------------------- |
| Any API response with status ≥ 400     | `API_ERROR`           |
| Express error handler catches an error | `SERVER_CRASH`        |
| Unhandled Promise rejection            | `UNHANDLED_REJECTION` |
| Uncaught exception                     | `UNCAUGHT_EXCEPTION`  |

**Log Format:**

```
[2026-04-20T10:30:00.000Z] [API_ERROR] POST /api/auth/login 401 Duration: 15ms
[2026-04-20T10:30:05.000Z] [SERVER_CRASH] POST /api/queries: Cannot read properties... Duration: Error stack...
```

**Features:**

- Daily rotating log files (one file per day)
- Automatic `logs/` directory creation on server start
- Logs include timestamp, error type, HTTP method, URL, status code, and duration
- Stack traces included for server crashes and unhandled exceptions

---

## Performance & Scalability

| Metric                    | Implementation                                                             |
| ------------------------- | -------------------------------------------------------------------------- |
| **Gzip Compression**      | All responses compressed via `compression` middleware                      |
| **Database Indexes**      | 8+ compound indexes on frequently queried fields                           |
| **Connection Pooling**    | MongoDB Atlas handles connection pooling automatically                     |
| **Async Handlers**        | All Express route handlers use async/await — no blocking                   |
| **Code Splitting**        | Vite automatically splits vendor code from app code                        |
| **Static Asset Caching**  | Production static files served with `max-age: 1h`                          |
| **50 Query Limit**        | Default pagination limit prevents large result sets                        |
| **Multer Memory Storage** | Files buffered in memory for fast streaming to Cloudinary                  |
| **Text Search Index**     | MongoDB text index on Query `{ title, content }` for knowledge base search |
| **CDN File Delivery**     | Cloudinary serves files via global CDN with HTTPS                          |
| **SPA Fallback**          | All non-API routes serve `index.html` for client-side routing              |
| **100+ Users**            | Express + MongoDB Atlas + gzip handles 100 concurrent connections          |

---

## PWA & Responsive Design

**Progressive Web App:**

- Generated via `vite-plugin-pwa` with Workbox
- Auto-update service worker registration (`registerType: 'autoUpdate'`)
- Caches all JS, CSS, HTML, and image assets for offline access
- `manifest.json`: app name "SIBA Digital Academic Support", standalone display mode, cream theme color (`#FEFAE0`)
- Installable on Android and iOS home screens

**Responsive Design:**

- Tailwind CSS utility classes for all breakpoints (`sm`, `md`, `lg`)
- Mobile-first design approach
- Sidebar collapses on small screens with hamburger toggle
- Forms and cards stack vertically on mobile
- TopNav adapts: hides username text on mobile, shows only avatar
- Landing page uses responsive grid with editorial layout

---

## Accessibility

The frontend implements several accessibility best practices:

| Feature                         | Details                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| **Semantic ARIA attributes**    | `aria-hidden="true"` on decorative SVG icons throughout all components                  |
| **ARIA labels on icon buttons** | Sidebar toggle, logout, notification bell, profile link all have `aria-label`           |
| **Active page indicator**       | Sidebar uses `aria-current="page"` on the active route                                  |
| **Search landmark**             | Search form has `role="search"` and a `sr-only` label                                   |
| **Form validation ARIA**        | Invalid fields use `aria-invalid` for screen reader announcements                       |
| **Dialog accessibility**        | ConfirmDialog uses `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby` |
| **Focus management**            | ConfirmDialog traps focus, restores it on close; auto-focuses Cancel button             |
| **Keyboard navigation**         | Tab cycles between dialog buttons; Escape closes; Enter confirms                        |
| **Reduced motion**              | `@media (prefers-reduced-motion: reduce)` disables all animations and transitions       |
| **Focus visible outlines**      | Custom `:focus-visible` ring (`2px solid #6D7A52`) on all interactive elements          |
| **Text selection**              | Custom `::selection` styling for readability                                            |
| **Password toggle labels**      | Show/Hide password buttons have dynamic `aria-label`                                    |
| **Notification count**          | Bell button `aria-label` includes unread count (e.g., "Notifications, 3 unread")        |

---

## Design System & Color Palette

The application uses a warm, earthy design system with serif typography for headings.

### Typography

| Usage     | Font Family                         | Weights Used       |
| --------- | ----------------------------------- | ------------------ |
| Body text | Inter (sans-serif)                  | 400, 500, 600, 700 |
| Headings  | Fraunces (serif / variable optical) | 400–800            |
| Display   | Fraunces (serif)                    | 600, 700           |

### Color Palette

**Primary (Sage Green)** — used for actions, links, active states:

| Token         | Hex       | Usage                                      |
| ------------- | --------- | ------------------------------------------ |
| `primary-50`  | `#F7F8EF` | Lightest background tint                   |
| `primary-100` | `#EEF1DD` | Active sidebar item background, badges     |
| `primary-200` | `#DCE2BB` | Text selection background                  |
| `primary-500` | `#A6B37D` | Mid-tone accent                            |
| `primary-700` | `#6D7A52` | **Primary button background**, focus rings |
| `primary-800` | `#535D3E` | Button hover, link color                   |
| `primary-900` | `#3B422B` | Active text on primary backgrounds         |

**Accent (Warm Tan/Brown)** — used for secondary highlights, badges, status colors:

| Token        | Hex       | Usage                                        |
| ------------ | --------- | -------------------------------------------- |
| `accent-50`  | `#FAF3EB` | Lightest accent background                   |
| `accent-100` | `#F3E5D1` | Badge background                             |
| `accent-600` | `#A37F5D` | Accent button background, notification count |
| `accent-700` | `#82644A` | Badge icons, "In Progress" buttons           |
| `accent-800` | `#5F4937` | Accent text                                  |

**Surface (Earthy Neutrals / Cream)** — used for backgrounds, text, borders:

| Token         | Hex       | Usage                          |
| ------------- | --------- | ------------------------------ |
| `surface-50`  | `#FEFAE0` | **Page background** (cream)    |
| `surface-100` | `#F5EBCD` | Muted card background          |
| `surface-200` | `#E8DCB5` | Borders, dividers              |
| `surface-300` | `#D4C79D` | Input borders, scrollbar thumb |
| `surface-500` | `#7E724E` | Secondary text                 |
| `surface-600` | `#5C532F` | Body text, descriptions        |
| `surface-800` | `#2B2817` | **Primary body text**          |
| `surface-900` | `#18160C` | **Heading text**, darkest      |

**Utility Colors:**

| Color        | Hex        | Usage                    |
| ------------ | ---------- | ------------------------ |
| `cream`      | `#FEFAE0`  | Shorthand for surface-50 |
| `red-700`    | (Tailwind) | Danger buttons, errors   |
| `red-50/100` | (Tailwind) | Error backgrounds        |
| `white`      | `#FFFFFF`  | Card backgrounds         |

### Component Classes

| Class            | Description                                        |
| ---------------- | -------------------------------------------------- |
| `.card`          | White card with border, shadow, rounded corners    |
| `.card-hover`    | Adds hover shadow elevation                        |
| `.card-muted`    | Cream-toned card with subtle border                |
| `.glass-card`    | White card with soft shadow                        |
| `.input-modern`  | Styled text input with focus ring                  |
| `.btn-primary`   | Sage green button (primary-700 bg)                 |
| `.btn-secondary` | White outlined button                              |
| `.btn-accent`    | Tan/brown button (accent-600 bg)                   |
| `.btn-danger`    | Red button (red-700 bg)                            |
| `.btn-ghost`     | Transparent button with hover background           |
| `.stat-card`     | Card with left accent bar (color via CSS variable) |
| `.badge`         | Small rounded-full pill for labels                 |
| `.section-title` | Serif 2xl heading                                  |
| `.page-title`    | Serif 3xl–4xl heading                              |
| `.eyebrow`       | Uppercase tracking-wide small label                |
| `.prose-muted`   | Muted paragraph text                               |
| `.hr-soft`       | Subtle horizontal rule                             |

### Shadow Scale

| Name         | Value                                                          | Usage           |
| ------------ | -------------------------------------------------------------- | --------------- |
| `card`       | `0 1px 2px rgba(63,58,34,0.04), 0 1px 3px rgba(63,58,34,0.03)` | Default card    |
| `card-hover` | `0 4px 12px rgba(63,58,34,0.06)`                               | Hovered card    |
| `soft`       | `0 2px 8px rgba(63,58,34,0.05)`                                | Glass card      |
| `lift`       | `0 8px 24px rgba(63,58,34,0.08)`                               | Modals, dialogs |

### Animations

| Name         | Duration | Effect                                |
| ------------ | -------- | ------------------------------------- |
| `fade-in`    | 0.4s     | Opacity 0 → 1                         |
| `fade-in-up` | 0.5s     | Opacity 0 + translateY(12px) → normal |
| `page-enter` | 0.4s     | Same as fadeInUp, used on page mount  |

---

## Environment Variables

### Server (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sdasp?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Admin Registration
ADMIN_SECRET=your-admin-secret-key

# AI Services (both optional — falls back to templates)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...

# Email (Brevo Transactional)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=your-sender@domain.com

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Zoom (optional)
ZOOM_API_KEY=your-zoom-key
ZOOM_API_SECRET=your-zoom-secret
```

### Client (`client/.env`)

```env
VITE_API_URL=/api
```

---

## Installation & Setup

### Prerequisites

- Node.js ≥ 18.0
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Brevo account (for transactional emails)
- (Optional) OpenAI API key and/or Google Gemini API key

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/darshanchelani/SIBADigitalAcademicSupportPlatform.git
cd SIBADigitalAcademicSupportPlatform

# 2. Install all dependencies (root + client + server)
npm run install:all

# 3. Create server/.env file with the variables listed above

# 4. Start both client and server in development mode
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`. The Vite dev server proxies `/api` requests to the server.

---

## Running the Application

```bash
# Development (client + server with hot reload)
npm run dev

# Production build
npm run build        # Builds client/dist and installs server deps

# Start production server
npm start            # Serves client/dist + API from port 5000
```

---

## Testing

```bash
cd server
npm test             # Runs Jest test suite
```

Test files:

- `tests/auth.test.js` — Registration, login, email verification
- `tests/query.test.js` — Query posting and retrieval
- `tests/moderator.test.js` — Moderation approval/rejection flow

---

## Deployment

The project is configured for **Render.com** via `render.yaml`:

- **Service type:** Web service (Node.js)
- **Build command:** `npm run build` (installs deps + builds Vite client)
- **Start command:** `npm start` (runs `node server/index.js`)
- **Plan:** Free tier
- **Environment variables:** Configured in Render dashboard (see `render.yaml` for the full list)

The server serves the built `client/dist` as static files with a SPA fallback (all non-API routes return `index.html`).

---

## Scheduled Jobs (Cron)

| Schedule             | Job                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `0 0 * * *` (daily)  | Rebuild leaderboard — top 100 users by points                       |
| `*/5 * * * *` (5min) | Deactivate expired quizzes (`isActive: true` && `expiresAt <= now`) |

---

## Third-Party Services

| Service                       | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| **MongoDB Atlas**             | Cloud-hosted database                                    |
| **Cloudinary**                | File storage (images, audio, video, documents, avatars)  |
| **Brevo** (Sendinblue)        | Transactional emails (verification, reset, confirmation) |
| **OpenAI** (GPT-3.5-turbo)    | AI draft response generation (primary)                   |
| **Google Gemini** (1.5 Flash) | AI draft response generation (fallback)                  |
| **Zoom** (optional)           | Session scheduling (mock if no API keys)                 |
| **Google Fonts**              | Inter + Fraunces font loading                            |

---

## Troubleshooting

| Issue                           | Solution                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Email not sending               | Check `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` in `.env`                            |
| AI drafts returning template    | Ensure `OPENAI_API_KEY` or `GEMINI_API_KEY` is set                                  |
| File upload failing             | Verify Cloudinary credentials (`CLOUD_NAME`, `API_KEY`, `API_SECRET`)               |
| Login returns 403               | User email not verified — check inbox or resend verification                        |
| CORS errors in development      | Ensure Vite proxy is configured (`/api` → `http://localhost:5000`)                  |
| Quiz not appearing for students | Check quiz `isActive` and `expiresAt` — cron may have deactivated it                |
| Leaderboard empty               | Wait for midnight cron or call `POST /api/gamification/update-leaderboard` as admin |

---

## License

This project is private and built for Sukkur IBA University.
