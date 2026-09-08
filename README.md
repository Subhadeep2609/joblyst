# Joblyst — Production-Ready AI-Powered MERN Job Portal

A full-stack, enterprise-grade Job Portal web application built with the **MERN Stack (MongoDB, Express, React, Node.js)**, **Redux Toolkit**, **Tailwind CSS**, and **Framer Motion**. Features end-to-end **Role-Based Access Control (Job Seeker / Recruiter)**, **Cryptographic OTP Email Verification**, **Protected Routes**, **Cloudinary & Multer Resume Uploads**, and **Modular AI Integrations** (Resume Analyzer, Job-Match Scoring, AI Job Description Generator, and AI Interview Preparation).

---

## 🌟 Key Highlights

- **Role-Based Workflows & Strict Isolation:** Distinct permissions and dedicated workspaces for **Job Seekers (Candidates)** and **Recruiters (Employers)**. The "Explore Jobs" catalog is reserved exclusively for candidates/guests (with automatic redirection for recruiters to Manage Postings), while recruiters have direct access to the Homepage with an integrated Recruiter Workspace Hub.
- **Dual Authentication & Verification:** Cryptographic 6-digit OTP email verification via Nodemailer with 10-minute expiration, rate limiting, and developer console fallback, plus seamless **Google OAuth 2.0 Single Sign-On**.
- **Multi-Filter Job Discovery:** Fast full-text and parameterized search by title, skills, location, workplace type (Remote/On-site/Hybrid), job commitment, experience level, and salary.
- **Cloud-Powered Application Pipeline:** High-performance document uploads to **Cloudinary** (with local disk fallback), supporting PDF/DOC/DOCX resume streaming or 1-click profile resume applications, duplicate prevention, and recruiter pipeline stage tracking with real-time candidate timeline logging.
- **Full-Featured Modular AI Suite:**
  - **AI Resume Analyzer:** Multi-format document parser (`pdf-parse`, `mammoth`) capable of extracting text directly from uploaded files or 1-click sync from the user's saved profile resume. Calculates ATS readiness score (0-100), highlights key strengths, identifies skill gaps, and suggests actionable improvements.
  - **AI Job-Match Scoring:** Evaluates candidate qualifications against specific job requirements in real time to generate a match percentage and skill compatibility breakdown.
  - **AI Job Description Composer:** 1-click automated drafting of professional job descriptions, required skillsets, and key responsibilities for recruiters.
  - **AI Interview Preparation:** Interactive preparation suite generating deep Technical scenarios and Behavioral (STAR framework) questions with model answers. Features dynamic **"+ Fetch More Questions"** pagination to expand question sets on demand without wiping previous progress. Intelligent heuristic fallback ensures zero interruption when OpenAI API keys or quotas are unavailable.
- **Minimalist SaaS Aesthetics:** Monochromatic Dark/Light mode theme with Tailwind CSS, custom scrollbars, and subtle Framer Motion micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **State Management:** Redux Toolkit (`authSlice`, `jobSlice`, `applicationSlice`, `aiSlice`, `themeSlice`)
- **Routing:** React Router DOM v6 with route guards (`ProtectedRoute`, `RoleRoute`)
- **Styling:** Tailwind CSS (custom dark/light tokens)
- **Icons & Motion:** `lucide-react`, `framer-motion`
- **Feedback:** `react-hot-toast`
- **HTTP Client:** Axios (automatic Bearer JWT injection & unified error handling)

