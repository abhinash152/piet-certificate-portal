import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from './database.js';
import { calculateHash, sanitizeFilename } from '../utils/hashUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.resolve(__dirname, '../../uploads');

console.log('🌱 Starting PIET Certificate Portal seeding...');

// 1. Seed Mentor
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
  console.log(`✅ Default mentor created:\n   Email: ${mentorEmail}\n   Username: ${mentorUsername}\n   Password: ${mentorPassword}`);
} else {
  db.prepare('UPDATE mentors SET password_hash = ? WHERE email = ?').run(passwordHash, mentorEmail);
  console.log(`ℹ️ Default mentor updated (${mentorEmail})`);
}

// Default password for sample students: piet@student2025
const studentDefaultPasswordHash = bcrypt.hashSync('piet@student2025', 10);

// 2. Sample Students with PIET25ADxxx format & 8 Sections (A to H) & Current Year (I st, II nd, III rd, IV th)
const sampleStudents = [
  {
    reg_no: 'PIET25AD012',
    name: 'Aarav Singhania',
    department: 'AI&DS',
    section: 'A',
    current_year: 'II nd Year',
    email: '2025pietad012@poornima.org'
  },
  {
    reg_no: 'PIET25AD045',
    name: 'Priya Sharma',
    department: 'AI&DS',
    section: 'B',
    current_year: 'I st Year',
    email: '2025pietad045@poornima.org'
  },
  {
    reg_no: 'PIET25CS019',
    name: 'Rohan Verma',
    department: 'CS-Core',
    section: 'C',
    current_year: 'III rd Year',
    email: '2025pietcs019@poornima.org'
  },
  {
    reg_no: 'PIET25CS088',
    name: 'Ananya Gupta',
    department: 'CS-Core',
    section: 'D',
    current_year: 'II nd Year',
    email: '2025pietcs088@poornima.org'
  },
  {
    reg_no: 'PIET25IOT005',
    name: 'Devendra Meena',
    department: 'IOT',
    section: 'E',
    current_year: 'IV th Year',
    email: '2025pietiot005@poornima.org'
  },
  {
    reg_no: 'PIET25IOT023',
    name: 'Kavita Rathore',
    department: 'IOT',
    section: 'F',
    current_year: 'I st Year',
    email: '2025pietiot023@poornima.org'
  }
];

// Helper to create a sample certificate SVG image
function createSampleCertImage(title, studentName, org, category) {
  const isWithin = category === 'within';
  const badgeColor = isWithin ? '#1558f5' : '#7c3aed';
  const bgGradStart = isWithin ? '#f0f5ff' : '#f5f0ff';
  const bgGradEnd = '#ffffff';

  return `
<svg width="800" height="560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradStart}"/>
      <stop offset="100%" stop-color="${bgGradEnd}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="25" y="25" width="750" height="510" fill="none" stroke="${badgeColor}" stroke-width="4" stroke-dasharray="10 5" rx="12"/>
  <rect x="40" y="40" width="720" height="480" fill="white" rx="8" filter="url(#shadow)"/>
  
  <!-- Header Banner -->
  <rect x="40" y="40" width="720" height="85" fill="${badgeColor}" rx="8"/>
  <text x="400" y="75" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">POORNIMA INSTITUTE OF ENGINEERING AND TECHNOLOGY</text>
  <text x="400" y="105" font-family="Arial, sans-serif" font-size="14" fill="#e0e7ff" text-anchor="middle">CERTIFICATE OF ACHIEVEMENT</text>
  
  <!-- Content -->
  <text x="400" y="175" font-family="Arial, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">PROUDLY PRESENTED TO</text>
  <text x="400" y="225" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">${studentName}</text>
  
  <line x1="200" y1="245" x2="600" y2="245" stroke="#cbd5e1" stroke-width="1.5"/>
  
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="14" fill="#475569" text-anchor="middle">for exemplary performance and active participation in</text>
  <text x="400" y="325" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${badgeColor}" text-anchor="middle">${title}</text>
  <text x="400" y="360" font-family="Arial, sans-serif" font-size="15" fill="#334155" text-anchor="middle">Organized / Certified by: ${org}</text>
  
  <!-- Badges -->
  <rect x="300" y="400" width="200" height="32" rx="16" fill="${badgeColor}" opacity="0.12"/>
  <text x="400" y="421" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${badgeColor}" text-anchor="middle">${isWithin ? '★ COLLEGE EVENT ★' : '🌐 EXTERNAL CREDENTIAL'}</text>
  
  <!-- Footer signatures -->
  <line x1="120" y1="480" x2="280" y2="480" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="200" y="500" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Faculty Coordinator</text>
  
  <line x1="520" y1="480" x2="680" y2="480" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="600" y="500" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Dean / Director PIET</text>
</svg>
`.trim();
}

