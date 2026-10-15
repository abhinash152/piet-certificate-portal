import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'piet_portal.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for speed and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS mentors (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT DEFAULT 'All',
    role TEXT DEFAULT 'mentor',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    reg_no TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    section TEXT NOT NULL,
    email TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    student_reg_no TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('within', 'outside')),
    title TEXT NOT NULL,
    issue_date TEXT,
    description TEXT,
    file_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    status TEXT DEFAULT 'valid' CHECK(status IN ('valid', 'flagged')),
    flag_reason TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(student_reg_no) REFERENCES students(reg_no) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_cert_student ON certificates(student_reg_no);
  CREATE INDEX IF NOT EXISTS idx_cert_category ON certificates(category);
  CREATE INDEX IF NOT EXISTS idx_cert_hash_student ON certificates(student_reg_no, file_hash);
  CREATE INDEX IF NOT EXISTS idx_student_dept_sec ON students(department, section);
`);

// Safe migrations for student authentication and updated academic fields
try { db.exec("ALTER TABLE students ADD COLUMN password_hash TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE students ADD COLUMN current_year TEXT DEFAULT 'I st Year';"); } catch (e) {}
try { db.exec("ALTER TABLE students ADD COLUMN semester TEXT DEFAULT 'Semester 1';"); } catch (e) {}
try { db.exec("ALTER TABLE certificates ADD COLUMN points_awarded INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE certificates ADD COLUMN verification_status TEXT DEFAULT 'approved';"); } catch (e) {}

export default db;
