import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'piet_portal_super_secure_jwt_secret_key_2025';

export function authenticateMentor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in as a mentor.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const stmt = db.prepare('SELECT id, username, email, full_name, department, role FROM mentors WHERE id = ?');
    const mentor = stmt.get(decoded.id);

    if (!mentor) {
      return res.status(401).json({ success: false, message: 'Invalid token: Mentor record not found.' });
    }

    req.mentor = mentor;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or forged token.' });
  }
}

export function authenticateStudent(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in with your college credentials.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Unauthorized student access.' });
    }

    const student = db.prepare(
      'SELECT reg_no, name, department, section, current_year, semester, email, created_at FROM students WHERE reg_no = ?'
    ).get(decoded.regNo);

    if (!student) {
      return res.status(401).json({ success: false, message: 'Student account not found.' });
    }

    req.student = student;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Student session expired. Please sign in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or expired student token.' });
  }
}
