# SDASP — Architecture, Application Flow & Design System

---

## 1. Application Architecture

### Overview

SDASP follows a **three-tier architecture** pattern:

```
┌─────────────────────────┐
│     PRESENTATION TIER    │  React 18 + Vite + Tailwind CSS (PWA)
│     (Client Browser)     │  Runs at localhost:5173 (dev) or served from /client/dist (prod)
└───────────┬─────────────┘
            │  HTTPS / Axios (Bearer JWT)
            │  Proxied via Vite dev server → /api
┌───────────▼─────────────┐
│     APPLICATION TIER     │  Node.js + Express.js REST API
│     (Server)             │  Runs at localhost:5000
│                          │  13 route modules, 3 middleware layers
└───────────┬─────────────┘
            │  Mongoose ODM
┌───────────▼─────────────┐
│       DATA TIER          │  MongoDB Atlas (12 collections)
│  + External Services     │  Cloudinary (CDN), Brevo (email),
│                          │  OpenAI / Gemini (AI), Zoom (sessions)
└─────────────────────────┘
```

### Architecture Details

**Monorepo Structure:**

- Single repository with two packages: `client/` and `server/`
- Root `package.json` uses `concurrently` to run both in development
- Production: server statically serves the built client (`client/dist`)

**Frontend Architecture (React SPA):**

```
main.jsx
  └─ BrowserRouter
       └─ AuthProvider (Context)
            └─ ConfirmProvider (Context)
                 └─ App.jsx (Route Definitions)
                      ├─ Public Routes
                      │   ├─ /           → Landing
                      │   ├─ /login      → Login
                      │   ├─ /register   → Register
                      │   ├─ /admin/login    → AdminLogin
                      │   ├─ /admin/register → AdminRegister
                      │   ├─ /verify-email   → VerifyEmail
                      │   ├─ /forgot-password → ForgotPassword
                      │   └─ /reset-password  → ResetPassword
                      │
                      └─ Protected Routes (ProtectedRoute wrapper)
                           └─ Layout (TopNav + Sidebar + Outlet)
                                ├─ /dashboard           → Role-based dashboard
                                ├─ /queries/new         → QueryForm
                                ├─ /queries/:id         → ResponseView
                                ├─ /knowledge-base      → KBSearch
                                ├─ /gamification        → Gamification
                                ├─ /quizzes             → StudentQuiz
                                ├─ /profile             → Profile
                                ├─ /users/:id           → UserProfile
                                ├─ /moderation/:id      → ModerationQueueDetail
                                ├─ /quiz-management     → QuizManagement
                                ├─ /analytics           → Analytics
                                ├─ /admin/users         → AdminUsers
                                ├─ /admin/queries       → AdminQueries
                                ├─ /admin/responses     → AdminResponses
                                └─ /admin/badges        → AdminBadges
```

**Backend Architecture (Express.js):**

```
index.js (Entry Point)
  ├─ Security Middleware
  │   ├─ Helmet (HTTP security headers)
  │   ├─ CORS (cross-origin resource sharing)
  │   ├─ Compression (gzip)
  │   ├─ express.json({ limit: '10mb' })
  │   ├─ express.urlencoded({ extended: true })
  │   └─ trust proxy: 1
  │
  ├─ Error Logging (request/response interceptor for status >= 400)
  │
  ├─ API Routes (/api/*)
  │   ├─ /api/auth           → routes/auth.js
  │   ├─ /api/profile        → routes/profile.js
  │   ├─ /api/queries        → routes/queries.js
  │   ├─ /api/responses      → routes/responses.js
  │   ├─ /api/kb             → routes/kb.js
  │   ├─ /api/moderator      → routes/moderator.js
  │   ├─ /api/admin          → routes/admin.js
  │   ├─ /api/gamification   → routes/gamification.js
  │   ├─ /api/analytics      → routes/analytics.js
  │   ├─ /api/sessions       → routes/sessions.js
  │   ├─ /api/notifications  → routes/notifications.js
  │   ├─ /api/quizzes        → routes/quizzes.js
  │   └─ /api/health         → inline health check
  │
  ├─ SPA Fallback (non-API GET → client/dist/index.html)
  │
  ├─ 404 Handler (API routes not found)
  │
  ├─ Global Error Handler (logs + returns 500)
  │
  └─ Cron Jobs (node-cron)
      ├─ Daily at midnight    → rebuild leaderboard
      └─ Every 5 minutes     → deactivate expired quizzes
```

