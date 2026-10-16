import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌱 Checking default administrator setup...');

// Default Faculty Mentor Admin
const mentorEmail = 'mentor@piet.poornima.org';
const mentorUsername = 'pietmentor';
const mentorPassword = 'piet@mentor2025';
const passwordHash = bcrypt.hashSync(mentorPassword, 10);

const existingMentor = db.prepare('SELECT id FROM mentors WHERE email = ?').get(mentorEmail);
if (!existingMentor) {
  const mentorId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO mentors (id, username, email, password_hash, full_name, department, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mentorId,
    mentorUsername,
    mentorEmail,
    passwordHash,
    'Dr. Neeraj Sharma (Dean Academics & Mentor)',
    'All Departments',
    'admin',
    new Date().toISOString()
  );
  console.log(`✅ Default mentor verified:\n   Email: ${mentorEmail}\n   Username: ${mentorUsername}`);
} else {
  db.prepare('UPDATE mentors SET password_hash = ? WHERE email = ?').run(passwordHash, mentorEmail);
  console.log(`ℹ️ Default mentor updated (${mentorEmail})`);
}

console.log('✨ System initialized without dummy records.');
