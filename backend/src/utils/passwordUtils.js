const zxcvbn = require("zxcvbn");

const validatePassword = (password) => {
  // Basic length check
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for required character types
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    };
  }

  // Check password strength using zxcvbn
  const strength = zxcvbn(password);
  if (strength.score < 3) {
    return {
      isValid: false,
      message:
        strength.feedback.warning ||
        "Password is too weak. Please choose a stronger password.",
    };
  }

  // Check for common patterns
  const commonPatterns = [
    /^12345/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    return {
      isValid: false,
      message:
        "Password contains common patterns. Please choose a more unique password.",
    };
  }

  return {
    isValid: true,
    message: "Password meets all requirements",
  };
};

const generateTempPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";

  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*()"[Math.floor(Math.random() * 10)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

module.exports = {
  validatePassword,
  generateTempPassword,
};
