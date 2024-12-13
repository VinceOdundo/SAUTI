const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');
const { getEmailTemplate } = require('../utils/emailTemplates');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${config.CLIENT_URL}/verify-email/${token}`;
    
    const template = getEmailTemplate('email_verification', {
      name: user.name,
      verificationUrl
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Support" <support@sauti.com>',
      to: user.email,
      subject: 'Verify Your Email Address',
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send verification status email
const sendVerificationStatusEmail = async (email, status, name, data = {}) => {
  try {
    const template = getEmailTemplate(`verification_${status}`, {
      name,
      ...data
    });
    
    const subjects = {
      submitted: 'Verification Request Received',
      approved: 'Verification Request Approved',
      rejected: 'Verification Request Update'
    };
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Support" <support@sauti.com>',
      to: email,
      subject: subjects[status],
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification status email:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const template = getEmailTemplate('welcome', {
      name: user.name,
      loginUrl: `${config.CLIENT_URL}/login`
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Support" <support@sauti.com>',
      to: user.email,
      subject: 'Welcome to Sauti!',
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  try {
    const resetUrl = `${config.CLIENT_URL}/reset-password/${token}`;
    
    const template = getEmailTemplate('password_reset', {
      name: user.name,
      resetUrl
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Support" <support@sauti.com>',
      to: user.email,
      subject: 'Reset Your Password',
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send admin notification email
const sendAdminNotificationEmail = async (type, data) => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured');
      return false;
    }

    const template = getEmailTemplate(`admin_${type}`, data);
    
    const subjects = {
      verification_request: 'New Verification Request',
      verification_approved: 'Verification Request Approved',
      verification_rejected: 'Verification Request Rejected',
      organization_created: 'New Organization Registration',
      report_submitted: 'New Report Submitted'
    };
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti System" <system@sauti.com>',
      to: adminEmails.join(','),
      subject: subjects[type],
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

// Send citizen request notification to representative
const sendCitizenRequestNotification = async (representative, citizen, requestType, data = {}) => {
  try {
    const template = getEmailTemplate('citizen_request', {
      representativeName: representative.name,
      citizenName: citizen.name,
      requestType,
      ...data
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Notifications" <notifications@sauti.com>',
      to: representative.email,
      subject: `New ${requestType} Request from ${citizen.name}`,
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending citizen request notification:', error);
    return false;
  }
};

// Send representative response notification to citizen
const sendRepresentativeResponseNotification = async (citizen, representative, responseType, data = {}) => {
  try {
    const template = getEmailTemplate('representative_response', {
      citizenName: citizen.name,
      representativeName: representative.name,
      responseType,
      ...data
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sauti Notifications" <notifications@sauti.com>',
      to: citizen.email,
      subject: `Response to Your ${responseType} Request`,
      html: template
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending representative response notification:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendVerificationStatusEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAdminNotificationEmail,
  sendCitizenRequestNotification,
  sendRepresentativeResponseNotification
};