// 3. Sample Certificates
const sampleCertificates = [
  // Aarav Singhania (PIET25AD012, AI&DS, A, II nd Year)
  {
    student_reg_no: 'PIET25AD012',
    category: 'within',
    title: 'PIET AURA 2024 - AI Hackathon Winner',
    org: 'PIET Department of AI&DS',
    issue_date: '2024-03-14',
    description: 'Secured 1st position in 24-hr Intra-College Artificial Intelligence Hackathon.',
    filename: 'PIET_AURA_AI_Hackathon_1st.svg'
  },
  {
    student_reg_no: 'PIET25AD012',
    category: 'within',
    title: 'Machine Learning & MLOps Workshop',
    org: 'PIET ACM Student Chapter',
    issue_date: '2024-04-20',
    description: 'Hands-on training in model deployment, Docker, and AWS SageMaker.',
    filename: 'ML_MLOps_HandsOn_Workshop.svg'
  },
  {
    student_reg_no: 'PIET25AD012',
    category: 'outside',
    title: 'Smart India Hackathon (SIH) 2024 Finalist',
    org: 'Ministry of Education & AICTE',
    issue_date: '2024-09-18',
    description: 'National finalist in SIH 2024 Software Edition representing PIET.',
    filename: 'SIH_2024_National_Finalist.svg'
  },
  {
    student_reg_no: 'PIET25AD012',
    category: 'outside',
    title: 'NPTEL Elite + Silver in Deep Learning',
    org: 'IIT Madras / NPTEL',
    issue_date: '2024-05-10',
    description: '12-week course completed with 84% consolidated score.',
    filename: 'NPTEL_Elite_Deep_Learning.svg'
  },

  // Priya Sharma (PIET25AD045, AI&DS, B, I st Year)
  {
    student_reg_no: 'PIET25AD045',
    category: 'within',
    title: 'Python for Data Science Bootcamp',
    org: 'PIET CSI Student Chapter',
    issue_date: '2024-02-15',
    description: 'Completed week-long foundation course in NumPy and Pandas.',
    filename: 'Python_Data_Science_Bootcamp.svg'
  },
  {
    student_reg_no: 'PIET25AD045',
    category: 'outside',
    title: 'Google Cloud Certified: Cloud Digital Leader',
    org: 'Google Cloud Platform',
    issue_date: '2024-08-05',
    description: 'Industry credential verifying foundational cloud capability.',
    filename: 'Google_Cloud_Certified_Leader.svg'
  },

  // Rohan Verma (PIET25CS019, CS-Core, C, III rd Year)
  {
    student_reg_no: 'PIET25CS019',
    category: 'within',
    title: 'PIET TechFest: Best Web App Award',
    org: 'Department of Computer Science',
    issue_date: '2024-04-05',
    description: 'Created campus resource sharing platform.',
    filename: 'TechFest_Best_Web_App.svg'
  },
  {
    student_reg_no: 'PIET25CS019',
    category: 'outside',
    title: 'Coursera Full Stack Web Specialization',
    org: 'University of Michigan & Coursera',
    issue_date: '2024-06-25',
    description: 'React, Node, Express, MongoDB multi-tier web development.',
    filename: 'Coursera_Full_Stack_Web.svg'
  },

  // Ananya Gupta (PIET25CS088, CS-Core, D, II nd Year)
  {
    student_reg_no: 'PIET25CS088',
    category: 'within',
    title: 'Cyber Security & Ethical Hacking Seminar',
    org: 'PIET Department of CSE',
    issue_date: '2024-01-22',
    description: 'Network forensics and web vulnerabilities.',
    filename: 'Cyber_Security_Seminar.svg'
  },
  {
    student_reg_no: 'PIET25CS088',
    category: 'outside',
    title: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    org: 'Microsoft Corporation',
    issue_date: '2024-07-12',
    description: 'Demonstrated knowledge of cloud computing and security.',
    filename: 'Azure_Fundamentals_AZ900.svg'
  },

  // Devendra Meena (PIET25IOT005, IOT, E, IV th Year)
  {
    student_reg_no: 'PIET25IOT005',
    category: 'within',
    title: 'PIET RoboQuest 2024 Champion',
    org: 'Department of IoT & Robotics Lab',
    issue_date: '2024-03-02',
    description: '1st Place in Autonomous Line Follower and Obstacle Avoider robot race.',
    filename: 'RoboQuest_2024_Champion.svg'
  },
  {
    student_reg_no: 'PIET25IOT005',
    category: 'outside',
    title: 'Texas Instruments Embedded Systems Certified',
    org: 'Texas Instruments University Program',
    issue_date: '2024-05-18',
    description: 'Microcontroller programming on MSP430 architecture.',
    filename: 'TI_Embedded_Systems_Cert.svg'
  },

  // Kavita Rathore (PIET25IOT023, IOT, F, I st Year)
  {
    student_reg_no: 'PIET25IOT023',
    category: 'within',
    title: 'Smart Campus IoT Idea Competition',
    org: 'PIET Incubation & Innovation Cell',
    issue_date: '2024-02-28',
    description: 'Proposed smart classroom energy saving sensor mesh.',
    filename: 'Smart_Campus_Idea_Competition.svg'
  }
];

