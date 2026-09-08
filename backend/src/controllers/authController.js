import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { createAndSaveOTP, verifyOTPCode } from '../services/otpService.js';
import { sendOTPEmail } from '../services/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper to generate JWT and attach it as an HTTP-only secure cookie
 */
const sendTokenResponse = (res, statusCode, user, message) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
      }
    }
  });
};

// @desc    Register a new user (Job Seeker or Recruiter) & dispatch OTP
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password.');
  }

  if (confirmPassword && password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match.');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists && userExists.isEmailVerified) {
    res.status(400);
    throw new Error('An account with this email already exists and is verified. Please log in.');
  }

  let user = userExists;

  if (!user) {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role === 'recruiter' ? 'recruiter' : 'jobseeker',
      isEmailVerified: false
    });
  } else {
    // If registered before but unverified, update details & password
    user.name = name;
    user.password = password;
    user.role = role === 'recruiter' ? 'recruiter' : 'jobseeker';
    await user.save();
  }

  // Generate OTP and send email
  const plainOTP = await createAndSaveOTP(user.email);
  await sendOTPEmail(user.email, plainOTP, user.name);

  res.status(201).json({
    success: true,
    message: 'Registration successful. A 6-digit verification code has been sent to your email.',
    data: {
      email: user.email,
      role: user.role,
      requiresVerification: true
    }
  });
});

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Please provide both email and 6-digit OTP code.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error('No user account found with this email.');
  }

  // Verify OTP code
  await verifyOTPCode(normalizedEmail, otp.trim());

  // Activate user account
  user.isEmailVerified = true;
  await user.save();

  return sendTokenResponse(res, 200, user, 'Email successfully verified! Welcome to JOBLYST.');
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email.');
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Your email is already verified. Please proceed to log in.'
    });
  }

  const plainOTP = await createAndSaveOTP(user.email);
  await sendOTPEmail(user.email, plainOTP, user.name);

  res.status(200).json({
    success: true,
    message: 'A fresh 6-digit OTP has been sent to your email.'
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter both email and password.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    // Generate and send a fresh OTP automatically
    try {
      const plainOTP = await createAndSaveOTP(user.email);
      await sendOTPEmail(user.email, plainOTP, user.name);
    } catch (e) {
      // Cooldown or error, still prompt verification
    }

    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message: 'Your email is not verified yet. A verification OTP has been sent to your email.'
    });
  }

  return sendTokenResponse(res, 200, user, 'Login successful.');
});

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Authenticate or register user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google credential token is required.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId || undefined
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error(`Google authentication failed: ${err.message}`);
  }

  if (!payload || !payload.email) {
    res.status(400);
    throw new Error('Invalid Google token payload.');
  }

  const { sub: googleId, email, name, picture } = payload;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }]
  });

  if (user) {
    // Existing user
    let needsSave = false;

    if (!user.googleId) {
      user.googleId = googleId;
      needsSave = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      needsSave = true;
    }
    if (picture && (!user.profile || !user.profile.avatar)) {
      if (!user.profile) user.profile = {};
      user.profile.avatar = picture;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }
  } else {
    // New user registration via Google OAuth
    const assignedRole = role === 'recruiter' ? 'recruiter' : 'jobseeker';

    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      role: assignedRole,
      authProvider: 'google',
      googleId,
      isEmailVerified: true,
      profile: {
        avatar: picture || '',
        headline: '',
        bio: '',
        phone: '',
        location: ''
      }
    });
  }

  return sendTokenResponse(res, 200, user, 'Google login successful.');
});

// @desc    Log out user and clear auth cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});