**Middleware Pipeline:**

```
Request →  Helmet → CORS → Compression → JSON Parser → URL Parser
         → Error Logger (intercepts response)
         → Rate Limiter (on auth routes)
         → Route Handler
              → authenticate() (JWT verification)
              → authorize(roles) (role check)
              → upload.fields() (Multer — multipart parsing)
              → Route Logic (validation → DB ops → response)
         → Global Error Handler
→ Response
```

---

## 2. Application Flow

### 2.1 Student Registration & Verification Flow

```
Student                    Frontend                   Backend                  Brevo Email
   │                          │                          │                         │
   ├── Fill register form ───►│                          │                         │
   │   (name, email, pass)    │                          │                         │
   │                          ├── POST /api/auth/register►│                         │
   │                          │                          ├── Validate email domain  │
   │                          │                          │   (@iba-suk.edu.pk)      │
   │                          │                          ├── bcrypt hash password   │
   │                          │                          ├── Generate 32-byte token │
   │                          │                          ├── SHA-256 hash token     │
   │                          │                          ├── Save user (unverified) │
   │                          │                          ├── Send verification ────►│
   │                          │                          │   email with raw token   │
   │                          │◄── 201 Created ──────────┤                         │
   │◄── "Check your email" ──┤                          │                         │
   │                          │                          │                         │
   │── Click email link ─────►│                          │                         │
   │   /verify-email?token=X  │                          │                         │
   │                          ├── POST /api/auth/        │                         │
   │                          │   verify-email           │                         │
   │                          │   { token: X }           │                         │
   │                          │                          ├── SHA-256(X) → lookup    │
   │                          │                          ├── Check expiry (10 min)  │
   │                          │                          ├── Set isVerified: true   │
   │                          │◄── 200 "Verified" ───────┤                         │
   │◄── Redirect to login ───┤                          │                         │
```

### 2.2 Login Flow

```
User                       Frontend                   Backend
  │                           │                          │
  ├── Enter email + password─►│                          │
  │                           ├── POST /api/auth/login ─►│
  │                           │                          ├── Find user by email
  │                           │                          ├── bcrypt.compare(password, hash)
  │                           │                          ├── Check isVerified (if role=User)
  │                           │                          │   └── If false: 403 needsVerification
  │                           │                          ├── Generate JWT { userId, role }
  │                           │                          │   (expires in 7 days)
  │                           │◄── { token, user } ──────┤
  │                           ├── Store token in localStorage
  │                           ├── Set AuthContext state
  │                           ├── Redirect based on role:
  │                           │   User → /dashboard (StudentDashboard)
  │                           │   Moderator → /dashboard (ModeratorDashboard)
  │                           │   Admin → /dashboard (AdminDashboard)
  │◄── Dashboard loaded ─────┤
```

### 2.3 Query Submission Flow

```
Student                    Frontend                   Backend                  Cloudinary
   │                          │                          │                         │
   ├── Fill query form ──────►│                          │                         │
   │   (title, content,       │                          │                         │
   │    category, voice,      │                          │                         │
   │    video, attachments)   │                          │                         │
   │                          ├── POST /api/queries ────►│                         │
   │                          │   (multipart/form-data)  │                         │
   │                          │                          ├── Multer parses files   │
   │                          │                          │   into memory buffers    │
   │                          │                          ├── Stream voice to ──────►│
   │                          │                          │   Cloudinary (auto type) │
   │                          │                          │◄── voiceFile URL ────────┤
   │                          │                          ├── Stream video to ──────►│
   │                          │                          │   Cloudinary             │
   │                          │                          │◄── videoFile URL ────────┤
   │                          │                          ├── Stream attachments ───►│
   │                          │                          │   to Cloudinary          │
   │                          │                          │◄── attachment URLs ──────┤
   │                          │                          │                         │
   │                          │                          ├── Create Query document  │
   │                          │                          │   (status: Open,         │
   │                          │                          │    moderationStatus:     │
   │                          │                          │    Pending)              │
   │                          │                          ├── Create Attachment docs │
   │                          │                          ├── Award +10 points      │
   │                          │                          ├── Create Notification    │
   │                          │                          │   for ALL Moderators     │
   │                          │                          │   and Admins             │
   │                          │◄── 201 { query } ────────┤                         │
   │◄── Success toast ────────┤                          │                         │
```

