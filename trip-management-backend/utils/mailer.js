const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPMail = async (toEmail, otp) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Your TripManager Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Verify Your Account</h2>
        <p>Your verification code is:</p>
        <h1 style="text-align: center; background: #f3f4f6; letter-spacing: 5px; padding: 10px; color: #1e40af;">${otp}</h1>
        <p style="font-size: 12px; color: #666;">This code will expire in 5 minutes.</p>
      </div>
    `,
  });
};

const sendBookingConfirmation = async (userEmail, userName, tripDetails) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: userEmail,
    subject: `✈️ Booking Confirmed: ${tripDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #3399cc; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">TripManager</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hi ${userName}, you're all set!</h2>
          <p>Your payment was successful and your trip is confirmed.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px dashed #cbd5e1;">
            <h3>${tripDetails.title}</h3>
            <p><strong>Date:</strong> ${new Date(tripDetails.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Travelers:</strong> ${tripDetails.people} People</p>
            <p><strong>Amount Paid:</strong> ₹${Number(tripDetails.price).toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${tripDetails.transactionId}</p>
          </div>
        </div>
      </div>
    `
  });
};

const sendCancellationEmail = async (userEmail, userName, tripDetails) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: userEmail,
    subject: `❌ Trip Cancelled: ${tripDetails.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #fee2e2; padding: 20px; text-align: center; color: #991b1b;">
          <h1 style="margin: 0;">TripManager</h1>
          <p>Booking Cancellation Notice</p>
        </div>
        <div style="padding: 30px;">
          <h2>Hi ${userName},</h2>
          <p>Your trip has been successfully cancelled.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px dashed #cbd5e1;">
            <h3>${tripDetails.title}</h3>
            <p><strong>Travel Date:</strong> ${new Date(tripDetails.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Amount Paid:</strong> ₹${Number(tripDetails.price).toLocaleString()}</p>
            <p><strong>Refund Status:</strong> ${tripDetails.refundStatus}</p>
            ${tripDetails.refundAmount > 0 ? `<p><strong>Refund Amount:</strong> ₹${Number(tripDetails.refundAmount).toLocaleString()}</p>` : ''}
          </div>
        </div>
      </div>
    `
  });
};

module.exports = { generateOTP, sendOTPMail, sendBookingConfirmation, sendCancellationEmail };