### Backend
- **Runtime:** Node.js & Express.js (MVC architecture in `src/`)
- **Database:** MongoDB with Mongoose ODM (text search compound indexes, relation population)
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs` password hashing, and Google OAuth 2.0 (`google-auth-library`)
- **File Uploads & Cloud Storage:** Cloudinary streaming uploads via Multer memory storage (`cloudinary`, `multer`) with local disk fallback
- **Email Service:** Brevo (Sendinblue) Transactional REST API (HTTPS port 443 - zero SMTP blocking on Render) with Nodemailer SMTP fallback & terminal preview
- **AI Integration:** Modular service with OpenAI API integration and intelligent heuristic fallback engine

---

## 📂 Project Architecture

```text
Job_Portal_Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection logic
│   │   │   └── cloudinary.js         # Cloudinary SDK setup
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, OTP verify, Resend, Login, Me
│   │   │   ├── userController.js       # Candidate search, Profile, Resume upload
│   │   │   ├── jobController.js        # Job CRUD, filters, pagination, recruiter metrics
│   │   │   ├── applicationController.js# Apply, my applications, job applicants, status updates
│   │   │   └── aiController.js         # Resume analysis, Job match, Job composer, Interview prep
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js       # JWT validation & user attachment
│   │   │   ├── roleMiddleware.js       # Strict role-based authorization guards
│   │   │   ├── errorMiddleware.js      # Centralized error & 404 handler
│   │   │   └── uploadMiddleware.js     # Multer memory storage & file filtering
│   │   ├── models/
│   │   │   ├── User.js                 # User schema (Candidate & Recruiter profiles)
│   │   │   ├── OTP.js                  # Hashed OTPs with TTL auto-deletion
│   │   │   ├── Job.js                  # Job schema with text search indexes
│   │   │   ├── Application.js          # Unique applications with status timeline
│   │   │   └── SavedJob.js             # Bookmarked positions
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── emailService.js         # Nodemailer email dispatch
│   │   │   ├── otpService.js           # 6-digit OTP generation & bcrypt validation
│   │   │   ├── storageService.js       # Cloudinary streaming upload with local fallback
│   │   │   └── aiService.js            # Modular AI provider (OpenAI + Intelligent Fallback)
│   │   ├── uploads/
│   │   │   └── resumes/                # Local document storage fallback
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   ├── documentExtractor.js    # PDF & Word doc text extraction
│   │   │   └── generateToken.js
│   │   └── app.js                      # Express configuration, middlewares & route mounting
│   ├── .env.example
│   ├── package.json
│   └── server.js                       # Server entrypoint & DB bootstrap
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Navbar, Footer, Modal, Loader, Guards, ThemeToggle
│   │   │   ├── jobs/               # JobCard, JobFilters, JobApplyModal
│   │   │   ├── ai/                 # ResumeScoreBadge
│   │   │   └── dashboard/          # StatCard
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Hero search, categories, featured jobs
│   │   │   ├── Login.jsx           # Sign in with Google OAuth or Email & Password
│   │   │   ├── Register.jsx        # Role selection & registration
│   │   │   ├── VerifyOTP.jsx       # 6-box OTP input with resend cooldown
│   │   │   ├── Jobs.jsx            # Discovery, multi-filtering & pagination
│   │   │   ├── JobDetails.jsx      # Full details, AI Match Score, Apply modal
│   │   │   ├── Profile.jsx         # Skills editor, company profile & resume upload
│   │   │   ├── Applications.jsx    # Candidate tracking with timeline history
│   │   │   ├── SavedJobs.jsx       # Bookmarked positions
│   │   │   ├── JobSeekerDashboard.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── CreateJob.jsx       # With AI Job Composer
│   │   │   ├── EditJob.jsx
│   │   │   ├── ManageJobs.jsx      # Recruiter job management table
│   │   │   ├── ManageApplications.jsx # Candidate resume review & status updates
│   │   │   ├── CandidateList.jsx   # Talent pool search
│   │   │   ├── AiResumeAnalyzer.jsx# Deep ATS score & recommendations
│   │   │   └── InterviewPrep.jsx   # Role-specific technical & behavioral Q&A
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/             # authSlice, jobSlice, applicationSlice, aiSlice, themeSlice
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 2. Installation
Open a terminal in the root project directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Create your `.env` files from the provided examples:

#### Backend (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=job_portal_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=30d