// Insert Students
const now = new Date().toISOString();
const insertStudent = db.prepare(`
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

for (const s of sampleStudents) {
  insertStudent.run(
    s.reg_no,
    s.name,
    s.department,
    s.section,
    s.current_year,
    s.email,
    studentDefaultPasswordHash,
    now,
    now
  );
}
console.log(`✅ Seeded ${sampleStudents.length} students with default password 'piet@student2025' across departments.`);

// Insert Certificates
const insertCert = db.prepare(`
  INSERT INTO certificates (
    id, student_reg_no, category, title, issue_date, description,
    file_path, original_filename, stored_filename, file_size, mime_type,
    file_hash, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?)
  ON CONFLICT(id) DO NOTHING
`);

// Clear old certificates for sample students to avoid duplicates during re-seeding
for (const s of sampleStudents) {
  db.prepare('DELETE FROM certificates WHERE student_reg_no = ?').run(s.reg_no);
}

let seededCertsCount = 0;

for (const cert of sampleCertificates) {
  const student = sampleStudents.find(s => s.reg_no === cert.student_reg_no);
  if (!student) continue;

  const targetDir = path.join(uploadsBaseDir, student.department, student.section, student.reg_no, cert.category);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Generate image content
  const svgContent = createSampleCertImage(cert.title, student.name, cert.org, cert.category);
  const fileBuffer = Buffer.from(svgContent, 'utf-8');
  const fileHash = calculateHash(fileBuffer);

  const storedFilename = sanitizeFilename(cert.filename);
  const filePath = path.join(targetDir, storedFilename);
  fs.writeFileSync(filePath, fileBuffer);

  const relativePath = path.join('uploads', student.department, student.section, student.reg_no, cert.category, storedFilename).replace(/\\/g, '/');

  const certId = crypto.randomUUID();
  insertCert.run(
    certId,
    student.reg_no,
    cert.category,
    cert.title,
    cert.issue_date,
    cert.description,
    relativePath,
    cert.filename,
    storedFilename,
    fileBuffer.length,
    'image/svg+xml',
    fileHash,
    now
  );
  seededCertsCount++;
}

console.log(`✅ Seeded ${seededCertsCount} realistic sample certificates with generated image files.`);
console.log('🎉 Seeding completed successfully!');