### 2.4 Moderation Flow

```
Moderator                  Frontend                   Backend                  AI Service
   │                          │                          │                         │
   │── View moderation queue─►│                          │                         │
   │                          ├── GET /api/moderator/    │                         │
   │                          │   queue?type=pending ───►│                         │
   │                          │◄── { queries: [...] } ───┤                         │
   │◄── See pending queries ──┤                          │                         │
   │                          │                          │                         │
   │── Click a query ────────►│                          │                         │
   │                          │   (ModerationQueueDetail)│                         │
   │                          │                          │                         │
   │── Click "Approve" ──────►│                          │                         │
   │                          ├── POST /api/moderator/   │                         │
   │                          │   approve-query ────────►│                         │
   │                          │   { queryId }            ├── Set moderationStatus: │
   │                          │                          │   Approved              │
   │                          │◄── 200 OK ───────────────┤                         │
   │                          │                          │                         │
   │── Click "Generate AI     │                          │                         │
   │   Draft" ───────────────►│                          │                         │
   │                          ├── POST /api/moderator/   │                         │
   │                          │   generate-draft ───────►│                         │
   │                          │   { queryId }            ├── Try OpenAI GPT-3.5 ──►│
   │                          │                          │   (300 tokens, temp 0.7) │
   │                          │                          │   If fails:              │
   │                          │                          ├── Try Gemini 1.5 Flash ─►│
   │                          │                          │   If fails:              │
   │                          │                          ├── Use template fallback  │
   │                          │◄── { draft, confidence,  │                         │
   │                          │     model } ─────────────┤                         │
   │◄── Draft in editor ─────┤                          │                         │
   │                          │                          │                         │
   │── Edit draft + submit ──►│                          │                         │
   │                          ├── POST /api/moderator/   │                         │
   │                          │   submit-response ──────►│                         │
   │                          │   { queryId,             ├── Create Response doc   │
   │                          │     responseText }       ├── Set query status:     │
   │                          │                          │   Resolved              │
   │                          │◄── 201 { response } ─────┤                         │
   │◄── Success ──────────────┤                          │                         │
```

### 2.5 Knowledge Base Search Flow

```
User                       Frontend                   Backend
  │                           │                          │
  ├── Enter search query ────►│                          │
  │   + optional category     │                          │
  │                           ├── GET /api/kb/search ───►│
  │                           │   ?q=keyword             │
  │                           │   &category=MRC          ├── Find queries where:
  │                           │                          │   moderationStatus=Approved
  │                           │                          │   AND (title or content
  │                           │                          │   matches regex)
  │                           │                          │   AND category=MRC
  │                           │◄── { queries: [...] } ───┤
  │◄── Display results ──────┤
  │                           │
  ├── Click a result ────────►│
  │                           ├── Navigate to /queries/:id
  │                           │   (ResponseView page)
  │◄── Query + responses ────┤
```

### 2.6 Quiz Flow

