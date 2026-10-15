import multer from 'multer';
import path from 'node:path';

// Allowed MIME types and extensions
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.svg']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream' // Some Windows browsers report docx/doc as octet-stream, extension check will verify
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Unsupported file type '${ext}'. Allowed types: JPG, PNG, WEBP, GIF, PDF, DOC, DOCX`),
      false
    );
  }

  // Also verify mime type if not generic octet-stream
  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error(`Invalid MIME type '${file.mimetype}' for file ${file.originalname}`),
      false
    );
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Up to 20 files per submission batch
  },
  fileFilter
});
