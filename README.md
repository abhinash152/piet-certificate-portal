# PIET Certificate Portal
### Poornima Institute of Engineering and Technology (PIET), Jaipur

A complete, responsive, production-quality web application where students upload certificates and co-curricular achievements for internal marks evaluation, and mentors inspect, verify, filter, and export student portfolios.

---

## 🌟 Key Features

### 🎓 1. Student Portal & Protected Account Dashboard
- **Identity & Privacy Protection**:
  - Uses **College Email ID** as username with encrypted password hashing (`bcryptjs`).
  - Protects students against unauthorized modifications or deletions of achievements from peers who know their registration number.
  - **Sample Demo Student**: `2025pietad999@poornima.org` / `piet@student2025` (Demo Student, AI&DS, Sec A, II nd Year).
  - Includes a convenient 1-click **"Auto-Fill"** button for instant evaluation.
- **Student Dashboard (`/me`)**:
  - View real-time **RTU / PIET SODECA Activity Marks Progress** (out of 50 marks, with live letter grades: O, A+, A, B, C).
  - Inspect, filter, and view all uploaded certificates (Within vs Outside College).
  - In-place modal to **edit certificate title, date, or description**.
  - Safely **delete** unwanted certificates.
  - One-click **"Print Receipt"** for submission proof.
- **👥 Peer Showcase (Read-Only Access)**:
  - Students can explore achievements and certificates earned by their fellow peers across all departments and sections.
  - Comprehensive filtering by Department (`AI&DS`, `CS-Core`, `IOT`), 8 Sections (`A` to `H`), Current Year (`I st` to `IV th`), and Category.
  - Search by student name, registration number (`PIET25ADxxx`), or event title.
  - **Strictly Read-Only (`only view`)**: Peers can inspect high-resolution certificate images and PDFs, view issuance credentials, but have zero edit, delete, or moderation permissions.
- **Strict Identity Protection**:
  - Direct guest submission without password has been completely removed to safeguard student records from unauthorized modification.
  - Every certificate submission requires sign-in with College Email ID + Password.
- **Step 1 — Student Details & Verification**:
  - Registration Number format example: `PIET25ADxxx` (e.g. `PIET25AD999`, `PIET25AD045`).
  - **8 Sections**: Total 8 configurable sections (`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`).
  - **Current Year**: Replaced academic session with Current Year selector (`I st Year`, `II nd Year`, `III rd Year`, `IV th Year`).
  - Department selection: `CS-Core`, `AI&DS`, `IOT`.
  - Auto-checks if student profile already exists in SQLite database upon entering registration number.
- **Step 2 — Upload Certificates**:
  - Two clearly separated categories:
    1. **"Certificates Earned Within the College"** (workshops, college techfests like AURA, departmental competitions, club hackathons).
    2. **"Certificates Earned Outside the College"** (national hackathons like SIH, NPTEL, Coursera, industry internships, IEEE papers).
  - Multi-file drag-and-drop zones, real-time file previews (images, PDF, Word documents up to 10 MB).
  - Duplicate upload prevention using **SHA-256 cryptographic hashing**.
- **Step 3 — Success & Celebration**:
  - Festive **Canvas Confetti** celebration.
  - Curated inspirational quote generator (25 inspiring engineering & tech quotes).
  - Detailed submission receipt summary and direct jump to **"My Dashboard"**.

---

### 🛡️ 2. Mentor / Admin Portal (`/mentor`)
- **Centered Pop-up Modal Portfolio Inspection**:
  - Clicking the **Eye (Inspect)** icon on any student row immediately launches the student's complete portfolio in a **centered pop-up modal dialog** with backdrop blur.
  - **No scrolling to the bottom of the page required**.
  - Displays student header, real-time SODECA calculation, category filter tabs (All, Within, Outside), thumbnail previews, and batch download options.
- **Secure Authentication**: Hashed password check with JWT tokens and protected backend routes.
- **Default Seeded Mentor**:
  - **Email**: `mentor@piet.poornima.org`
  - **Username**: `pietmentor`
  - **Password**: `piet@mentor2025`
  - *(Includes an "Auto-Fill" helper pill on the login screen for 1-click evaluation demo).*
