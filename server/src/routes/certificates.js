import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import db from '../db/database.js';
import { upload } from '../middleware/upload.js';
import { calculateHash, sanitizeFilename, sanitizePathComponent } from '../utils/hashUtils.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(__dirname, '../../uploads');

/**
 * POST /api/certificates/upload
 * Handles multi-part certificate uploads with metadata and duplicate prevention
 */
router.post('/upload', upload.array('files', 20), (req, res) => {
  try {
    const { regNo, name, department, section, email, currentYear, passingYear, certificatesMeta } = req.body;

    if (!regNo || !department || !section) {
      return res.status(400).json({
        success: false,
        message: 'Missing required student details (Registration Number, Department, Section).'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No certificate files were uploaded.'
      });
    }

    // Parse metadata
    let metadataList = [];
    if (certificatesMeta) {
      try {
        metadataList = typeof certificatesMeta === 'string' ? JSON.parse(certificatesMeta) : certificatesMeta;
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid certificates metadata JSON format.' });
      }
    }

    const cleanRegNo = sanitizePathComponent(regNo.toUpperCase());
    const cleanDept = sanitizePathComponent(department);
    const cleanSection = sanitizePathComponent(section.toUpperCase());
    const cleanYear = currentYear ? currentYear.trim() : 'I st Year';
    const cleanPassingYear = passingYear ? passingYear.trim() : '2026';
    const studentName = (name && name.trim()) || `Student ${cleanRegNo}`;
    const studentEmail = email ? email.trim() : null;
    const now = new Date().toISOString();

    // 1. Check for duplicates in the current batch or in database for this student
    const checkDuplicateStmt = db.prepare(
      'SELECT id, original_filename, title FROM certificates WHERE student_reg_no = ? AND file_hash = ?'
    );

    const batchHashes = new Set();
    const preparedUploads = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const meta = metadataList[i] || {};
      const rawCategory = meta.category || '';
      const category = (rawCategory === 'non_academic' || rawCategory === 'non-academic' || rawCategory === 'outside') 
        ? 'non_academic' 
        : 'academic';
      const title = (meta.title && meta.title.trim()) || file.originalname;
      const issueDate = meta.issueDate || null;
      const description = meta.description || null;

      // Hash calculation
      const fileHash = calculateHash(file.buffer);

      // Check within current batch
      if (batchHashes.has(fileHash)) {
        return res.status(409).json({
          success: false,
          message: `Duplicate file detected in current upload batch: '${file.originalname}'. Please remove duplicate files.`
        });
      }
      batchHashes.add(fileHash);

      // Check against DB for this student
      const existing = checkDuplicateStmt.get(cleanRegNo, fileHash);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Duplicate upload prevented: You have already submitted the exact same certificate file ('${file.originalname}') as '${existing.title}'.`
        });
      }

      preparedUploads.push({
        file,
        category,
        title,
        issueDate,
        description,
        fileHash
      });
    }

    // 2. Insert or update student record with current_year and passing_year
    const upsertStudent = db.prepare(`
      INSERT INTO students (reg_no, name, department, section, current_year, passing_year, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(reg_no) DO UPDATE SET
        name = excluded.name,
        department = excluded.department,
        section = excluded.section,
        email = COALESCE(excluded.email, students.email),
        current_year = COALESCE(excluded.current_year, students.current_year),
        passing_year = COALESCE(excluded.passing_year, students.passing_year),
        updated_at = excluded.updated_at
    `);
    upsertStudent.run(cleanRegNo, studentName, cleanDept, cleanSection, cleanYear, cleanPassingYear, studentEmail, now, now);

    // 3. Save files to disk and insert certificates
    const insertCert = db.prepare(`
      INSERT INTO certificates (
        id, student_reg_no, category, title, issue_date, description,
        file_path, original_filename, stored_filename, file_size, mime_type,
        file_hash, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?)
    `);

    const savedCertificates = [];
    let academicCount = 0;
    let nonAcademicCount = 0;

    for (const item of preparedUploads) {
      const { file, category, title, issueDate, description, fileHash } = item;

      // Directory: uploads/<department>/<section>/<regNo>/<academic|non_academic>/
      const targetDir = path.join(uploadsBaseDir, cleanDept, cleanSection, cleanRegNo, category);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const storedFilename = sanitizeFilename(file.originalname);
      const absoluteFilePath = path.join(targetDir, storedFilename);

      // Write file
      fs.writeFileSync(absoluteFilePath, file.buffer);

      // Relative path for database and public serving
      const relativeFilePath = path.join('uploads', cleanDept, cleanSection, cleanRegNo, category, storedFilename).replace(/\\/g, '/');

      const certId = crypto.randomUUID();
      insertCert.run(
        certId,
        cleanRegNo,
        category,
        title,
        issueDate,
        description,
        relativeFilePath,
        file.originalname,
        storedFilename,
        file.size,
        file.mimetype,
        fileHash,
        now
      );

      if (category === 'academic') academicCount++;
      else nonAcademicCount++;

      savedCertificates.push({
        id: certId,
        title,
        category,
        filename: file.originalname,
        size: file.size
      });
    }

    // Get updated total counts for student
    const totalAcademic = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE student_reg_no = ? AND category IN ('academic', 'within')").get(cleanRegNo).count;
    const totalNonAcademic = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE student_reg_no = ? AND category IN ('non_academic', 'non-academic', 'outside')").get(cleanRegNo).count;

    return res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedCertificates.length} certificate(s)!`,
      summary: {
        regNo: cleanRegNo,
        name: studentName,
        department: cleanDept,
        section: cleanSection,
        passingYear: cleanPassingYear,
        newBatchCount: savedCertificates.length,
        newAcademicCount: academicCount,
        newNonAcademicCount: nonAcademicCount,
        totalAcademicCount: totalAcademic,
        totalNonAcademicCount: totalNonAcademic,
        totalCertificates: totalAcademic + totalNonAcademic,
        // Legacy compatibility
        newWithinCount: academicCount,
        newOutsideCount: nonAcademicCount,
        totalWithinCount: totalAcademic,
        totalOutsideCount: totalNonAcademic
      },
      certificates: savedCertificates
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while saving certificates.'
    });
  }
});

/**
 * GET /api/certificates/student/:regNo
 * Retrieve all certificates submitted by a specific student (for checking or student view)
 */
router.get('/student/:regNo', (req, res) => {
  try {
    const regNo = sanitizePathComponent(req.params.regNo.toUpperCase());
    const student = db.prepare('SELECT * FROM students WHERE reg_no = ?').get(regNo);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const certificates = db.prepare(
      'SELECT id, category, title, issue_date, description, file_path, original_filename, file_size, mime_type, status, flag_reason, created_at FROM certificates WHERE student_reg_no = ? ORDER BY created_at DESC'
    ).all(regNo);

    return res.json({
      success: true,
      student,
      certificates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/certificates/download/:id
 * Direct download of a certificate file with proper Content-Disposition header
 */
router.get('/download/:id', (req, res) => {
  try {
    const certId = req.params.id;
    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const absolutePath = path.resolve(__dirname, '../../', cert.file_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Certificate file not found on server disk.' });
    }

    // Direct download with original filename
    return res.download(absolutePath, cert.original_filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