```
Student                    Frontend                   Backend
   │                          │                          │
   ├── View available quizzes─►│                          │
   │                          ├── GET /api/quizzes ─────►│
   │                          │◄── active, non-expired ──┤
   │◄── Quiz list ────────────┤                          │
   │                          │                          │
   ├── Enter quiz password ──►│                          │
   │                          ├── POST /api/quizzes/     │
   │                          │   :id/verify-password ──►│
   │                          │   { password }           ├── bcrypt.compare
   │                          │                          │   (rate limited 10/15min)
   │                          │◄── { questions }  ───────┤  (no correct answers!)
   │◄── Timer starts ─────────┤                          │
   │                          │                          │
   │── Answer questions ─────►│                          │
   │   (timer counting down)  │                          │
   │                          │                          │
   │── Submit answers ────────►│                          │
   │   (or time expires)      ├── POST /api/quizzes/     │
   │                          │   :id/submit ───────────►│
   │                          │   { answers: [0,2,1,...] }├── Check unique attempt
   │                          │                          ├── Score = count correct
   │                          │                          ├── Award score × 2 points
   │                          │                          ├── Save QuizAttempt
   │                          │◄── { score, total,  ─────┤
   │                          │     percentage }         │
   │◄── Results displayed ────┤                          │
```

### 2.7 Notification Flow

```
Student posts query ──► Backend creates Query
                            │
                            ├── Find all Moderators & Admins
                            ├── For each: create Notification {
                            │     type: 'NewQuery',
                            │     title: 'New Query Submitted',
                            │     message: 'query title — category',
                            │     relatedQuery: queryId
                            │   }
                            ▼
Moderator's TopNav ──► Polls GET /api/notifications/unread-count every 30s
                            │
                            ├── Unread count shown on bell badge
                            │
                     Click bell
                            │
                            ├── GET /api/notifications (latest 50)
                            ├── Display in dropdown panel
                            │
                     Click notification
                            │
                            ├── PATCH /api/notifications/:id/read
                            └── Navigate to /moderation/:queryId
```

### 2.8 Gamification & Leaderboard Flow

```
Points earned via:
  ├── Post query        → +10 points
  ├── Post response     → +5 points
  └── Quiz correct      → +2 per correct answer

Leaderboard update:
  ├── Cron job runs daily at midnight
  │   ├── Find top 100 users sorted by points DESC
  │   ├── Delete all Leaderboard documents
  │   └── Insert new ranked documents
  │
  └── Admin can trigger manually:
      POST /api/gamification/update-leaderboard
```

### 2.9 Password Reset Flow

```
User                       Frontend                   Backend                  Brevo
  │                           │                          │                       │
  ├── Enter email ───────────►│                          │                       │
  │   (/forgot-password)      ├── POST /api/auth/        │                       │
  │                           │   forgot-password ──────►│                       │
  │                           │   { email }              ├── Generate 32-byte    │
  │                           │                          │   reset token         │
  │                           │                          ├── SHA-256 hash + save │
  │                           │                          │   (1 hour expiry)     │
  │                           │                          ├── Send reset email ──►│
  │                           │◄── "Check your email" ───┤                       │
  │                           │                          │                       │
  │── Click email link ──────►│                          │                       │
  │   /reset-password?token=Y │                          │                       │
  │                           │                          │                       │
  ├── Enter new password ────►│                          │                       │
  │                           ├── POST /api/auth/        │                       │
  │                           │   reset-password ───────►│                       │
  │                           │   { token: Y, password } ├── SHA-256(Y) → lookup │
  │                           │                          ├── Check expiry        │
  │                           │                          ├── bcrypt new password  │
  │                           │                          ├── Clear reset token   │
  │                           │                          ├── Send success email ►│
  │                           │◄── 200 "Reset OK" ───────┤                       │
  │◄── Redirect to login ────┤                          │                       │
```

---

## 3. Color System & Design Tokens

### Primary Color: Sage Green

The primary palette evokes an earthy, academic tone — calm, trustworthy, and natural.

```
primary-50:  #F7F8EF  ░░░░░░░░░░  (lightest tint — hover backgrounds)
primary-100: #EEF1DD  ████░░░░░░  (active sidebar bg, light badges)
primary-200: #DCE2BB  ████████░░  (text selection, input focus bg)
primary-500: #A6B37D  ██████████  (mid-tone — decorative accents)
primary-700: #6D7A52  ██████████  (PRIMARY BUTTON BG, focus rings, links)
primary-800: #535D3E  ██████████  (button hover, active states)
primary-900: #3B422B  ██████████  (darkest — text on primary bg)
```

**Hex reference: `#6D7A52` (primary-700) is the main action color.**

