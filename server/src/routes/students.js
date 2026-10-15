import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from '../db/database.js';
import { authenticateStudent } from '../middleware/auth.js';
import { sanitizePathComponent } from '../utils/hashUtils.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'piet_portal_super_secure_jwt_secret_key_2025';

/**
 * POST /api/students/register
 * Student sign-up with College Email ID, Password, and Academic details
 */
router.post('/register', (req, res) => {
  try {
    const { email, password, regNo, name, department, section, currentYear } = req.body;

    if (!email || !password || !regNo || !department || !section) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (College Email, Password, Registration No, Department, Section).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long to secure your account.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRegNo = sanitizePathComponent(regNo.trim().toUpperCase());
    const cleanName = name?.trim() || `Student ${cleanRegNo}`;
    const cleanDept = sanitizePathComponent(department);
    const cleanSection = sanitizePathComponent(section.toUpperCase());
    const cleanYear = currentYear || 'I st Year';
    const now = new Date().toISOString();

    // Check if email or regNo already has a password set
    const existing = db.prepare('SELECT reg_no, email, password_hash FROM students WHERE LOWER(email) = ? OR reg_no = ?')
      .get(cleanEmail, cleanRegNo);

    if (existing && existing.password_hash) {
      return res.status(409).json({
        success: false,
        message: 'An account already exists for this College Email or Registration Number. Please sign in instead.'
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const upsertStudent = db.prepare(`
      INSERT INTO students (reg_no, name, department, section, current_year, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(reg_no) DO UPDATE SET
        name = excluded.name,
        department = excluded.department,
        section = excluded.section,
        current_year = excluded.current_year,
        email = excluded.email,
        password_hash = excluded.password_hash,
        updated_at = excluded.updated_at
    `);

    upsertStudent.run(cleanRegNo, cleanName, cleanDept, cleanSection, cleanYear, cleanEmail, passwordHash, now, now);

    const token = jwt.sign(
      { regNo: cleanRegNo, email: cleanEmail, role: 'student' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const studentRecord = {
      reg_no: cleanRegNo,
      name: cleanName,
      department: cleanDept,
      section: cleanSection,
      current_year: cleanYear,
      email: cleanEmail
    };

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully!',
      token,
      student: studentRecord
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/students/login
 * Student sign-in using College Email ID and Password
 */
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be college email or regNo

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your College Email ID and Password.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    const student = db.prepare(`
      SELECT reg_no, name, department, section, current_year, email, password_hash
      FROM students
      WHERE LOWER(email) = ? OR LOWER(reg_no) = ?
    `).get(cleanId, cleanId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student account found with this College Email or Registration Number. Please create an account.'
      });
    }

    if (!student.password_hash) {
      return res.status(400).json({
        success: false,
        needsPasswordSetup: true,
        message: 'Your profile exists but a password has not been set yet. Please register your password to access your dashboard.'
      });
    }

    const isMatch = bcrypt.compareSync(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    const token = jwt.sign(
      { regNo: student.reg_no, email: student.email, role: 'student' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: `Welcome back, ${student.name}!`,
      token,
      student: {
        reg_no: student.reg_no,
        name: student.name,
        department: student.department,
        section: student.section,
        current_year: student.current_year || 'I st Year',
        email: student.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/students/me
 * Authenticated student profile, statistics, and certificate dossier
 */
router.get('/me', authenticateStudent, (req, res) => {
  try {
    const student = req.student;

    const certificates = db.prepare(`
      SELECT 
        id, category, title, issue_date, description,
        file_path, original_filename, stored_filename, file_size, mime_type,
        status, flag_reason, points_awarded, created_at
      FROM certificates
      WHERE student_reg_no = ?
      ORDER BY created_at DESC
    `).all(student.reg_no);

    const withinCertificates = certificates.filter(c => c.category === 'within');
    const outsideCertificates = certificates.filter(c => c.category === 'outside');

    return res.json({
      success: true,
      student,
      summary: {
        totalCertificates: certificates.length,
        withinCount: withinCertificates.length,
        outsideCount: outsideCertificates.length,
        flaggedCount: certificates.filter(c => c.status === 'flagged').length,
        validCount: certificates.filter(c => c.status !== 'flagged').length
      },
      grouped: {
        within: withinCertificates,
        outside: outsideCertificates
      },
      certificates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/students/certificates/:id
 * Allows authenticated student to edit their own certificate title/date/description
 */
router.patch('/certificates/:id', authenticateStudent, (req, res) => {
  try {
    const certId = req.params.id;
    const { title, issueDate, description } = req.body;

    const cert = db.prepare('SELECT id, student_reg_no FROM certificates WHERE id = ?').get(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    if (cert.student_reg_no !== req.student.reg_no) {
      return res.status(403).json({ success: false, message: 'You can only edit your own certificates.' });
    }

    db.prepare(`
      UPDATE certificates 
      SET title = COALESCE(?, title), issue_date = ?, description = ?
      WHERE id = ?
    `).run(title?.trim() || null, issueDate || null, description?.trim() || null, certId);

    return res.json({ success: true, message: 'Certificate updated successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/students/certificates/:id
 * Allows authenticated student to delete their own uploaded certificate
 */
router.delete('/certificates/:id', authenticateStudent, (req, res) => {
  try {
    const certId = req.params.id;

    const cert = db.prepare('SELECT id, student_reg_no, file_path, title FROM certificates WHERE id = ?').get(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    if (cert.student_reg_no !== req.student.reg_no) {
      return res.status(403).json({ success: false, message: 'You can only delete your own certificates.' });
    }

    // Delete file from disk
    const absolutePath = path.resolve(__dirname, '../../', cert.file_path);
    if (fs.existsSync(absolutePath)) {
      try { fs.unlinkSync(absolutePath); } catch (e) {}
    }

    // Delete from DB
    db.prepare('DELETE FROM certificates WHERE id = ?').run(certId);

    return res.json({ success: true, message: `Certificate '${cert.title}' removed from your portfolio.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/students/peers/showcase
 * Allows students to browse all approved peer certificates across departments and sections (Read-Only)
 */
router.get('/peers/showcase', (req, res) => {
  try {
    const { department, section, search, category, currentYear } = req.query;

    let query = `
      SELECT 
        c.id, c.student_reg_no, c.category, c.title, c.issue_date, c.description,
        c.file_path, c.original_filename, c.stored_filename, c.file_size, c.mime_type,
        c.status, c.created_at,
        s.name as student_name, s.department, s.section, s.current_year, s.email
      FROM certificates c
      JOIN students s ON c.student_reg_no = s.reg_no
      WHERE c.status = 'valid'
    `;
    const params = [];

    if (department && department !== 'ALL') {
      query += ` AND s.department = ?`;
      params.push(department);
    }
    if (section && section !== 'ALL') {
      query += ` AND s.section = ?`;
      params.push(section.toUpperCase());
    }
    if (currentYear && currentYear !== 'ALL') {
      query += ` AND s.current_year = ?`;
      params.push(currentYear);
    }
    if (category && category !== 'ALL') {
      query += ` AND c.category = ?`;
      params.push(category);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (s.name LIKE ? OR s.reg_no LIKE ? OR c.title LIKE ?)`;
      params.push(term, term, term);
    }

    query += ` ORDER BY c.created_at DESC LIMIT 150`;

    const certificates = db.prepare(query).all(...params);

    return res.json({
      success: true,
      certificates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/students/:regNo
 * Lookup student information and stats by registration number (public lookup)
 */
router.get('/:regNo', (req, res) => {
  try {
    const regNo = sanitizePathComponent(req.params.regNo.toUpperCase());
    const student = db.prepare('SELECT reg_no, name, department, section, current_year, email, created_at FROM students WHERE reg_no = ?').get(regNo);

    if (!student) {
      return res.json({ success: true, exists: false });
    }

    const counts = db.prepare(`
      SELECT 
        COUNT(CASE WHEN category = 'within' THEN 1 END) as within_count,
        COUNT(CASE WHEN category = 'outside' THEN 1 END) as outside_count,
        COUNT(*) as total_count
      FROM certificates WHERE student_reg_no = ?
    `).get(regNo);

    return res.json({
      success: true,
      exists: true,
      student: {
        ...student,
        stats: counts
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