# -------------------------------------------------------------------
# Brevo (Sendinblue) Transactional Email (Required for Render)
# Render blocks SMTP ports 25/465/587. Brevo REST API uses HTTPS (443)
# -------------------------------------------------------------------
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender_email@gmail.com
BREVO_SENDER_NAME=JOBLYST

# Optional Nodemailer SMTP fallback (for local dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=Joblyst <noreply@joblyst.ai>

# Optional: OpenAI API Key (if left blank, intelligent heuristic engine is used)
OPENAI_API_KEY=

CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# Cloudinary Cloud Storage Configuration (optional for local dev with disk fallback)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

### 4. Running the Application

In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Backend runs at http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🚀 Deploying to Render

Render blocks outbound SMTP traffic on ports `25`, `465`, and `587` on free tier services. JOBLYST uses the **Brevo Transactional Email REST API over HTTPS (Port 443)** to guarantee 100% reliable email delivery with zero SMTP timeouts.

### Step 1: Set Up Your Free Brevo Account
1. Create a free account at [brevo.com](https://www.brevo.com) (includes 300 free emails/day).
2. Go to **SMTP & API** -> **API Keys** -> Click **Generate a new API key**. Copy the key (starts with `xkeysib-...`).
3. Go to **Senders, Domains & Dedicated IPs** -> **Senders** -> Click **Add a Sender**.
4. Enter your email (e.g. `yourname@gmail.com`) and confirm the verification email sent to your inbox.

### Step 2: Deploy Backend Web Service on Render
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `joblyst-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string (min 32 characters)*
   - `BREVO_API_KEY`: *Your Brevo API Key (`xkeysib-...`)*
   - `BREVO_SENDER_EMAIL`: *Your verified sender email in Brevo*
   - `BREVO_SENDER_NAME`: `JOBLYST`
   - `CLIENT_URL`: `https://joblyst-frontend.onrender.com` *(or your frontend domain)*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: *(Your Cloudinary keys for resume storage)*
   - `OPENAI_API_KEY`: *(Optional OpenAI key)*
   - `GOOGLE_CLIENT_ID`: *(Optional Google OAuth client ID)*

### Step 3: Deploy Frontend Static Site on Render
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the site:
   - **Name:** `joblyst-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://joblyst-backend.onrender.com/api` *(Your deployed backend URL)*
   - `VITE_GOOGLE_CLIENT_ID`: *(Optional Google OAuth client ID)*
5. In **Redirects / Rewrites**, add a rewrite rule to support React Router SPA:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`

---

## 📧 Testing the OTP Email Verification Flow

1. Navigate to `/register`.
2. Select your role (**Job Seeker** or **Recruiter**) and complete the registration form.
3. You will be redirected to `/verify-email`.
4. If Brevo or SMTP is configured, the OTP arrives directly in your inbox.
   If running in local developer fallback mode without keys, the 6-digit OTP is logged to the backend console:
   ```text
   ======================================================
   ✉️ [DEV EMAIL DISPATCH] To: user@example.com
   🔑 [VERIFICATION OTP CODE]: >>> 849201 <<<
   ⏱️ [EXPIRES IN]: 10 minutes
   ======================================================
   ```
5. Enter the 6 digits on the screen (supports typing or direct paste).
6. Your account is activated, JWT issued, and you are automatically logged into your role-based dashboard!

---

## 🛡️ Security Features
- Secure **HTTP-Only Cookies** (`httpOnly: true`, `SameSite: Lax/Strict`, and `secure` in production) for JWT storage, completely mitigating XSS token theft.
- Passwords and OTPs are hashed using `bcryptjs` with salt rounds.
- Strict server-side route authentication (`protect`) and authorization (`authorizeRole('recruiter')`, `authorizeRole('jobseeker')`).
- File uploads are validated for MIME type (`pdf`, `doc`, `docx`) and file size limits (5MB max).
- Sensitive secrets are restricted to backend environment variables.
- Rate limiting protects API endpoints against brute force attacks.
- Centralized error handler protects internal stack traces in production.

---

## 📄 License
MIT License &copy; 2026 Joblyst.