- **Dashboard Overview Metrics**:
  - Total students enrolled & total certificates archived.
  - Within-college vs. outside-college breakdown & invalid/flagged counter.
  - SODECA marks & grade distribution.
- **Advanced Filtering & Search**:
  - Filter across all **8 Sections (A to H)**, Departments, and Current Year (`I st` to `IV th` Year).
  - Live search bar matching Registration Number, Email, or Student Name.
- **Interactive Certificate Inspector & Academic Export**:
  - High-resolution modal preview for images, embedded preview for PDFs.
  - Flag certificates with faculty notes or delete duplicates.
  - **Download Student ZIP** / **Download Section ZIP**.
  - **Export CSV / Excel**: Includes Registration Number, Name, Department, Section, Current Year, SODECA Marks, and Grade.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion, Lucide React, Canvas Confetti, Axios |
| **Backend** | Node.js (v22+), Express 4, Native `node:sqlite` (zero-dependency, C-speed embedded SQLite), Multer, Archiver, Bcrypt.js, JSON Web Tokens |
| **Storage** | Local disk storage organized as `uploads/<department>/<section>/<regNo>/<within\|outside>/` |
| **Styling** | Modern glassmorphism, responsive mobile-friendly touch targets, PIET blue/purple brand gradients, dark & light mode toggle |

---

## 📁 Project Structure

```
piet-certificate-portal/
├── client/                               # Frontend (React + Vite + Tailwind)
│   ├── index.html                        # Entry HTML with PIET branding & Google Fonts
│   ├── package.json
│   ├── vite.config.js                    # Vite dev server with proxy to port 5000
│   ├── tailwind.config.js                # Custom PIET college palette & glass shadows
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                       # Main application shell & view router
│       ├── index.css                     # Tailwind utilities & dark mode styling
│       ├── config/
│       │   ├── collegeConfig.js          # Configurable departments, sections & regex
│       │   └── quotes.js                 # 25 curated strong motivational quotes
│       ├── context/
│       │   ├── ThemeContext.jsx          # Dark / Light mode persistence
│       │   └── AuthContext.jsx           # Mentor JWT auth state
│       └── components/
│           ├── Header.jsx                # College branding, logo placeholder & theme toggle
│           ├── Footer.jsx                # 'Made for PIET students' footer
│           ├── StepIndicator.jsx         # Stepped progress indicator
│           ├── StudentDetailsStep.jsx    # Step 1: Dept, Section, Reg No validation
│           ├── UploadCertificatesStep.jsx# Step 2: Within & Outside separated dropzones
│           ├── FileDropzone.jsx          # Drag-and-drop file upload component
│           ├── FileCard.jsx              # Thumbnail/icon preview & metadata editor
│           ├── SuccessStep.jsx           # Step 3: Confetti, quote & receipt summary
│           ├── MentorLogin.jsx           # Mentor sign-in with demo auto-fill
│           ├── MentorDashboard.jsx       # Faculty dashboard, student table & ZIP tools
│           └── CertificateViewerModal.jsx# Fullscreen certificate preview & flag/delete
├── server/                               # Backend (Node.js + Express + SQLite)
│   ├── package.json
│   ├── .env                              # Port, JWT secret, and DB config
│   ├── data/
│   │   └── piet_portal.db                # SQLite database (auto-created)
│   ├── uploads/                          # Structured file storage
│   │   └── <department>/<section>/<regNo>/<within|outside>/
│   └── src/
│       ├── server.js                     # Express app setup, CORS, static uploads & error handler
│       ├── db/
│       │   ├── database.js               # SQLite connection using native node:sqlite
│       │   └── seed.js                   # Seeds default mentor & 6 sample students with files
│       ├── middleware/
│       │   ├── auth.js                   # JWT verification middleware
│       │   └── upload.js                 # Multer disk/memory storage & file format checks
│       ├── utils/
│       │   └── hashUtils.js              # SHA-256 duplicate detection & filename sanitizers
│       └── routes/
│           ├── students.js               # Student lookup & profile check
│           ├── certificates.js           # Multipart certificate upload & hash check
│           └── mentor.js                 # Metrics, ZIP streaming, CSV export & certificate flagging
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v22.5.0 or newer (uses native `node:sqlite` for rock-solid performance with zero C++ compilation dependencies).
- **npm**: v10 or newer.

---

### Step 1: Install Dependencies
Open your terminal in the `piet-certificate-portal` directory:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

### Step 2: Seed the Database
Populate the database with the default mentor account and realistic students with certificates across all departments:

```bash
cd ../server
npm run seed
```

Output:
```
🌱 Starting PIET Certificate Portal seeding...
✅ Default mentor created:
   Email: mentor@piet.poornima.org
   Username: pietmentor
   Password: piet@mentor2025
