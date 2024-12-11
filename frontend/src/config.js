// API Configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// File Upload Configuration
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = {
  image: [".jpg", ".jpeg", ".png", ".gif"],
  document: [".pdf", ".doc", ".docx"],
};

// Authentication Configuration
export const TOKEN_KEY = "token";
export const AUTH_HEADER = "Authorization";
export const AUTH_SCHEME = "Bearer";

// Pagination Configuration
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Location Configuration
export const KENYA_COUNTIES = [
  "Mombasa",
  "Kwale",
  "Kilifi",
  "Tana River",
  "Lamu",
  "Taita Taveta",
  "Garissa",
  "Wajir",
  "Mandera",
  "Marsabit",
  "Isiolo",
  "Meru",
  "Tharaka Nithi",
  "Embu",
  "Kitui",
  "Machakos",
  "Makueni",
  "Nyandarua",
  "Nyeri",
  "Kirinyaga",
  "Murang'a",
  "Kiambu",
  "Turkana",
  "West Pokot",
  "Samburu",
  "Trans Nzoia",
  "Uasin Gishu",
  "Elgeyo Marakwet",
  "Nandi",
  "Baringo",
  "Laikipia",
  "Nakuru",
  "Narok",
  "Kajiado",
  "Kericho",
  "Bomet",
  "Kakamega",
  "Vihiga",
  "Bungoma",
  "Busia",
  "Siaya",
  "Kisumu",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Nairobi",
];

// Organization Types
export const ORGANIZATION_TYPES = [
  "NGO",
  "CBO",
  "Faith Based",
  "Government Agency",
  "Private Company",
  "Other",
];

// Representative Roles
export const REPRESENTATIVE_ROLES = [
  "Member of Parliament",
  "Senator",
  "Governor",
  "County Assembly Member",
  "Chief",
  "Community Leader",
  "Organization Representative",
  "Other",
];

// Post Categories
export const POST_CATEGORIES = [
  "Announcement",
  "Project Update",
  "Event",
  "Discussion",
  "Poll",
  "Report",
  "Other",
];

// Notification Types
export const NOTIFICATION_TYPES = {
  COMMENT: "comment",
  LIKE: "like",
  FOLLOW: "follow",
  MENTION: "mention",
  SYSTEM: "system",
};

// Time Formats
export const DATE_FORMAT = "MMMM D, YYYY";
export const TIME_FORMAT = "h:mm A";
export const DATETIME_FORMAT = "MMMM D, YYYY h:mm A";

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  facebook: {
    name: "Facebook",
    baseUrl: "https://facebook.com/",
  },
  twitter: {
    name: "Twitter",
    baseUrl: "https://twitter.com/",
  },
  instagram: {
    name: "Instagram",
    baseUrl: "https://instagram.com/",
  },
  linkedin: {
    name: "LinkedIn",
    baseUrl: "https://linkedin.com/in/",
  },
};

// Contact Information
export const CONTACT_INFO = {
  email: "support@sauti.com",
  phone: "+254 700 000000",
  address: "Nairobi, Kenya",
};

// Support Categories
export const SUPPORT_CATEGORIES = [
  "Account Issues",
  "Technical Problems",
  "Feature Requests",
  "Bug Reports",
  "General Inquiries",
  "Other",
];
