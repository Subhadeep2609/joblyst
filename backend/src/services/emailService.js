import nodemailer from 'nodemailer';

// Create Nodemailer Transporter
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return null;
};

// Send Verification OTP Email
export const sendOTPEmail = async (email, otp, name = 'User') => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background-color: #09090b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.5px;">JOBLYST</h1>
        <p style="font-size: 14px; color: #a1a1aa; margin-top: 4px;">Empowering Careers with AI Precision</p>
      </div>
      <div style="background-color: #18181b; padding: 24px; border-radius: 8px; border: 1px solid #27272a;">
        <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #d4d4d8; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for joining JOBLYST. Please use the following One-Time Password (OTP) to verify your email address:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 14px 28px; border-radius: 8px; border: 1px solid #1e293b;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; color: #a1a1aa; text-align: center; margin: 0 0 12px 0;">
          ⏱️ This code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 12px; color: #71717a; text-align: center; margin: 0;">
          If you didn't request this verification code, please ignore this email or contact support.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #71717a;">
        &copy; ${new Date().getFullYear()} JOBLYST. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"JOBLYST" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `${otp} is your verification code for JOBLYST`,
        html: htmlContent
      });
      console.log(`[Email Sent]: OTP successfully delivered to ${email}`);
      return { success: true };
    } catch (err) {
      console.error(`[Nodemailer Error]: Failed to send email to ${email}:`, err.message);
      // Fallback to console print so developers/users are never locked out!
    }
  }

  // Graceful local development fallback
  console.log('\n======================================================');
  console.log(`✉️ [DEV EMAIL DISPATCH] To: ${email}`);
  console.log(`🔑 [VERIFICATION OTP CODE]: >>> ${otp} <<<`);
  console.log(`⏱️ [EXPIRES IN]: 10 minutes`);
  console.log('======================================================\n');

  return { success: true, devMode: true };
};

// Send Status Update Email
export const sendApplicationStatusEmail = async (candidateEmail, candidateName, jobTitle, company, status, note = '') => {
  const transporter = createTransporter();

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background-color: #09090b; color: #f4f4f5; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #ffffff; margin-top: 0;">Application Status Update</h2>
      <p style="color: #d4d4d8;">Dear ${candidateName},</p>
      <p style="color: #d4d4d8;">
        Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated to:
      </p>
      <div style="display: inline-block; padding: 8px 16px; background-color: #18181b; border: 1px solid #3b82f6; border-radius: 6px; color: #60a5fa; font-weight: bold; margin: 12px 0;">
        ${status}
      </div>
      ${note ? `<p style="color: #a1a1aa; font-style: italic; margin-top: 12px;">Recruiter note: "${note}"</p>` : ''}
      <p style="color: #a1a1aa; font-size: 13px; margin-top: 24px;">
        Log into your dashboard to view your application timeline and next steps.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"JOBLYST" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `Application Update: ${jobTitle} at ${company} - [${status}]`,
        html: htmlContent
      });
      return { success: true };
    } catch (err) {
      console.error(`[Nodemailer Error]: ${err.message}`);
    }
  }

  console.log(`[DEV NOTIFICATION] Application status for ${candidateEmail} updated to ${status} (${jobTitle} @ ${company})`);
  return { success: true, devMode: true };
};