### Accent Color: Warm Tan / Brown

Used as a secondary highlight for badges, status indicators, and alternative CTAs.

```
accent-50:  #FAF3EB   ░░░░░░░░░░  (lightest accent background)
accent-100: #F3E5D1   ████░░░░░░  (badge backgrounds)
accent-200: #E5D0B5   ████████░░  (secondary borders)
accent-600: #A37F5D   ██████████  (ACCENT BUTTON BG, notification badge)
accent-700: #82644A   ██████████  (icons on accent, "In Progress" buttons)
accent-800: #5F4937   ██████████  (accent text color)
```

**Hex reference: `#A37F5D` (accent-600) is the main accent action color.**

### Surface Color: Cream / Earthy Neutrals

Background, text, and border colors. Cream replaces standard white/gray.

```
surface-50:  #FEFAE0  ░░░░░░░░░░  (PAGE BACKGROUND — cream)
surface-100: #F5EBCD  ████░░░░░░  (muted card background)
surface-200: #E8DCB5  ████████░░  (borders, dividers)
surface-300: #D4C79D  ████████░░  (input borders, scrollbar)
surface-500: #7E724E  ██████████  (secondary/muted text)
surface-600: #5C532F  ██████████  (body text, descriptions)
surface-800: #2B2817  ██████████  (PRIMARY BODY TEXT)
surface-900: #18160C  ██████████  (headings, darkest text)
```

**Hex reference: `#FEFAE0` (surface-50 / cream) is the page background.**
**Hex reference: `#2B2817` (surface-800) is the default body text color.**

### Quick Reference Card

| Role          | Token          | Hex       | CSS Variable            |
| ------------- | -------------- | --------- | ----------------------- |
| Primary BG    | primary-700    | `#6D7A52` | `bg-primary-700`        |
| Primary Hover | primary-800    | `#535D3E` | `hover:bg-primary-800`  |
| Accent BG     | accent-600     | `#A37F5D` | `bg-accent-600`         |
| Danger BG     | (Tailwind red) | `#B91C1C` | `bg-red-700`            |
| Page BG       | surface-50     | `#FEFAE0` | `bg-surface-50`         |
| Card BG       | white          | `#FFFFFF` | `bg-white`              |
| Body Text     | surface-800    | `#2B2817` | `text-surface-800`      |
| Heading Text  | surface-900    | `#18160C` | `text-surface-900`      |
| Muted Text    | surface-500    | `#7E724E` | `text-surface-500`      |
| Border        | surface-200    | `#E8DCB5` | `border-surface-200`    |
| Focus Ring    | primary-700    | `#6D7A52` | `ring-primary-700`      |
| Selection     | primary-200    | `#DCE2BB` | N/A (CSS `::selection`) |

---

## 4. Typography

### Font Families

| Family   | Category   | Source       | Usage                           |
| -------- | ---------- | ------------ | ------------------------------- |
| Inter    | Sans-Serif | Google Fonts | Body text, labels, buttons, nav |
| Fraunces | Serif      | Google Fonts | Headings, page titles, display  |

### Font Loading

Loaded via `<link>` tags in `client/index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"
/>
```

### Tailwind Configuration

```js
fontFamily: {
  sans: ['Inter', ...defaultTheme.fontFamily.sans],
  serif: ['Fraunces', ...defaultTheme.fontFamily.serif],
  display: ['Fraunces', ...defaultTheme.fontFamily.serif],
}
```

### Heading Scale

| Element     | Class            | Font         | Size    |
| ----------- | ---------------- | ------------ | ------- |
| Page title  | `.page-title`    | Fraunces     | 3xl–4xl |
| Section     | `.section-title` | Fraunces     | 2xl     |
| Eyebrow     | `.eyebrow`       | Inter (caps) | xs      |
| Body        | —                | Inter        | base    |
| Small/muted | `.prose-muted`   | Inter        | sm–base |

---

## 5. Component Design System

### Cards

