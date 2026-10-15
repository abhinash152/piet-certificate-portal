/**
 * PIET College Configuration
 * Configurable departments, 8 sections, current year, and validation rules.
 */

export const COLLEGE_CONFIG = {
  collegeName: "Poornima Institute of Engineering and Technology",
  collegeShortName: "PIET",
  collegeTagline: "An Autonomous Institution approved by RTU, AICTE & UGC • NAAC 'A' Accredited",
  campusLocation: "ISI-2, RIICO Institutional Area, Sitapura, Jaipur, Rajasthan",
  portalName: "Certificate & Achievement Portal",
  
  // Official College Logos (stored in client/public/)
  logos: {
    banner: "/piet-banner-logo.png",
    crest: "/piet-crest-logo.png"
  },

  // Configurable departments
  departments: [
    { id: "CS-Core", label: "Computer Science & Engineering (Core)", short: "CS-Core", code: "CS" },
    { id: "AI&DS", label: "Artificial Intelligence & Data Science", short: "AI&DS", code: "AIDS" },
    { id: "IOT", label: "Internet of Things (IoT)", short: "IOT", code: "IOT" },
  ],

  // Total 8 Sections (A to H) as per PIET structure
  sections: ["A", "B", "C", "D", "E", "F", "G", "H"],

  // Current Year options (I st, II nd, III rd, IV th)
  currentYears: [
    "I st Year",
    "II nd Year",
    "III rd Year",
    "IV th Year"
  ],

  // SODECA / Internal Marks Evaluation Scheme (PIET / RTU Guidelines)
  internalMarks: {
    withinPoints: 5,        // 5 points per within-college workshop/fest
    outsidePoints: 10,      // 10 points per national hackathon / NPTEL / Coursera
    maxMarks: 50,           // Capped maximum internal activity marks
    calculate: (withinCount = 0, outsideCount = 0) => {
      const raw = (withinCount * 5) + (outsideCount * 10);
      const score = Math.min(50, raw);
      const percentage = Math.round((score / 50) * 100);
      
      let grade = "C (Needs Improvement)";
      let gradeColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
      
      if (score >= 45) {
        grade = "O (Outstanding)";
        gradeColor = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800";
      } else if (score >= 38) {
        grade = "A+ (Excellent)";
        gradeColor = "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800";
      } else if (score >= 30) {
        grade = "A (Very Good)";
        gradeColor = "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800";
      } else if (score >= 20) {
        grade = "B (Good)";
        gradeColor = "text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800";
      }

      return { score, maxMarks: 50, percentage, grade, gradeColor, rawScore: raw };
    }
  },

  // Registration Number formatting & validation rules
  // Example format requested: PIET25ADxxx (e.g., PIET25AD999, PIET25CS045)
  regNo: {
    placeholder: "e.g., PIET25ADxxx or PIET25AD999",
    regex: /^[A-Za-z0-9]{6,16}$/,
    formatHelper: "College Reg No. format: PIET25ADxxx (6–16 alphanumeric characters)",
    errorMessage: "Please enter a valid Registration Number (e.g., PIET25ADxxx)",
  },

  // Certificate categories
  categories: {
    within: {
      id: "within",
      title: "Certificates Earned Within the College",
      badge: "Within College",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      description: "Workshops, fests, department events, internal hackathons, sports, cultural competitions & club activities.",
      icon: "Building2",
    },
    outside: {
      id: "outside",
      title: "Certificates Earned Outside the College",
      badge: "Outside College",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      description: "National hackathons, NPTEL, Coursera, industry internships, IEEE papers & external tech competitions.",
      icon: "Globe",
    }
  },

  // Allowed upload file rules
  uploads: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxSizeMB: 10,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".doc", ".docx", ".svg"],
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  }
};
