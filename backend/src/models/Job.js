import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    requirements: [
      {
        type: String,
        trim: true
      }
    ],
    responsibilities: [
      {
        type: String,
        trim: true
      }
    ],
    skills: [
      {
        type: String,
        trim: true,
        index: true
      }
    ],
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['year', 'month', 'hour'], default: 'year' }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true
    },
    workplaceType: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid'],
      default: 'Remote'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      default: 'Full-time'
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'],
      default: 'Mid'
    },
    category: {
      type: String,
      default: 'Engineering',
      trim: true,
      index: true
    },
    openings: {
      type: Number,
      default: 1
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
      index: true
    },
    applicationsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound text search index for fast full-text searching
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
  category: 'text'
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
