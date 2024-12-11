const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_EMAIL,
      accessToken,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

  return transporter;
};

const sendVerificationStatusEmail = async (userEmail, status, notes) => {
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: userEmail,
      subject: `Document Verification ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Document Verification Update</h2>
          <p>Your document verification request has been ${status}.</p>
          ${
            notes ? `<p><strong>Notes from reviewer:</strong> ${notes}</p>` : ""
          }
          ${
            status === "approved"
              ? `
                <p>You now have access to all verified user features. Welcome aboard!</p>
                <p>You can now:</p>
                <ul>
                  <li>Create and manage posts</li>
                  <li>Participate in discussions</li>
                  <li>Access exclusive features</li>
                </ul>
              `
              : `
                <p>If your verification was rejected, you can:</p>
                <ul>
                  <li>Review the notes provided above</li>
                  <li>Submit a new verification request with updated documents</li>
                  <li>Contact support if you need assistance</li>
                </ul>
              `
          }
          <p style="margin-top: 20px;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    const transporter = await createTransporter();
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: user.email,
      subject: "Welcome to Our Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${user.name}!</h2>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>To get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Submit your verification documents</li>
            <li>Explore the platform features</li>
          </ul>
          <p>If you need any assistance, our support team is here to help.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Welcome email error:", error);
    return false;
  }
};

module.exports = {
  sendVerificationStatusEmail,
  sendWelcomeEmail,
};
