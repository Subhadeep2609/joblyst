import nodemailer from 'nodemailer';

/**
 * Brevo (formerly Sendinblue) Transactional Email Dispatcher
 * Communicates directly over HTTPS (Port 443) to avoid SMTP port blocking on cloud hosts like Render.
 */
export const sendBrevoEmail = async ({ to, toName = '', subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not defined.');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  const senderName = process.env.BREVO_SENDER_NAME || 'JOBLYST';

  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL (or EMAIL_USER) is not configured.');
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: to,
        ...(toName ? { name: toName } : {})
      }
    ],
    subject,
    htmlContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`Brevo API Error: ${errorMsg}`);
  }

  return { success: true, messageId: data.messageId, provider: 'brevo' };
};

/**
 * Nodemailer Transporter (Fallback for local dev or unblocked SMTP environments)
 */
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      // Timeout settings so it doesn't hang indefinitely if SMTP port is blocked
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    });
  }
  return null;
};

/**
 * Get active email service configuration status
 */
export const verifyEmailConfig = () => {
  if (process.env.BREVO_API_KEY) {
    const sender = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'Not Set';
    return {
      provider: 'brevo',
      status: 'active',
      description: `Brevo REST API (HTTPS Port 443 - Render Ready) | Sender: ${sender}`
    };
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return {
      provider: 'nodemailer',
      status: 'active',
      description: `Nodemailer SMTP (${process.env.EMAIL_HOST || 'smtp.gmail.com'}:${process.env.EMAIL_PORT || 587})`
    };
  }

  return {
    provider: 'console',
    status: 'dev_fallback',
    description: 'Local Console Fallback (OTPs and notifications print directly to backend terminal)'
  };
};

/**
 * Dispatch an email with fallback logic:
 * 1. Brevo REST API (HTTPS 443) -> Ideal for Render & Cloud
 * 2. Nodemailer SMTP -> Local dev or traditional SMTP
 * 3. Terminal Console -> Local dev fallback
 */
const dispatchEmail = async ({ to, toName, subject, htmlContent, isOTP = false, otpCode = '' }) => {
  // 1. Try Brevo REST API
  if (process.env.BREVO_API_KEY) {
    try {
      const result = await sendBrevoEmail({ to, toName, subject, htmlContent });
      console.log(`[Brevo Email Sent]: Successfully delivered to ${to} (Message ID: ${result.messageId})`);
      return { success: true, provider: 'brevo', messageId: result.messageId };
    } catch (brevoErr) {
      console.error(`[Brevo API Dispatch Failed]: ${brevoErr.message}`);
      // If Brevo fails, proceed to fallback options below
    }
  }

  // 2. Try Nodemailer SMTP (if configured and Brevo was not used or failed)
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.BREVO_SENDER_NAME || 'JOBLYST'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
      });
      console.log(`[Nodemailer Sent]: Delivered to ${to} (ID: ${info.messageId})`);
      return { success: true, provider: 'nodemailer', messageId: info.messageId };
    } catch (smtpErr) {
      console.error(`[Nodemailer SMTP Failed]: ${smtpErr.message}`);
    }
  }

  // 3. Fallback to Console print (so developers or users are NEVER locked out)
  console.log('\n======================================================');
  if (isOTP) {
    console.log(`✉️ [EMAIL DISPATCH FALLBACK] To: ${to}`);
    console.log(`🔑 [VERIFICATION OTP CODE]: >>> ${otpCode} <<<`);
    console.log(`⏱️ [EXPIRES IN]: 10 minutes`);
  } else {
    console.log(`✉️ [NOTIFICATION DISPATCH FALLBACK] To: ${to}`);
    console.log(`📋 [SUBJECT]: ${subject}`);
  }
  console.log('======================================================\n');

  return { success: true, devMode: true };
};

// Send Verification OTP Email
export const sendOTPEmail = async (email, otp, name = 'User') => {
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

  return dispatchEmail({
    to: email,
    toName: name,
    subject: `${otp} is your verification code for JOBLYST`,
    htmlContent,
    isOTP: true,
    otpCode: otp
  });
};

// Send Status Update Email
export const sendApplicationStatusEmail = async (candidateEmail, candidateName, jobTitle, company, status, note = '') => {
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
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #71717a;">
        &copy; ${new Date().getFullYear()} JOBLYST. All rights reserved.
      </div>
    </div>
  `;

  return dispatchEmail({
    to: candidateEmail,
    toName: candidateName,
    subject: `Application Update: ${jobTitle} at ${company} - [${status}]`,
    htmlContent,
    isOTP: false
  });
};