✅ Seeded 6 students across CS-Core, AI&DS, and IOT.
✅ Seeded 14 realistic sample certificates with generated image files.
🎉 Seeding completed successfully!
```

---

### Step 3: Run the Application

#### Option A: Start both servers in separate terminals

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*Server runs at: `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Client runs at: `http://localhost:5173`*

Open **http://localhost:5173** in your web browser.

---

## 🧪 Testing the Application

### 1. Testing the Student Flow
1. Navigate to `http://localhost:5173`.
2. **Step 1 (Student Identification)**:
   - Select Department: `CS-Core` (or `AI&DS`, `IOT`).
   - Select Section: `B`.
   - Registration Number: enter `PIET22CS099`.
   - Student Full Name: enter `Rahul Sharma`.
   - Click **"Continue to Upload Certificates"**.
3. **Step 2 (Upload Certificates)**:
   - Drag and drop or browse files in **"Certificates Earned Within the College"**.
   - Drag and drop or browse files in **"Certificates Earned Outside the College"**.
   - Edit the certificate title and pick an event date.
   - Click **"Final Submit"**. Watch the progress bar encrypt and submit your files.
4. **Step 3 (Success Screen)**:
   - Enjoy the celebratory confetti animation.
   - Read the random motivational quote from the 25+ curated quotes list.
   - Inspect the summary receipt.
   - Test duplicate prevention: Try re-uploading the exact same file for this student; observe the friendly duplicate prevention alert!

### 2. Testing the Mentor / Faculty Flow
1. Click **"Mentor Login"** in the top navigation or navigate to `http://localhost:5173/mentor`.
2. Click the **"Auto-Fill"** button to load the default mentor credentials (`mentor@piet.poornima.org` / `piet@mentor2025`).
3. Click **"Sign In to Dashboard"**.
4. **Test Features in Dashboard**:
   - **View Metrics**: View Total Students, Total Certificates, Within-College, and Outside-College counts.
   - **Filter Records**: Filter by Department (`CS-Core`), Section (`A`), or type a name in the search bar.
   - **Inspect Student Portfolio**: Click any student row to view their certificates grouped into Within and Outside College tabs.
   - **Preview Certificate**: Click on a certificate to open the high-res modal viewer.
   - **Flag / Invalidate**: Click "Flag as Invalid" and enter a reason. Observe the badge update in real-time.
   - **Download Student ZIP**: Click "Download All Certificates (.ZIP)" to test downloading the zipped archive.
   - **Export CSV**: Click "Export CSV" in the top banner to download the Excel internal marks summary.
   - **Light / Dark Mode**: Toggle the sun/moon icon in the header.

---

## 🔒 Security & Quality Assurance
- **Duplicate Prevention**: SHA-256 content hashes are calculated for every file. Students cannot upload the exact same file twice.
- **Filename Sanitization**: Uploaded files are stripped of directory traversal characters and given collision-resistant safe names.
- **Organized Storage**: Uploads strictly follow `uploads/<department>/<section>/<regNo>/<within|outside>/`.
- **JWT Protection**: All `/api/mentor/*` routes (stats, student queries, ZIP generation, CSV export, certificate deletion) require valid JWT Bearer tokens.
