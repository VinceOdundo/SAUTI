const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${process.env.LOGO_URL || 'https://sauti.com/logo.png'}" alt="Sauti Logo" class="logo">
  </div>
  ${content}
  <div class="footer">
    <p>This is an automated message from Sauti. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} Sauti. All rights reserved.</p>
  </div>
</body>
</html>
`;

const templates = {
  email_verification: (data) => getBaseTemplate(`
    <h1>Welcome to Sauti!</h1>
    <p>Hello ${data.name},</p>
    <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
  `),

  verification_submitted: (data) => getBaseTemplate(`
    <h1>Verification Request Received</h1>
    <p>Hello ${data.name},</p>
    <p>We have received your verification request. Our team will review your documents and get back to you shortly.</p>
    <p>You will receive another email once your verification status has been updated.</p>
    <p>Thank you for your patience.</p>
  `),

  verification_approved: (data) => getBaseTemplate(`
    <h1>Verification Request Approved</h1>
    <p>Hello ${data.name},</p>
    <p>Great news! Your verification request has been approved.</p>
    ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
    ${data.validUntil ? `<p>Your verification is valid until: ${new Date(data.validUntil).toLocaleDateString()}</p>` : ''}
    <p>You now have full access to all verified user features.</p>
  `),

  verification_rejected: (data) => getBaseTemplate(`
    <h1>Verification Request Update</h1>
    <p>Hello ${data.name},</p>
    <p>We regret to inform you that your verification request could not be approved at this time.</p>
    ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
    ${data.notes ? `<p>Additional Notes: ${data.notes}</p>` : ''}
    <p>You may submit a new verification request with updated documents at any time.</p>
  `),

  welcome: (data) => getBaseTemplate(`
    <h1>Welcome to Sauti!</h1>
    <p>Dear ${data.name},</p>
    <p>Thank you for verifying your email address. Your account is now active!</p>
    <p>You can now:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Connect with representatives</li>
      <li>Participate in discussions</li>
      <li>Access local services</li>
    </ul>
    <a href="${data.loginUrl}" class="button">Login to Your Account</a>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `),

  password_reset: (data) => getBaseTemplate(`
    <h1>Password Reset Request</h1>
    <p>Hello ${data.name},</p>
    <p>You requested to reset your password. Click the link below to create a new password:</p>
    <a href="${data.resetUrl}" class="button">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `),

  admin_verification_request: (data) => getBaseTemplate(`
    <h1>New Verification Request</h1>
    <p>A new verification request has been submitted:</p>
    <ul>
      <li>Request ID: ${data.requestId}</li>
      <li>Entity Type: ${data.entityType}</li>
      <li>User Name: ${data.userName}</li>
    </ul>
    <p>Please review this request in the admin dashboard.</p>
  `),

  admin_verification_approved: (data) => getBaseTemplate(`
    <h1>Verification Request Approved</h1>
    <p>A verification request has been approved:</p>
    <ul>
      <li>Request ID: ${data.requestId}</li>
      <li>Entity Type: ${data.entityType}</li>
      <li>User Name: ${data.userName}</li>
      <li>Approved By: ${data.adminName}</li>
    </ul>
  `),

  admin_verification_rejected: (data) => getBaseTemplate(`
    <h1>Verification Request Rejected</h1>
    <p>A verification request has been rejected:</p>
    <ul>
      <li>Request ID: ${data.requestId}</li>
      <li>Entity Type: ${data.entityType}</li>
      <li>User Name: ${data.userName}</li>
      <li>Rejected By: ${data.adminName}</li>
      <li>Reason: ${data.reason}</li>
    </ul>
  `),

  citizen_request: (data) => getBaseTemplate(`
    <h1>New Citizen Request</h1>
    <p>Dear ${data.representativeName},</p>
    <p>A citizen has requested your assistance:</p>
    <ul>
      <li>Citizen Name: ${data.citizenName}</li>
      <li>Request Type: ${data.requestType}</li>
      <li>Date: ${new Date().toLocaleDateString()}</li>
    </ul>
    ${data.description ? `<p>Description: ${data.description}</p>` : ''}
    <p>Please log in to your dashboard to respond to this request.</p>
  `),

  representative_response: (data) => getBaseTemplate(`
    <h1>Representative Response</h1>
    <p>Dear ${data.citizenName},</p>
    <p>Your representative ${data.representativeName} has responded to your ${data.responseType} request.</p>
    ${data.response ? `<p>Response: ${data.response}</p>` : ''}
    ${data.nextSteps ? `<p>Next Steps: ${data.nextSteps}</p>` : ''}
    <p>Please log in to view the full response and continue the conversation.</p>
  `)
};

const getEmailTemplate = (templateName, data = {}) => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  return template(data);
};

module.exports = {
  getEmailTemplate
};
