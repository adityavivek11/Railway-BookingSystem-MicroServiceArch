const { config } = require('../config');
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Calculate expiration time in minutes (defaults to 5 minutes if not set in config)
const minutes = (config.OTP_TTL || 300) / 60;

/**
 * Sends an OTP verification code to the user's email.
 */
async function sendOtpEmail(email, otp) {
  if (!config.MAIL_SEND) {
    throw new Error('MAIL_SEND is not configured');
  }

  const msg = {
    to: email,
    from: config.MAIL_SEND,
    subject: 'Your Railway Booking System verification code',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 420px;
        margin: auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
      ">
        <h2 style="color: #333333; text-align: center;">Verify Your Email</h2>
        <p style="color: #555555; font-size: 15px;">
          Use the verification code below to complete your sign-in or registration:
        </p>
        <div style="
          text-align: center;
          margin: 25px 0;
        ">
          <span style="
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #4A90E2;
            background-color: #f4f7f9;
            padding: 12px 24px;
            border-radius: 6px;
            border: 1px dashed #4A90E2;
          ">${otp}</span>
        </div>
        <p style="color: #777777; font-size: 13px;">
          This code is valid for <strong>${minutes} minutes</strong>. If you did not request this code, please ignore this email.
        </p>
      </div>`
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
}

/**
 * Sends a confirmation email after the OTP has been successfully verified.
 */
async function verifyOtpEmail(meta) {
  if (!config.MAIL_SEND) {
    throw new Error('MAIL_SEND is not configured');
  }

  const msg = {
    to: meta.email,
    from: config.MAIL_SEND,
    subject: 'Welcome to DesignKarle - Verification Successful!',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 420px;
        margin: auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
      ">
        <h2 style="color: #2e7d32; text-align: center;">Email Verified!</h2>
        <p style="color: #555555; font-size: 15px;">
          Hi ${meta.name || 'there'},
        </p>
        <p style="color: #555555; font-size: 15px;">
          Your email address has been successfully verified. You can now access all features on DesignKarle.
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${config.APP_URL || '#'}" style="
            background-color: #4A90E2;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">Go to Dashboard</a>
        </div>
      </div>`
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "Verification success email sent." };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

module.exports = {
  sendOtpEmail,
  verifyOtpEmail
};