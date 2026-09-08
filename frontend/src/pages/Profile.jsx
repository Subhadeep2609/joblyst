import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  User,
  Building2,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  Globe,
  Github,
  Linkedin,
  Save,
  CheckCircle2
} from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    phone: '',
    location: '',
    skills: '',
    portfolio: '',
    github: '',
    linkedin: '',
    // Recruiter fields
    companyName: '',
    companyWebsite: '',
    companyLogo: '',
    companySize: '',
    companyBio: '',
    companyLocation: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        headline: user.profile?.headline || '',
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        skills: Array.isArray(user.profile?.skills) ? user.profile.skills.join(', ') : '',
        portfolio: user.profile?.portfolio || '',
        github: user.profile?.github || '',
        linkedin: user.profile?.linkedin || '',
        companyName: user.profile?.companyName || '',
        companyWebsite: user.profile?.companyWebsite || '',
        companyLogo: user.profile?.companyLogo || '',
        companySize: user.profile?.companySize || '',
        companyBio: user.profile?.companyBio || '',
        companyLocation: user.profile?.companyLocation || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, and DOCX files are allowed.');
      return;
    }

    try {
      setUploadingResume(true);
      const data = new FormData();
      data.append('resume', file);
      const res = await api.post('/users/upload-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume uploaded and attached to profile!');
      // Update local Redux user state
      dispatch(updateProfile({}));
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      ...formData,
      skills: skillsArray
    };

    const result = await dispatch(updateProfile(payload));
    setSaving(false);

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(result.payload || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <User className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Account & Profile Settings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Role: <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">{user?.role}</span> &bull; Verified: {user?.isEmailVerified ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Personal Details */}
        <div className="card-surface p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="input-field text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="input-field text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Professional Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack & AI Applications Engineer"
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Bio & Summary
            </label>
            <textarea
              rows="3"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell hiring teams about your focus and background..."
              className="input-field text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Candidate Specific: Resume & Skills */}
        {user?.role === 'jobseeker' && (
          <>
            {/* Resume Upload Card */}
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                Resume & Portfolio Document
              </h2>

              {user?.profile?.resume ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-sky-500" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.profile.resumeOriginalName || 'Resume.pdf'}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Currently attached to your profile and 1-click applications
                      </p>
                    </div>
                  </div>
                  <a
                    href={user.profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No resume currently uploaded to profile.
                </p>
              )}

              <div className="pt-2">
                <label className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  {uploadingResume ? 'Uploading...' : 'Upload New Resume (PDF, DOCX)'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Skills & Links */}
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Technical Skills & Links
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, TypeScript, Node.js, MongoDB, Docker, AWS"
                  className="input-field text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Personal Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://myportfolio.dev"
                    className="input-field text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="input-field text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recruiter Specific: Company Details */}
        {user?.role === 'recruiter' && (
          <div className="card-surface p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Company Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. CloudScale AI"
                  className="input-field text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Website
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="input-field text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  name="companyLogo"
                  value={formData.companyLogo}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Company Size
                </label>
                <input
                  type="text"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  placeholder="e.g. 50-200 employees"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Company Bio & Culture
              </label>
              <textarea
                rows="3"
                name="companyBio"
                value={formData.companyBio}
                onChange={handleChange}
                placeholder="What sets your engineering organization apart..."
                className="input-field text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
