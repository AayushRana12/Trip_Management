const nodemailer = require("nodemailer");

// ✅ 1. Configure the "Engine" (Transporter)
// Replace these with your actual credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generates a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends the OTP to a specific email
 * @param {string} toEmail - The user's email address
 * @param {string} otp - The generated code
 */
const sendOTPMail = async (toEmail, otp) => {
  const mailOptions = {
    from: '"TripManager Team" <aayushh857@gmail.com>',
    to: toEmail,
    subject: "Your TripManager Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Verify Your Account</h2>
        <p>Your verification code is:</p>
        <h1 style="text-align: center; background: #f3f4f6; letter-spacing: 5px; padding: 10px; color: #1e40af;">${otp}</h1>
        <p style="font-size: 12px; color: #666;">This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Mailer Error:", error.message);
    throw error; // Pass the error back to the server
  }
};

/**
 * Sends a visually styled booking confirmation email
 * @param {string} userEmail - The user's email address
 * @param {string} userName - The user's name
 * @param {object} tripDetails - Object containing title, date, people, price, and transactionId
 */
const sendBookingConfirmation = async (userEmail, userName, tripDetails) => {
  const mailOptions = {
    from: '"TripManager Admin" <aayushh857@gmail.com>', // Matching your authenticated user
    to: userEmail,
    subject: `✈️ Booking Confirmed: ${tripDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #3399cc; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">TripManager</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Your gateway to the world</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName}, you're all set!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your payment was successful and your trip is officially confirmed. Here are your booking details:
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px dashed #cbd5e1;">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
              ${tripDetails.title}
            </h3>
            <p style="margin: 8px 0; color: #475569;"><strong>Date:</strong> ${new Date(tripDetails.date).toLocaleDateString('en-IN')}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Travelers:</strong> ${tripDetails.people} People</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Amount Paid:</strong> ₹${Number(tripDetails.price).toLocaleString()}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Transaction ID:</strong> <span style="font-family: monospace; color: #2563eb;">${tripDetails.transactionId}</span></p>
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            You can view your full itinerary and manage your booking anytime by logging into your Dashboard.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/dashboard" style="background-color: #3399cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View My Dashboard
            </a>
          </div>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} TripManager. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error.message);
    throw error;
  }
};

/**
 * Sends a visually styled cancellation email with refund details
 * @param {string} userEmail - The user's email address
 * @param {string} userName - The user's name
 * @param {object} tripDetails - Object containing title, date, price, refundAmount, and refundStatus
 */
const sendCancellationEmail = async (userEmail, userName, tripDetails) => {
  const mailOptions = {
    from: '"TripManager Admin" <aayushh857@gmail.com>',
    to: userEmail,
    subject: `❌ Trip Cancelled: ${tripDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #fee2e2; padding: 20px; text-align: center; color: #991b1b;">
          <h1 style="margin: 0; font-size: 24px;">TripManager</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Booking Cancellation Notice</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            This email is to confirm that your trip has been successfully cancelled. Here are the details of the cancellation:
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px dashed #cbd5e1;">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
              ${tripDetails.title}
            </h3>
            <p style="margin: 8px 0; color: #475569;"><strong>Travel Date:</strong> ${new Date(tripDetails.date).toLocaleDateString('en-IN')}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Amount Paid:</strong> ₹${Number(tripDetails.price).toLocaleString()}</p>
            <p style="margin: 8px 0; color: #475569;"><strong>Refund Status:</strong> <span style="font-weight:bold; color: ${tripDetails.refundAmount > 0 ? '#16a34a' : '#ea580c'}">${tripDetails.refundStatus}</span></p>
            ${tripDetails.refundAmount > 0 ? `<p style="margin: 8px 0; color: #16a34a;"><strong>Refund Amount:</strong> ₹${Number(tripDetails.refundAmount).toLocaleString()}</p>` : ''}
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            If you are eligible for a refund, it will be credited back to your original payment method within 5-7 business days. We hope to travel with you again soon!
          </p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} TripManager. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Cancellation email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
    throw error;
  }
};

// Export the functions to use in server.js
module.exports = { generateOTP, sendOTPMail, sendBookingConfirmation, sendCancellationEmail };