| Class         | Background    | Border          | Shadow                  | Radius |
| ------------- | ------------- | --------------- | ----------------------- | ------ |
| `.card`       | `white`       | `surface-200`   | `card`                  | `xl`   |
| `.card-hover` | `white`       | `surface-200`   | `card-hover` (on hover) | `xl`   |
| `.card-muted` | `surface-100` | `surface-200`   | `card`                  | `xl`   |
| `.glass-card` | `white`       | `surface-200`   | `soft`                  | `xl`   |
| `.stat-card`  | `white`       | left accent bar | `card`                  | `xl`   |

### Buttons

| Class            | Background    | Text          | Hover            | Border        |
| ---------------- | ------------- | ------------- | ---------------- | ------------- |
| `.btn-primary`   | `primary-700` | `white`       | `primary-800`    | none          |
| `.btn-secondary` | `white`       | `surface-800` | `surface-50` bg  | `surface-200` |
| `.btn-accent`    | `accent-600`  | `white`       | `accent-700`     | none          |
| `.btn-danger`    | `red-700`     | `white`       | `red-800`        | none          |
| `.btn-ghost`     | `transparent` | `surface-600` | `surface-100` bg | none          |

All buttons: `rounded-lg`, `font-medium`, `transition-all duration-200`, `focus-visible:ring-2 ring-primary-700`.

### Inputs

| Class           | Background | Border        | Focus                        |
| --------------- | ---------- | ------------- | ---------------------------- |
| `.input-modern` | `white`    | `surface-200` | `ring-2 ring-primary-700/30` |

### Badges

| Variant          | Background    | Text          |
| ---------------- | ------------- | ------------- |
| `.badge`         | `surface-100` | `surface-700` |
| `.badge-primary` | `primary-100` | `primary-800` |
| `.badge-accent`  | `accent-100`  | `accent-800`  |
| `.badge-danger`  | `red-100`     | `red-800`     |

### Shadows

| Name         | Value                                                          | Applied to      |
| ------------ | -------------------------------------------------------------- | --------------- |
| `card`       | `0 1px 2px rgba(63,58,34,0.04), 0 1px 3px rgba(63,58,34,0.03)` | Cards, panels   |
| `card-hover` | `0 4px 12px rgba(63,58,34,0.06)`                               | Hovered cards   |
| `soft`       | `0 2px 8px rgba(63,58,34,0.05)`                                | Glass cards     |
| `lift`       | `0 8px 24px rgba(63,58,34,0.08)`                               | Modals, dialogs |

Shadow base color: `rgba(63, 58, 34, ...)` — a warm brown-gray matching the earthy palette.

### Animations

| Name         | Keyframes                              | Duration | Easing   |
| ------------ | -------------------------------------- | -------- | -------- |
| `fade-in`    | opacity: 0 → 1                         | 0.4s     | ease-out |
| `fade-in-up` | opacity: 0 + translateY(12px) → normal | 0.5s     | ease-out |
| `page-enter` | Same as fade-in-up                     | 0.4s     | ease-out |

Animations are disabled when the user prefers reduced motion (`prefers-reduced-motion: reduce`).

---

## 6. Role-Based Views

### Student

- **Dashboard:** My queries (stats by status), quick actions (Post Query, Knowledge Base, Quizzes, Leaderboard)
- **Pages accessible:** QueryForm, ResponseView, KBSearch, Gamification, StudentQuiz, Profile, UserProfile

### Moderator

- **Dashboard:** Moderation queue (3 tabs: All/Pending/Active), moderator stats, search & filter
- **Pages accessible:** Everything a Student can + ModerationQueueDetail, QuizManagement

### Admin

- **Dashboard:** System overview stats, admin-specific management
- **Pages accessible:** Everything a Moderator can + AdminUsers, AdminQueries, AdminResponses, AdminBadges, Analytics

### Sidebar Navigation (Role-aware)

The sidebar dynamically shows links based on the user's role:

