const config = require("../config/env");

// Mock SMS client for development
const mockSMSClient = {
  messages: {
    create: async ({ body, to }) => {
      console.log("📱 MOCK SMS SENT:");
      console.log(`To: ${to}`);
      console.log(`Message: ${body}`);
      return { sid: "MOCK-SMS-ID-" + Date.now() };
    },
  },
};

// Use real Twilio client only if credentials are available
const client = config.TWILIO_ENABLED
  ? require("twilio")(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
  : mockSMSClient;

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationSMS = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your Sauti verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER || "DEVELOPMENT",
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

const sendWelcomeSMS = async (phoneNumber) => {
  try {
    await client.messages.create({
      body: "Welcome to Sauti! Your phone number has been verified successfully.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return true;
  } catch (error) {
    console.error("Error sending welcome SMS:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendVerificationSMS,
  sendWelcomeSMS,
};
