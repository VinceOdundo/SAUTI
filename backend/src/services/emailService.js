const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Verify your Sauti account",
    html: `
      <h1>Welcome to Sauti!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #3366ff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      ">Verify Email</a>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Welcome to Sauti!",
    html: `
      <h1>Welcome to Sauti, ${user.name}!</h1>
      <p>Your email has been verified successfully.</p>
      <p>You can now access all features of our platform.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
};
