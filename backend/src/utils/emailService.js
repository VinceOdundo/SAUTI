const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email, resetUrl) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>You have requested a password reset</h1>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Error sending password reset email");
    }
  }

  async sendVerificationEmail(email, verificationUrl) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Email Verification",
      html: `
        <h1>Welcome to Our Platform</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Error sending verification email");
    }
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Our Platform",
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Here are some things you can do to get started:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore the dashboard</li>
          <li>Connect with other users</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Error sending welcome email");
    }
  }
}

module.exports = new EmailService();