| Link             | User | Moderator | Admin |
| ---------------- | ---- | --------- | ----- |
| Dashboard        | ✅   | ✅        | ✅    |
| Post Query       | ✅   | ✅        | ✅    |
| Knowledge Base   | ✅   | ✅        | ✅    |
| Gamification     | ✅   | ✅        | ✅    |
| Quizzes          | ✅   | ✅        | ✅    |
| Quiz Management  | ❌   | ✅        | ✅    |
| Analytics        | ❌   | ❌        | ✅    |
| Manage Users     | ❌   | ❌        | ✅    |
| Manage Queries   | ❌   | ❌        | ✅    |
| Manage Responses | ❌   | ❌        | ✅    |
| Manage Badges    | ❌   | ❌        | ✅    |
| Profile          | ✅   | ✅        | ✅    |

---

## 7. Query Categories

| Code  | Full Name                         | Description                             |
| ----- | --------------------------------- | --------------------------------------- |
| `MRC` | Miscellaneous / Resource / Course | General academic queries                |
| `PRC` | Placement / Research / Career     | Career and research guidance            |
| `ERC` | Event / Registration / Complaint  | Events, registration issues, complaints |

Categories are used for:

- Query classification at submission
- Knowledge base filtering
- Analytics breakdown (category usage metrics)
- Badge/leaderboard context

---

## 8. Error Handling Strategy

### Server-Side

1. **Express-validator** catches invalid inputs → 400 Bad Request with field-level errors
2. **Route-level try/catch** catches database and service errors → 500 with generic message
3. **Global error handler** catches uncaught route errors → logs + 500
4. **Unhandled rejection handler** catches Promise rejections outside Express → logs to file
5. **Uncaught exception handler** catches sync throws → logs + graceful shutdown

### Client-Side

1. **ErrorBoundary** component wraps the app → shows fallback UI on React render errors
2. **Axios interceptors** in AuthContext → 401 responses auto-logout the user
3. **react-hot-toast** provides user-facing error messages (red toast notifications)
4. **Form validation** prevents submission with invalid data (client-side + server-side)

---

## 9. File Upload Architecture

```
Browser (React Dropzone / MediaRecorder)
    │
    ├── File selected / recorded
    ├── Added to FormData as multipart
    │
    ▼
Express Server (Multer — memoryStorage)
    │
    ├── File stored as Buffer in memory
    ├── File filter validates extension + MIME type
    ├── Max file size: 50 MB
    │
    ▼
Cloudinary Upload (streamifier → cloudinary.uploader.upload_stream)
    │
    ├── resource_type: 'auto' (detects image/video/raw)
    ├── folder: 'sdasp-uploads'
    ├── Returns secure HTTPS URL
    │
    ▼
MongoDB Document
    ├── URL stored in Query.voiceFile / Query.videoFile
    ├── OR Attachment.fileUrl with metadata (name, size, mimeType, type)
    └── Attachment linked via ObjectId reference
```

**Allowed Extensions:**
`jpeg`, `jpg`, `png`, `gif`, `pdf`, `doc`, `docx`, `txt`, `mp3`, `wav`, `webm`, `mp4`, `mov`, `avi`, `mkv`, `zip`, `rar`, `7z`

---

## 10. AI Integration Architecture

```
Moderator clicks "Generate Draft"
    │
    ▼
POST /api/moderator/generate-draft { queryId }
    │
    ├── Fetch query title + content
    │
    ├── [Priority 1] OpenAI GPT-3.5-turbo
    │   ├── System prompt: "You are a helpful academic moderator..."
    │   ├── User prompt: query title + content
    │   ├── max_tokens: 300, temperature: 0.7
    │   ├── Returns: { draft, confidence: 'high', model: 'gpt-3.5-turbo' }
    │   └── On failure → fall through
    │
    ├── [Priority 2] Google Gemini 1.5 Flash
    │   ├── Same prompt
    │   ├── Returns: { draft, confidence: 'medium', model: 'gemini-1.5-flash' }
    │   └── On failure → fall through
    │
    └── [Priority 3] Template Fallback
        ├── Generic response: "Thank you for your query about {title}..."
        └── Returns: { draft, confidence: 'low', model: 'template' }
```

The draft is **not saved** automatically. The moderator can:

1. Edit the draft in an inline editor
2. Submit it as their response
3. Or discard and write their own response

---

_Generated for SDASP (Sukkur IBA Digital Academic Support Platform)_
