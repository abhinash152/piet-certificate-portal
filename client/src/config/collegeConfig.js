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

  // Passing Year options
  passingYears: [
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030"
  ],

  // Event dropdown options
  events: {
    academic: [
      "Hackathon",
      "Technical Workshop",
      "Others"
    ],
    nonAcademic: [
      "Sports",
      "Dance",
      "Cultural Event",
      "Volunteering",
      "Student Council Certificates",
      "Kalanidhi",
      "Others"
    ]
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
    academic: {
      id: "academic",
      title: "Academic Certificates",
      badge: "Academic",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      description: "Hackathons, Technical Workshops, and other academic technical events.",
      icon: "GraduationCap",
      options: ["Hackathon", "Technical Workshop", "Others"]
    },
    non_academic: {
      id: "non_academic",
      title: "Non-Academic Certificates",
      badge: "Non-Academic",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      description: "Sports, Dance, Cultural Events, Volunteering, Student Council Certificates, Kalanidhi, and others.",
      icon: "Trophy",
      options: ["Sports", "Dance", "Cultural Event", "Volunteering", "Student Council Certificates", "Kalanidhi", "Others"]
    },
    // Backwards compatibility aliases
    get within() { return this.academic; },
    get outside() { return this.non_academic; }
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
