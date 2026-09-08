import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startYear: { type: String },
  endYear: { type: String }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ],
      index: true
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter'],
      default: 'jobseeker',
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    profile: {
      headline: { type: String, default: '' },
      bio: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      avatar: { type: String, default: '' },
      // Candidate Specific
      skills: [{ type: String, trim: true }],
      experience: [experienceSchema],
      education: [educationSchema],
      resume: { type: String, default: '' },
      resumeOriginalName: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      // Recruiter Specific
      companyName: { type: String, default: '' },
      companyWebsite: { type: String, default: '' },
      companyLogo: { type: String, default: '' },
      companySize: { type: String, default: '' },
      companyBio: { type: String, default: '' },
      companyLocation: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
