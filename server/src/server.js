import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import multer from 'multer';

import studentsRouter from './routes/students.js';
import certificatesRouter from './routes/certificates.js';
import mentorRouter from './routes/mentor.js';
import './db/database.js'; // initialize DB

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads (enables direct preview & download of certificates)
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PIET Certificate Portal</title>
  <meta http-equiv="refresh" content="2; url=${frontendUrl}" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: white; margin: 0; padding: 1rem; }
    .card { background: rgba(30, 41, 59, 0.9); padding: 2.5rem; border-radius: 1.5rem; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    h1 { color: #60a5fa; margin: 0 0 0.5rem 0; font-size: 1.6rem; letter-spacing: -0.02em; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #1558f5, #7c3aed); color: white; font-weight: bold; text-decoration: none; padding: 0.9rem 2rem; border-radius: 0.85rem; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); transition: all 0.2s; font-size: 1rem; }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.4); }
    .note { margin-top: 1.5rem; font-size: 0.75rem; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎓</div>
    <h1>PIET Certificate Portal API</h1>
    <p>Poornima Institute of Engineering & Technology backend server is online.<br/>Redirecting you to the Web Application...</p>
    <a href="${frontendUrl}" class="btn">
      <span>Open PIET Web Application</span>
      <span>→</span>
    </a>
    <p class="note">Automatically redirecting in 2 seconds...</p>
  </div>
</body>
</html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PIET Certificate Portal API',
    institution: 'Poornima Institute of Engineering and Technology',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/students', studentsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/mentor', mentorRouter);

// Global Error Handler for friendly error messages (including Multer errors)
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size limit exceeded. Each certificate must be under 10 MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files selected. Maximum 20 files can be uploaded per batch.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 PIET Certificate Portal Server running on http://localhost:${PORT}`);
  console.log(`📂 Uploads directory: ${uploadsDir}`);
});

export default app;
