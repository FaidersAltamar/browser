"use strict";
/**
 * Email utility functions
 * Simple implementation for password reset emails
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.generatePasswordResetEmail = generatePasswordResetEmail;
const env_1 = require("../config/env");
async function sendEmail(to, subject, html) {
    try {
        // In a real application, you would integrate with an email service like:
        // - SendGrid
        // - Mailgun  
        // - AWS SES
        // - Nodemailer with SMTP
        console.log(`[EMAIL] Would send email to: ${to}`);
        console.log(`[EMAIL] Subject: ${subject}`);
        console.log(`[EMAIL] Content: ${html}`);
        // Return true to simulate successful email sending
        return true;
    }
    catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}
function generatePasswordResetEmail(resetToken, username) {
    const resetUrl = `${env_1.config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>You have requested to reset your password. Click the link below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br>Your App Team</p>
    </div>
  `;
}
