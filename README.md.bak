# SDASP — Sukkur IBA Digital Academic Support Platform

> A full-stack Progressive Web Application (PWA) built for **Sukkur IBA University** that automates the student query–response workflow with AI-powered moderation, real-time notifications, gamification, and an admin analytics dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Project Structure](#project-structure)
5. [Database Schema (10 Collections)](#database-schema-10-collections)
6. [Features in Detail](#features-in-detail)
   - [Authentication & Email Verification](#1-authentication--email-verification)
   - [Forgot / Reset Password](#2-forgot--reset-password)
   - [Query Posting with Voice, Video & File Attachments](#3-query-posting-with-voice-video--file-attachments)
   - [Moderation Queue & AI Draft Response](#4-moderation-queue--ai-draft-response)
   - [Real-Time Notifications](#5-real-time-notifications)
   - [Knowledge Base Search](#6-knowledge-base-search)
   - [Gamification System](#7-gamification-system)
   - [Admin Dashboard & Analytics](#8-admin-dashboard--analytics)
   - [Peer-to-Peer Responses](#9-peer-to-peer-responses)
   - [Zoom Session Scheduling](#10-zoom-session-scheduling)
7. [Complete REST API Reference](#complete-rest-api-reference)
8. [Security Implementation](#security-implementation)
9. [Error Logging System](#error-logging-system)
10. [Performance & Scalability](#performance--scalability)
11. [PWA & Responsive Design](#pwa--responsive-design)
12. [Environment Variables](#environment-variables)
13. [Installation & Setup](#installation--setup)
14. [Running the Application](#running-the-application)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)
18. [License](#license)

---

## Project Overview

SDASP is a university-wide query resolution platform designed exclusively for Sukkur IBA University students and staff. Students submit queries (text, voice, video, or file attachments) which go through a moderation pipeline. Moderators can leverage AI-generated draft responses (OpenAI GPT / Google Gemini) to respond efficiently. The system includes gamification (points, badges, leaderboards), a knowledge base of resolved queries, admin analytics, and a full notification system.

### Key Highlights

| Requirement                      | Implementation                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| **Restricted sign-up**           | Only `@iba-suk.edu.pk` university emails accepted                                    |
| **Email verification**           | Verification token sent on registration; expires in **10 minutes**                   |
| **Login blocked until verified** | Unverified users cannot access the system                                            |
| **Password reset via email**     | Secure token-based reset with 1-hour expiry                                          |
| **HTTPS on all endpoints**       | Helmet.js sets Strict-Transport-Security, X-Frame-Options, CSP headers               |
| **RESTful API design**           | All 11 modules accessed via versioned REST endpoints                                 |
| **Email notification service**   | Account verification, password reset, password reset success emails                  |
| **Error logging system**         | Daily rotating log files — failed API requests, server crashes, unhandled rejections |
| **PWA manifest + responsive**    | Installable on mobile browsers; works offline for cached pages                       |
| **Pages load under 3 seconds**   | Vite code-splitting + gzip compression + CDN-ready static assets                     |
| **100 concurrent users**         | MongoDB Atlas connection pooling + Express async handlers + compressed responses     |
| **File storage**                 | Cloudinary (images, audio, video, documents — up to 50 MB)                           |
| **AI draft responses**           | OpenAI GPT-3.5-turbo primary; Google Gemini 1.5 Flash fallback; template fallback    |
| **Moderator notifications**      | Real-time notification bell with unread count; auto-polls every 30 seconds           |

---

## Technology Stack

### Frontend (Client)

| Technology                 | Version     | Purpose                       |
| -------------------------- | ----------- | ----------------------------- |
| React                      | 18.2+       | UI component library          |
| Vite                       | 5.0+        | Build tool & dev server       |
| Tailwind CSS               | 3.3+        | Utility-first CSS framework   |
| React Router DOM           | 6.20+       | Client-side routing           |
| Axios                      | 1.6+        | HTTP client                   |
| React Hot Toast            | 2.4+        | Toast notifications           |
| React Dropzone             | 14.2+       | Drag & drop file uploads      |
| Chart.js + react-chartjs-2 | 4.4+ / 5.2+ | Analytics charts              |
| vite-plugin-pwa            | 0.17+       | PWA service worker generation |
| Workbox                    | 7.0+        | Offline caching strategies    |

### Backend (Server)

| Technology         | Version | Purpose                                      |
| ------------------ | ------- | -------------------------------------------- |
| Node.js            | ≥ 18.0  | JavaScript runtime                           |
| Express.js         | 4.18+   | Web framework                                |
| Mongoose           | 8.0+    | MongoDB ODM                                  |
| JWT (jsonwebtoken) | 9.0+    | Stateless authentication                     |
| bcryptjs           | 2.4+    | Password hashing (10 salt rounds)            |
| Nodemailer         | 7.0+    | SMTP email sending                           |
| Multer             | 1.4+    | Multipart form-data parsing (memory storage) |
| Cloudinary         | 2.x     | Cloud file storage (images, audio, video)    |
| Helmet             | 8.x     | Security HTTP headers                        |
| Compression        | 1.x     | Gzip response compression                    |
| express-validator  | 7.0+    | Request body validation & sanitization       |
| Axios              | 1.6+    | AI API HTTP calls (OpenAI, Gemini)           |
| node-cron          | 3.0+    | Scheduled leaderboard updates                |
| dotenv             | 16.3+   | Environment variable management              |

### Database

| Technology       | Purpose                      |
| ---------------- | ---------------------------- |
| MongoDB Atlas    | Cloud-hosted MongoDB cluster |
| Mongoose Schemas | 10 collections with indexes  |

### DevOps & Tooling

| Tool             | Purpose                                |
| ---------------- | -------------------------------------- |
| Nodemon          | Auto-restart server on file changes    |
| Jest + Supertest | Server-side unit & integration testing |
| ESLint           | JavaScript/JSX linting                 |
| Prettier         | Code formatting                        |
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
│  │  /api/notifications /api/profile     /api/health               │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ JWT Auth │  │ Multer   │  │ AI Module │  │ Cron Jobs        │   │
│  │Middleware│  │ Upload   │  │ OpenAI/   │  │ (Leaderboard     │   │
│  │+ Roles  │  │ (Memory) │  │ Gemini    │  │  daily update)   │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
│                          │                                           │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
   │  MongoDB    │ │ Cloudinary  │ │  Gmail SMTP  │
   │  Atlas      │ │ File Storage│ │  Email Svc   │
   │  (10 cols)  │ │ (img,audio, │ │  (verify,    │
   │             │ │  video,docs)│ │   reset)     │
   └─────────────┘ └─────────────┘ └──────────────┘
```

---

## Project Structure

```
SDASP/
├── package.json                    # Root — concurrently runs client + server
├── README.md                       # This file
│
├── client/                         # ── FRONTEND (React + Vite + Tailwind) ──
│   ├── package.json                # Client dependencies
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite config (PWA plugin, proxy /api)
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS (autoprefixer + tailwind)
│   ├── public/
│   │   └── manifest.json           # PWA manifest (icons, theme, display)
│   └── src/
│       ├── main.jsx                # React entry — BrowserRouter + StrictMode
│       ├── App.jsx                 # Routes definition + ProtectedRoute HOC
│       ├── index.css               # Tailwind @import directives
│       ├── contexts/
│       │   └── AuthContext.jsx     # Auth provider — login, register, logout, token mgmt
│       ├── components/
│       │   ├── Layout.jsx          # Dashboard shell — TopNav + Sidebar + Outlet
│       │   ├── TopNav.jsx          # Top navigation — search, notifications bell, profile
│       │   ├── Sidebar.jsx         # Side nav — role-aware menu links
│       │   └── ErrorBoundary.jsx   # React error boundary wrapper
│       └── pages/
│           ├── Landing.jsx         # Public landing page
│           ├── Login.jsx           # Login form + unverified email resend option
│           ├── Register.jsx        # Registration (restricted to @iba-suk.edu.pk)
│           ├── VerifyEmail.jsx     # Email verification token handler
│           ├── ForgotPassword.jsx  # Request password reset email
│           ├── ResetPassword.jsx   # Set new password with token
│           ├── AdminLogin.jsx      # Admin-specific login
│           ├── AdminRegister.jsx   # Admin registration (requires admin secret)
│           ├── StudentDashboard.jsx# Student home — my queries, quick actions
│           ├── ModeratorDashboard.jsx # Moderation queue — tabs, filters, approve/reject
│           ├── ModerationQueueDetail.jsx # Single query — AI draft editor, responses
│           ├── AdminDashboard.jsx  # Admin overview — stats, charts
│           ├── AdminUsers.jsx      # User management (CRUD)
│           ├── AdminQueries.jsx    # All queries management
│           ├── AdminBadges.jsx     # Badge management
│           ├── AdminResponses.jsx  # All responses management
│           ├── QueryForm.jsx       # Post new query — voice recording, file upload
│           ├── ResponseView.jsx    # View query + responses + post reply
│           ├── KBSearch.jsx        # Knowledge base full-text search
│           ├── Gamification.jsx    # Points, badges, leaderboard
│           ├── Analytics.jsx       # Admin analytics charts (Chart.js)
│           └── Profile.jsx         # User profile — edit name, bio, skills, avatar
│
└── server/                         # ── BACKEND (Express.js + Node.js) ──
    ├── package.json                # Server dependencies
    ├── index.js                    # Express app — middleware, routes, error handler
    ├── jest.config.js              # Jest test configuration
    ├── .env                        # Environment variables (not committed)
    ├── logs/                       # Auto-created — daily error log files
    │   └── error-YYYY-MM-DD.log   # Rotating daily error logs
    ├── middleware/
    │   ├── auth.js                 # JWT authenticate + role authorize middleware
    │   ├── ai.js                   # AI draft generation (OpenAI → Gemini → fallback)
    │   └── upload.js               # Multer config (memory storage, 50MB limit, file filter)
    ├── models/
    │   └── index.js                # All 10 Mongoose schemas + indexes + exports
    ├── routes/
    │   ├── auth.js                 # Register, login, verify-email, forgot/reset password
    │   ├── profile.js              # User profile CRUD
    │   ├── queries.js              # Query CRUD + moderator notifications
    │   ├── responses.js            # Response creation (peers + moderators)
    │   ├── kb.js                   # Knowledge base search
    │   ├── moderator.js            # Moderation queue, approve/reject, AI draft, templates
    │   ├── admin.js                # Admin user/query/badge management
    │   ├── gamification.js         # Points, badges, leaderboard
    │   ├── analytics.js            # Dashboard metrics + time-series data
    │   ├── sessions.js             # Zoom session scheduling
    │   └── notifications.js        # Notification CRUD (get, read, mark-all-read)
    ├── utils/
    │   ├── firebase.js             # Cloudinary upload utility (renamed for compatibility)
    │   ├── email.js                # Nodemailer — verification, reset, success emails
    │   └── cron.js                 # Daily leaderboard update (midnight cron)
    └── tests/
        ├── setup.js                # Jest test setup (test DB connection)
        ├── auth.test.js            # Authentication endpoint tests
        ├── query.test.js           # Query posting tests
        └── moderator.test.js       # Moderation flow tests
```

---

## Database Schema (10 Collections)

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
| `verificationTokenExpires` | Date     | Expiration timestamp (**10 minutes** after creation)                      |
| `resetPasswordToken`       | String   | SHA-256 hashed password reset token                                       |
| `resetPasswordExpires`     | Date     | Expiration timestamp (1 hour after creation)                              |
| `createdAt` / `updatedAt`  | Date     | Mongoose timestamps                                                       |

**Index:** Unique index on `email` (auto-created by `unique: true`).

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

**Index:** `{ userId, isRead, createdAt }` compound for efficient queries.

---

## Features in Detail

### 1. Authentication & Email Verification

**Registration Flow:**

1. Student submits name, email (`@iba-suk.edu.pk` only), and password
2. Server validates email domain — rejects non-university emails
3. Password is hashed with bcrypt (10 salt rounds)
4. A 32-byte random verification token is generated, SHA-256 hashed, and stored
5. Token expiration is set to **10 minutes** from creation
6. Verification email is sent via Gmail SMTP with a clickable link
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
- Response is intentionally vague (doesn't reveal if email exists) for security

### 2. Forgot / Reset Password

**Forgot Password Flow:**

1. User enters email on `/forgot-password` page
2. Server generates a 32-byte reset token, hashes it with SHA-256, stores it with 1-hour expiry
3. Password reset email is sent with a link to `/reset-password?token=<raw-token>`
4. Response doesn't reveal whether the email exists (security best practice)

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

- Posting a query awards **10 points** to the student

### 4. Moderation Queue & AI Draft Response

**Moderator Dashboard:**

- Three tabs: All Queries, Pending Approval, Active Queries
- Statistics cards: Pending count, Total active, Open, In Progress, My Responses, Today's responses
- Search by title/content/user, filter by category/status, sort by oldest/newest/category/status

**Query Approval/Rejection:**

- `POST /api/moderator/approve-query` — sets `moderationStatus: 'Approved'`
- `POST /api/moderator/reject-query` — sets `moderationStatus: 'Rejected'` with optional reason

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
- `GET /api/moderator/templates` returns all available templates

**Moderation Queue Detail Page:**

- Split-screen layout: Query details (left) | Draft editor (right)
- Generate AI draft, edit the text, select response type (Text/Audio/Video)
- View existing responses below the editor
- Submit final response → query status becomes `Resolved`
- Close query option → status becomes `Closed`

### 5. Real-Time Notifications

**When a student posts a query:**

- The server creates a `Notification` document for **every Moderator and Admin** in the system
- Notification type: `NewQuery`
- Contains the query title, category, and a link to the moderation queue

**Notification UI (TopNav):**

- Bell icon with unread count badge (red circle, "9+" for > 9)
- Auto-polls `GET /api/notifications/unread-count` every **30 seconds**
- Clicking the bell opens a dropdown panel with the latest 50 notifications
- Each notification shows title, message, and timestamp
- Clicking a notification marks it as read and navigates to the related query
- "Mark all read" button clears all unread notifications
- Dropdown closes when clicking outside (click-away listener)

**Only visible to Moderators and Admins** — students do not see the notification bell.

### 6. Knowledge Base Search

- Full-text search across all `Approved` + `Resolved` queries using MongoDB `$text` index
- Search by title and content simultaneously
- Filter by category (MRC, PRC, ERC)
- Results show query title, category badge, status, author name, and creation date
- Click to view full query details with all responses

### 7. Gamification System

**Points:**

- +10 points for posting a query
- +5 points for posting a peer response
- Points displayed on user profile and leaderboard

**Badges:**

- Admin-managed badge system (create/delete badges)
- Badges awarded to users via the admin panel
- UserBadge junction table prevents duplicate awards

**Leaderboard:**

- Updated automatically at midnight every day via `node-cron`
- Top 100 users ranked by points
- Clears and rebuilds the entire leaderboard each run

### 8. Admin Dashboard & Analytics

**Admin Dashboard:**

- System-wide statistics: total users, queries, responses, categories
- User management: view all users, change roles, delete users
- Query management: view/filter/delete all queries
- Badge management: create badges, award to users
- Response management: view all responses

**Analytics:**

- Metric types: `QueryCount`, `ResponseCount`, `AvgResolutionTime`, `UserEngagement`, `CategoryUsage`
- Time-series chart data for trend analysis (Chart.js)
- Category usage breakdown
- Active users over time

### 9. Peer-to-Peer Responses

- Any authenticated user (not just moderators) can respond to queries
- Users cannot respond to their own queries (enforced server-side)
- Response form supports: text, voice recording, video upload, file attachments
- Auto-detects response type based on media attached
- Peer responses set query status to `InProgress`
- Moderator/Admin responses set query status to `Resolved`
- Responses display the responder's role badge (User vs Moderator)

### 10. Zoom Session Scheduling

- Sessions linked to specific queries
- Store Zoom meeting link and scheduled time
- Optional recording URL added after the session
- Managed via `POST /api/sessions` endpoints

---

## Complete REST API Reference

All endpoints are prefixed with `/api`. Authentication required unless marked 🔓 (public).

### Authentication (`/api/auth`)

| Method | Endpoint               | Auth | Description                                                         |
| ------ | ---------------------- | ---- | ------------------------------------------------------------------- |
| POST   | `/register`            | 🔓   | Register student (only `@iba-suk.edu.pk`). Returns success message. |
| POST   | `/verify-email`        | 🔓   | Verify email with token. Body: `{ token }`                          |
| POST   | `/resend-verification` | 🔓   | Resend verification email. Body: `{ email }`                        |
| POST   | `/admin/register`      | 🔓   | Register admin (requires `adminSecret`). Returns JWT + user.        |
| POST   | `/login`               | 🔓   | Login. Returns JWT + user. 403 if unverified.                       |
| POST   | `/forgot-password`     | 🔓   | Request password reset. Body: `{ email }`                           |
| POST   | `/reset-password`      | 🔓   | Reset password. Body: `{ token, password }`                         |
| GET    | `/me`                  | 🔒   | Get current authenticated user profile.                             |

### Profile (`/api/profile`)

| Method | Endpoint | Auth | Description                                        |
| ------ | -------- | ---- | -------------------------------------------------- |
| GET    | `/`      | 🔒   | Get current user profile                           |
| PATCH  | `/`      | 🔒   | Update profile (name, bio, skills, profilePicture) |

### Queries (`/api/queries`)

| Method | Endpoint      | Auth         | Description                                                                                         |
| ------ | ------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| GET    | `/`           | 🔒           | Get all queries (filters: `category`, `status`, `userId`, `search`, `moderationStatus`)             |
| GET    | `/:id`        | 🔒           | Get single query with responses                                                                     |
| POST   | `/`           | 🔒           | Create query (multipart: `title`, `content`, `category`, `attachments[]`, `voiceFile`, `videoFile`) |
| PATCH  | `/:id/status` | 🔒 Mod/Admin | Update query status (`Open`, `InProgress`, `Resolved`)                                              |

### Responses (`/api/responses`)

| Method | Endpoint | Auth | Description                                                                                                       |
| ------ | -------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| GET    | `/`      | 🔒   | Get responses (filter: `queryId`)                                                                                 |
| POST   | `/`      | 🔒   | Create response (multipart: `queryId`, `responseText`, `responseType`, `voiceFile`, `videoFile`, `attachments[]`) |

### Knowledge Base (`/api/kb`)

| Method | Endpoint      | Auth | Description                                       |
| ------ | ------------- | ---- | ------------------------------------------------- |
| GET    | `/search`     | 🔒   | Full-text search across approved resolved queries |
| GET    | `/categories` | 🔒   | Get category counts                               |

### Moderation (`/api/moderator`)

| Method | Endpoint           | Auth         | Description                                                                    |
| ------ | ------------------ | ------------ | ------------------------------------------------------------------------------ |
| GET    | `/queue`           | 🔒 Mod/Admin | Get moderation queue (filter: `type=all\|pending\|active`)                     |
| POST   | `/approve-query`   | 🔒 Mod/Admin | Approve pending query. Body: `{ queryId }`                                     |
| POST   | `/reject-query`    | 🔒 Mod/Admin | Reject pending query. Body: `{ queryId, rejectionReason? }`                    |
| POST   | `/generate-draft`  | 🔒 Mod/Admin | Generate AI draft. Body: `{ queryId }`. Returns `{ draft, confidence, model }` |
| POST   | `/submit-response` | 🔒 Mod/Admin | Submit response. Body: `{ queryId, responseText, responseType }`               |
| GET    | `/templates`       | 🔒 Mod/Admin | Get response templates                                                         |
| POST   | `/close-query`     | 🔒 Mod/Admin | Close a query. Body: `{ queryId }`                                             |
| GET    | `/stats`           | 🔒 Mod/Admin | Get moderator statistics                                                       |

### Admin (`/api/admin`)

| Method | Endpoint          | Auth     | Description                  |
| ------ | ----------------- | -------- | ---------------------------- |
| GET    | `/users`          | 🔒 Admin | Get all users                |
| PATCH  | `/users/:id/role` | 🔒 Admin | Update user role             |
| DELETE | `/users/:id`      | 🔒 Admin | Delete user                  |
| GET    | `/queries`        | 🔒 Admin | Get all queries (unfiltered) |
| DELETE | `/queries/:id`    | 🔒 Admin | Delete query                 |
| POST   | `/badges`         | 🔒 Admin | Create badge                 |
| POST   | `/badges/award`   | 🔒 Admin | Award badge to user          |

### Gamification (`/api/gamification`)

| Method | Endpoint       | Auth | Description               |
| ------ | -------------- | ---- | ------------------------- |
| GET    | `/points`      | 🔒   | Get current user's points |
| GET    | `/badges`      | 🔒   | Get current user's badges |
| GET    | `/leaderboard` | 🔒   | Get leaderboard (top 100) |

### Analytics (`/api/analytics`)

| Method | Endpoint     | Auth     | Description              |
| ------ | ------------ | -------- | ------------------------ |
| GET    | `/dashboard` | 🔒 Admin | Get dashboard statistics |
| GET    | `/metrics`   | 🔒 Admin | Get time-series metrics  |

### Sessions (`/api/sessions`)

| Method | Endpoint    | Auth         | Description              |
| ------ | ----------- | ------------ | ------------------------ |
| POST   | `/`         | 🔒 Mod/Admin | Schedule Zoom session    |
| GET    | `/:queryId` | 🔒           | Get sessions for a query |

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
| **HTTPS Headers**        | Helmet.js                | Sets `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CSP, referrer policy |
| **Authentication**       | JWT (HS256)              | Stateless tokens with configurable expiry (default: 7 days). Token sent via `Authorization: Bearer <token>` header |
| **Password Storage**     | bcryptjs                 | 10 salt rounds; passwords never stored in plaintext                                                                |
| **Token Security**       | SHA-256 hashing          | Verification and reset tokens are hashed before database storage; raw tokens only exist in emails                  |
| **Input Validation**     | express-validator        | All routes validate and sanitize inputs (trim, normalizeEmail, isLength, isIn, etc.)                               |
| **File Upload Security** | Multer file filter       | Whitelist of allowed extensions and MIME types; 50 MB size limit                                                   |
| **Role-Based Access**    | `authorize()` middleware | Routes restricted by user role (`Admin`, `Moderator`, `User`)                                                      |
| **CORS**                 | cors middleware          | Configurable allowed origins via `FRONTEND_URL`                                                                    |
| **Email Security**       | Vague responses          | Forgot-password and resend-verification responses don't reveal whether an email exists                             |
| **Data Exposure**        | Field selection          | `passwordHash` is excluded from all API responses via `.select('-passwordHash')`                                   |
| **Compression**          | compression middleware   | Gzip compression for all responses                                                                                 |

---

## Error Logging System

The server includes a comprehensive file-based error logging system:

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
[2026-04-13T10:30:00.000Z] [API_ERROR] POST /api/auth/login 401 Duration: 15ms
[2026-04-13T10:30:05.000Z] [SERVER_CRASH] POST /api/queries: Cannot read properties of undefined Duration: Error stack...
```

**Features:**

- Daily rotating log files (one file per day)
- Automatic `logs/` directory creation on server start
- Logs include timestamp, error type, HTTP method, URL, status code, and duration
- Stack traces included for server crashes and unhandled exceptions

---

## Performance & Scalability

| Metric                    | Implementation                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **Gzip Compression**      | All responses compressed via `compression` middleware                                 |
| **Database Indexes**      | 6+ compound indexes on frequently queried fields                                      |
| **Connection Pooling**    | MongoDB Atlas handles connection pooling automatically                                |
| **Async Handlers**        | All Express route handlers use async/await — no blocking                              |
| **Code Splitting**        | Vite automatically splits vendor code from app code                                   |
| **Lazy Loading**          | React Router pages loaded on demand                                                   |
| **50 Query Limit**        | Default pagination limit prevents large result sets                                   |
| **Multer Memory Storage** | Files buffered in memory for fast streaming to Cloudinary                             |
| **Text Search Index**     | MongoDB `$text` index for efficient knowledge base search                             |
| **CDN File Delivery**     | Cloudinary serves files via global CDN with HTTPS                                     |
| **100+ Users**            | Express + MongoDB Atlas + gzip handles 100 concurrent connections without degradation |

---

## PWA & Responsive Design

**Progressive Web App:**

- Generated via `vite-plugin-pwa` with Workbox
- Auto-update service worker registration (`registerType: 'autoUpdate'`)
- Caches all JS, CSS, HTML, and image assets for offline access
- `manifest.json` configured with app name, icons (192×192, 512×512), theme color (`#1e40af`), standalone display mode
- Installable on Android and iOS home screens

**Responsive Design:**

- Tailwind CSS utility classes for all breakpoints
- Mobile-first design approach
- Sidebar collapses on small screens
- Forms and cards stack vertically on mobile
- TopNav adapts: hides username text on mobile, shows only avatar

---

## Environment Variables

### Server (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sdasp?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Admin Registration Secret
ADMIN_SECRET=your-admin-secret-key

# AI Services (OpenAI used first, Gemini as fallback)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...

# Email (SMTP) — Gmail with App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (used in email links)
FRONTEND_URL=http://localhost:5173
```

> **Gmail App Password Setup:** Enable 2-Step Verification in Google Account → Security → App Passwords → Generate a 16-character password for "Mail".

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Setup

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **MongoDB Atlas** account (free tier M0 works)
- **Cloudinary** account (free tier — 25 GB storage)
- **Gmail** account with App Password enabled (for SMTP emails)
- (Optional) **OpenAI** or **Google Gemini** API key for AI drafts

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd SDASP
```

### Step 2: Install All Dependencies

```bash
npm run install:all
```

This installs dependencies for:

- Root (concurrently)
- Client (React, Vite, Tailwind, etc.)
- Server (Express, Mongoose, JWT, Cloudinary, etc.)

### Step 3: Configure Environment Variables

Create `server/.env` with the values from the [Environment Variables](#environment-variables) section.

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Verify MongoDB Atlas Connection

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Under Network Access, add `0.0.0.0/0` (allows all IPs for development)
5. Get the connection string and set it as `MONGODB_URI`

### Step 5: Verify Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. From your Dashboard, copy `Cloud Name`, `API Key`, `API Secret`
4. Set them in `server/.env`

### Step 6: Verify Gmail SMTP Setup

1. Enable 2-Step Verification on your Google Account
2. Go to Google Account → Security → App Passwords
3. Generate a new App Password for "Mail"
4. Set `SMTP_USER` (your Gmail) and `SMTP_PASS` (the 16-char app password)

---

## Running the Application

### Development Mode (Client + Server simultaneously)

```bash
npm run dev
```

This starts:

- **Frontend**: http://localhost:5173 (Vite dev server with hot reload)
- **Backend API**: http://localhost:5000 (Express with nodemon auto-restart)
- Vite proxies `/api` requests to the backend automatically

### Run Server Only

```bash
cd server
npm run dev
```

### Run Client Only

```bash
cd client
npm run dev
```

### Production Build

```bash
cd client
npm run build     # Outputs to client/dist/
npm run preview   # Preview the production build locally
```

```bash
cd server
npm start         # Runs without nodemon
```

---

## Testing

### Run All Server Tests

```bash
cd server
npm test
```

### Run Tests in Watch Mode

```bash
cd server
npm run test:watch
```

### Test Files

| File                      | Covers                                                  |
| ------------------------- | ------------------------------------------------------- |
| `tests/auth.test.js`      | Registration, login, email verification, password reset |
| `tests/query.test.js`     | Query creation, retrieval, filtering, status updates    |
| `tests/moderator.test.js` | Moderation queue, approve/reject, AI draft generation   |
| `tests/setup.js`          | Test database connection and cleanup                    |

### Test Configuration

- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Environment**: `NODE_ENV=test` (server doesn't start listening)
- **Config**: `server/jest.config.js`

---

## Deployment

### Frontend → Vercel

1. Import GitHub repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable: `VITE_API_URL=https://your-api-domain.com/api`
6. Deploy — Vercel auto-deploys on every push to `main`

### Backend → Railway

1. Create new project from GitHub on [Railway](https://railway.app)
2. Set **Root Directory** to `server`
3. Set **Start Command** to `npm start`
4. Add all `server/.env` variables to Railway's environment settings
5. Set `FRONTEND_URL` to your Vercel deployment URL
6. Deploy — Railway auto-deploys on every push to `main`

### Database → MongoDB Atlas

1. Use free M0 cluster (512 MB storage)
2. Create database user with read/write access
3. Whitelist Railway's IP (or `0.0.0.0/0` for simplicity)
4. Copy the connection string into `MONGODB_URI`

### Files → Cloudinary

- Free tier: 25 GB storage, 25 GB bandwidth/month
- Files automatically served via CDN with HTTPS
- No additional deployment needed — works with API key/secret

---

## Troubleshooting

### "Only Sukkur IBA University emails are allowed"

- Registration is restricted to `@iba-suk.edu.pk` emails
- Admin accounts can be created with any email using `/api/auth/admin/register` with the admin secret

### "Please verify your email before logging in"

- Check inbox (and spam) for the verification email
- Link expires in 10 minutes — use "Resend verification email" on the login page
- If expired, you can register again with the same email

### Email Not Received

- Verify `SMTP_USER` and `SMTP_PASS` in `server/.env`
- For Gmail: ensure 2-Step Verification is enabled and you're using an App Password (not your regular password)
- Check server console for `Error sending verification email` messages
- Check spam/junk folder

### File Uploads Failing

- Verify Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Server logs should show `✅ Cloudinary initialized` on startup
- If you see `⚠️ Cloudinary credentials not provided`, check `.env` file
- File size limit is 50 MB

### AI Draft Generation Returns Template Response

- This is normal if neither `OPENAI_API_KEY` nor `GEMINI_API_KEY` is configured
- Set at least one AI API key in `server/.env`
- Check API key validity and quota in OpenAI/Google Cloud dashboards

### MongoDB Connection Failed

- Verify `MONGODB_URI` format: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/sdasp`
- Check MongoDB Atlas Network Access — your IP must be whitelisted
- Check that the database user credentials are correct

### CORS Errors

- Set `FRONTEND_URL` in `server/.env` to match your client's URL exactly (e.g., `http://localhost:5173`)
- In production, update to your deployed frontend URL

### Port Already in Use

- Another process is using port 5000
- Kill it: `npx kill-port 5000` or change `PORT` in `server/.env`

---

## License

MIT License

---

**Built for Sukkur IBA University — SDASP**
