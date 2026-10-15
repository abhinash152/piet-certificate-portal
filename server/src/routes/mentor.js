import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';
import db from '../db/database.js';
import { authenticateMentor } from '../middleware/auth.js';
import { sanitizePathComponent } from '../utils/hashUtils.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '../../uploads');

const JWT_SECRET = process.env.JWT_SECRET || 'piet_portal_super_secure_jwt_secret_key_2025';

/**
 * POST /api/mentor/login
 * Authenticates mentor and returns JWT
 */
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email/username and password.' });
    }

    const mentor = db.prepare(
      'SELECT * FROM mentors WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)'
    ).get(identifier.trim(), identifier.trim());

    if (!mentor) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email/username.' });
    }

    const isMatch = bcrypt.compareSync(password, mentor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password is incorrect.' });
    }

    const token = jwt.sign(
      { id: mentor.id, username: mentor.username, role: mentor.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      mentor: {
        id: mentor.id,
        username: mentor.username,
        email: mentor.email,
        full_name: mentor.full_name,
        department: mentor.department,
        role: mentor.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/me
 * Profile of currently authenticated mentor
 */
router.get('/me', authenticateMentor, (req, res) => {
  res.json({ success: true, mentor: req.mentor });
});

/**
 * GET /api/mentor/dashboard
 * Aggregated statistics and summaries
 */
router.get('/dashboard', authenticateMentor, (req, res) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalCertificates = db.prepare('SELECT COUNT(*) as count FROM certificates').get().count;
    const totalWithin = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE category = 'within'").get().count;
    const totalOutside = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE category = 'outside'").get().count;
    const totalFlagged = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE status = 'flagged'").get().count;

    // Breakdown by department
    const deptStats = db.prepare(`
      SELECT 
        s.department,
        COUNT(DISTINCT s.reg_no) as student_count,
        COUNT(c.id) as cert_count,
        COUNT(CASE WHEN c.category = 'within' THEN 1 END) as within_count,
        COUNT(CASE WHEN c.category = 'outside' THEN 1 END) as outside_count
      FROM students s
      LEFT JOIN certificates c ON s.reg_no = c.student_reg_no
      GROUP BY s.department
    `).all();

    // Recent uploads (latest 6)
    const recentCertificates = db.prepare(`
      SELECT 
        c.id, c.title, c.category, c.status, c.created_at, c.original_filename,
        s.reg_no, s.name as student_name, s.department, s.section
      FROM certificates c
      JOIN students s ON c.student_reg_no = s.reg_no
      ORDER BY c.created_at DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCertificates,
        totalWithin,
        totalOutside,
        totalFlagged,
        deptStats,
        recentCertificates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/database/tables
 * Raw Database Explorer (allows mentors/admins to inspect SQLite tables & row data directly)
 */
router.get('/database/tables', authenticateMentor, (req, res) => {
  try {
    const studentsTable = db.prepare('SELECT reg_no, name, department, section, current_year, email, created_at FROM students ORDER BY created_at DESC LIMIT 50').all();
    const certsTable = db.prepare('SELECT id, student_reg_no, category, title, issue_date, file_size, status, created_at FROM certificates ORDER BY created_at DESC LIMIT 50').all();
    const mentorsTable = db.prepare('SELECT id, username, email, full_name, department, role, created_at FROM mentors').all();

    const stats = {
      totalStudents: db.prepare('SELECT COUNT(*) as count FROM students').get().count,
      totalCertificates: db.prepare('SELECT COUNT(*) as count FROM certificates').get().count,
      totalMentors: db.prepare('SELECT COUNT(*) as count FROM mentors').get().count,
      databaseFile: 'server/data/piet_portal.db'
    };

    res.json({
      success: true,
      stats,
      tables: {
        students: studentsTable,
        certificates: certsTable,
        mentors: mentorsTable
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/students
 * Filtered student list with certificates summary
 */
router.get('/students', authenticateMentor, (req, res) => {
  try {
    const { department, section, search, category, startDate, endDate } = req.query;

    let query = `
      SELECT 
        s.reg_no,
        s.name,
        s.department,
        s.section,
        COALESCE(s.current_year, 'I st Year') as current_year,
        COALESCE(s.semester, 'Semester 1') as semester,
        s.email,
        s.created_at,
        COUNT(c.id) as total_certificates,
        COUNT(CASE WHEN c.category = 'within' THEN 1 END) as within_count,
        COUNT(CASE WHEN c.category = 'outside' THEN 1 END) as outside_count,
        COUNT(CASE WHEN c.status = 'flagged' THEN 1 END) as flagged_count,
        MAX(c.created_at) as last_upload_at
      FROM students s
      LEFT JOIN certificates c ON s.reg_no = c.student_reg_no
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'ALL') {
      query += ' AND s.department = ?';
      params.push(department);
    }

    if (section && section !== 'ALL') {
      query += ' AND s.section = ?';
      params.push(section);
    }

    if (search && search.trim()) {
      query += ' AND (s.reg_no LIKE ? OR s.name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (startDate) {
      query += ' AND c.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND c.created_at <= ?';
      params.push(endDate + 'T23:59:59.999Z');
    }

    query += ' GROUP BY s.reg_no ORDER BY last_upload_at DESC NULLS LAST, s.reg_no ASC';

    let students = db.prepare(query).all(...params);

    // If filtering by specific category only, filter students with >0 in that category
    if (category && category !== 'ALL') {
      if (category === 'within') {
        students = students.filter(s => s.within_count > 0);
      } else if (category === 'outside') {
        students = students.filter(s => s.outside_count > 0);
      }
    }

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/students/:regNo
 * Detailed certificates of a student grouped into within and outside
 */
router.get('/students/:regNo', authenticateMentor, (req, res) => {
  try {
    const regNo = sanitizePathComponent(req.params.regNo.toUpperCase());
    const student = db.prepare('SELECT * FROM students WHERE reg_no = ?').get(regNo);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const certificates = db.prepare(`
      SELECT 
        id, student_reg_no, category, title, issue_date, description,
        file_path, original_filename, stored_filename, file_size, mime_type,
        status, flag_reason, created_at
      FROM certificates
      WHERE student_reg_no = ?
      ORDER BY issue_date DESC, created_at DESC
    `).all(regNo);

    const withinCertificates = certificates.filter(c => c.category === 'within');
    const outsideCertificates = certificates.filter(c => c.category === 'outside');

    res.json({
      success: true,
      student,
      summary: {
        total: certificates.length,
        withinCount: withinCertificates.length,
        outsideCount: outsideCertificates.length,
        flaggedCount: certificates.filter(c => c.status === 'flagged').length
      },
      grouped: {
        within: withinCertificates,
        outside: outsideCertificates
      },
      certificates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/mentor/certificates/:id/flag
 * Mark certificate as flagged (invalid/suspicious) or clear flag
 */
router.patch('/certificates/:id/flag', authenticateMentor, (req, res) => {
  try {
    const certId = req.params.id;
    const { status, flagReason } = req.body;

    const cert = db.prepare('SELECT id, title, student_reg_no FROM certificates WHERE id = ?').get(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const newStatus = status === 'flagged' ? 'flagged' : 'valid';
    const reason = newStatus === 'flagged' ? (flagReason || 'Marked as invalid by mentor') : null;

    db.prepare('UPDATE certificates SET status = ?, flag_reason = ? WHERE id = ?').run(newStatus, reason, certId);

    res.json({
      success: true,
      message: newStatus === 'flagged' ? 'Certificate flagged as invalid.' : 'Certificate marked as valid.',
      status: newStatus,
      flagReason: reason
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/mentor/certificates/:id
 * Delete invalid or test certificate and remove file from disk
 */
router.delete('/certificates/:id', authenticateMentor, (req, res) => {
  try {
    const certId = req.params.id;
    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    // Delete file from disk if exists
    const absolutePath = path.resolve(__dirname, '../../', cert.file_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.warn('Could not delete file from disk:', absolutePath, err.message);
      }
    }

    // Delete DB record
    db.prepare('DELETE FROM certificates WHERE id = ?').run(certId);

    res.json({
      success: true,
      message: `Certificate '${cert.title}' has been successfully deleted.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/download/student/:regNo
 * Streams a ZIP file containing all certificates of a student
 */
router.get('/download/student/:regNo', authenticateMentor, (req, res) => {
  try {
    const regNo = sanitizePathComponent(req.params.regNo.toUpperCase());
    const student = db.prepare('SELECT * FROM students WHERE reg_no = ?').get(regNo);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const certificates = db.prepare('SELECT * FROM certificates WHERE student_reg_no = ?').all(regNo);
    if (certificates.length === 0) {
      return res.status(404).json({ success: false, message: 'No certificates found for this student.' });
    }

    const zipFilename = `PIET_${student.department}_${student.section}_${student.reg_no}_Certificates.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('ZIP Error:', err);
      if (!res.headersSent) res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add files to archive
    certificates.forEach((cert, index) => {
      const absPath = path.resolve(__dirname, '../../', cert.file_path);
      if (fs.existsSync(absPath)) {
        const folder = cert.category === 'within' ? 'Within_College' : 'Outside_College';
        const fileExt = path.extname(cert.stored_filename);
        const cleanTitle = cert.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
        const archiveName = `${folder}/${cleanTitle}_${index + 1}${fileExt}`;
        archive.file(absPath, { name: archiveName });
      }
    });

    // Add a metadata summary text file inside the zip
    const manifestText = `PIET CERTIFICATE SUBMISSION MANIFEST
--------------------------------------------------
Student Name:       ${student.name}
Registration No:    ${student.reg_no}
Department:         ${student.department}
Section:            ${student.section}
Total Certificates: ${certificates.length}
Within College:     ${certificates.filter(c => c.category === 'within').length}
Outside College:    ${certificates.filter(c => c.category === 'outside').length}
Downloaded At:      ${new Date().toLocaleString()}
--------------------------------------------------
Certificates List:
${certificates.map((c, i) => `${i + 1}. [${c.category.toUpperCase()}] ${c.title} (Issued: ${c.issue_date || 'N/A'}, Status: ${c.status})`).join('\n')}
`;
    archive.append(manifestText, { name: 'Submission_Summary.txt' });

    archive.finalize();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/download/section
 * Streams a ZIP file containing all certificates for a specific department and section
 */
router.get('/download/section', authenticateMentor, (req, res) => {
  try {
    const { department, section } = req.query;

    if (!department || !section) {
      return res.status(400).json({ success: false, message: 'Please specify both department and section.' });
    }

    const cleanDept = sanitizePathComponent(department);
    const cleanSection = sanitizePathComponent(section.toUpperCase());

    const students = db.prepare(
      'SELECT * FROM students WHERE department = ? AND section = ?'
    ).all(cleanDept, cleanSection);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: `No students found for ${cleanDept} Section ${cleanSection}.` });
    }

    const zipFilename = `PIET_${cleanDept}_Section_${cleanSection}_All_Certificates.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const student of students) {
      const certificates = db.prepare('SELECT * FROM certificates WHERE student_reg_no = ?').all(student.reg_no);
      for (const cert of certificates) {
        const absPath = path.resolve(__dirname, '../../', cert.file_path);
        if (fs.existsSync(absPath)) {
          const categoryFolder = cert.category === 'within' ? 'Within_College' : 'Outside_College';
          const archivePath = `${student.reg_no}_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}/${categoryFolder}/${cert.stored_filename}`;
          archive.file(absPath, { name: archivePath });
        }
      }
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/mentor/export-csv
 * Exports student certificate summary to CSV for internal marks calculation
 */
router.get('/export-csv', authenticateMentor, (req, res) => {
  try {
    const { department, section } = req.query;

    let query = `
      SELECT 
        s.reg_no,
        s.name,
        s.department,
        s.section,
        COALESCE(s.current_year, 'I st Year') as current_year,
        s.email,
        COUNT(c.id) as total_certificates,
        COUNT(CASE WHEN c.category = 'within' AND c.status = 'valid' THEN 1 END) as within_valid,
        COUNT(CASE WHEN c.category = 'outside' AND c.status = 'valid' THEN 1 END) as outside_valid,
        COUNT(CASE WHEN c.category = 'within' THEN 1 END) as within_count,
        COUNT(CASE WHEN c.category = 'outside' THEN 1 END) as outside_count,
        COUNT(CASE WHEN c.status = 'flagged' THEN 1 END) as flagged_count,
        MAX(c.created_at) as last_submission_date
      FROM students s
      LEFT JOIN certificates c ON s.reg_no = c.student_reg_no
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'ALL') {
      query += ' AND s.department = ?';
      params.push(department);
    }
    if (section && section !== 'ALL') {
      query += ' AND s.section = ?';
      params.push(section);
    }

    query += ' GROUP BY s.reg_no ORDER BY s.department, s.section, s.reg_no';

    const records = db.prepare(query).all(...params);

    // Build CSV with UTF-8 BOM for flawless Excel opening
    const headers = [
      'Registration Number',
      'Student Name',
      'Department',
      'Section',
      'Current Year',
      'Email',
      'Within College Certificates',
      'Outside College Certificates',
      'Flagged (Invalid)',
      'Total Valid Certificates',
      'SODECA / Internal Activity Marks (Max 50)',
      'Performance Grade',
      'Last Submission Date'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = records.map(r => {
      const validTotal = Math.max(0, r.total_certificates - r.flagged_count);
      const withinValid = r.within_valid || 0;
      const outsideValid = r.outside_valid || 0;
      // Formula: 5 points for within college, 10 points for outside college, max capped at 50
      const marks = Math.min(50, (withinValid * 5) + (outsideValid * 10));
      let grade = 'C (Needs Improvement)';
      if (marks >= 45) grade = 'O (Outstanding)';
      else if (marks >= 38) grade = 'A+ (Excellent)';
      else if (marks >= 30) grade = 'A (Very Good)';
      else if (marks >= 20) grade = 'B (Good)';

      return [
        escapeCsv(r.reg_no),
        escapeCsv(r.name),
        escapeCsv(r.department),
        escapeCsv(r.section),
        escapeCsv(r.current_year),
        escapeCsv(r.email || 'N/A'),
        r.within_count || 0,
        r.outside_count || 0,
        r.flagged_count || 0,
        validTotal,
        marks,
        escapeCsv(grade),
        escapeCsv(r.last_submission_date ? new Date(r.last_submission_date).toLocaleDateString() : 'None')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    const filename = `PIET_Internal_Marks_Summary_${department || 'All'}_${section || 'All'}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
