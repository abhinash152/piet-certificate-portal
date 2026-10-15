import crypto from 'node:crypto';
import path from 'node:path';

/**
 * Calculate SHA-256 hash of a file buffer or string
 * @param {Buffer|string} data 
 * @returns {string} Hex hash
 */
export function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Sanitize filename to prevent directory traversal and remove problematic characters
 * @param {string} originalName 
 * @returns {string} Safe sanitized filename
 */
export function sanitizeFilename(originalName) {
  // Extract extension
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext);

  // Replace any non-alphanumeric (except hyphen/underscore) with an underscore
  const sanitizedBase = base
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 60);

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${sanitizedBase || 'cert'}_${timestamp}_${randomSuffix}${ext}`;
}

/**
 * Sanitize path component (department, section, regNo)
 * @param {string} str 
 * @returns {string}
 */
export function sanitizePathComponent(str) {
  if (!str) return 'unknown';
  return str.toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
}
