import crypto from 'crypto';
import OTP from '../models/OTP.js';

export const generateOTPCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const createAndSaveOTP = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check rate limit: if an OTP was sent in the last 60 seconds, prevent spamming
  const existingOTP = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
  if (existingOTP) {
    const elapsedSeconds = (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
    if (elapsedSeconds < 60) {
      const waitSeconds = Math.ceil(60 - elapsedSeconds);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }
    // Remove previous OTPs for this email to prevent multiple valid OTPs
    await OTP.deleteMany({ email: normalizedEmail });
  }

  const plainOTP = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Save OTP (pre-save hook will hash it with bcrypt)
  await OTP.create({
    email: normalizedEmail,
    otp: plainOTP,
    expiresAt,
    attempts: 0
  });

  return plainOTP;
};

export const verifyOTPCode = async (email, enteredOTP) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpDoc = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new Error('OTP has expired or does not exist. Please request a new one.');
  }

  // Check attempts
  if (otpDoc.attempts >= 5) {
    await OTP.deleteOne({ _id: otpDoc._id });
    throw new Error('Too many invalid attempts. This OTP is invalidated. Please request a new one.');
  }

  // Verify expiry
  if (new Date() > otpDoc.expiresAt) {
    await OTP.deleteOne({ _id: otpDoc._id });
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Compare OTP
  const isMatch = await otpDoc.matchOTP(enteredOTP);
  if (!isMatch) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new Error(`Invalid OTP. You have ${5 - otpDoc.attempts} attempts remaining.`);
  }

  // Valid OTP! Remove it to prevent replay attacks
  await OTP.deleteOne({ _id: otpDoc._id });
  return true;
};
