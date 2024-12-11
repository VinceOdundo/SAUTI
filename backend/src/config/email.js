module.exports = {
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: {
    name: process.env.FROM_NAME || "Sauti Platform",
    email: process.env.FROM_EMAIL || "noreply@sautiplatform.com",
  },
  templates: {
    welcome: {
      subject: "Welcome to Sauti Platform",
      text: "Welcome to our platform! We're excited to have you on board.",
    },
    verification: {
      subject: "Please Verify Your Email",
      text: "Please verify your email address to complete your registration.",
    },
    passwordReset: {
      subject: "Password Reset Request",
      text: "You have requested to reset your password.",
    },
  },
  settings: {
    verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    passwordResetTokenExpiry: 10 * 60 * 1000, // 10 minutes
  },
};
