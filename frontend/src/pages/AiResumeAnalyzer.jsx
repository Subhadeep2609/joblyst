import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  analyzeResumeAction,
  extractResumeTextAction,
  fetchProfileResumeTextAction
} from '../redux/slices/aiSlice';
import ResumeScoreBadge from '../components/ai/ResumeScoreBadge';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  Upload,
  User,
  RefreshCw,
  FileUp,
  X
} from 'lucide-react';

const AiResumeAnalyzer = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { resumeAnalysis, loading } = useSelector((state) => state.ai);
  const { user } = useSelector((state) => state.auth);

  const sampleResume = `Alex Rivera — Senior Full Stack & AI Applications Engineer
Email: alex.rivera@example.com | Portfolio: alexrivera.dev | Location: New York, NY

Summary:
Full stack engineer with 4+ years experience designing high-throughput web applications with React, Node.js, Express, MongoDB, TypeScript, and Docker. Passionate about AI workflow integrations.

Core Skills:
React, Redux, Node.js, Express, MongoDB, TypeScript, JavaScript, Docker, AWS, Tailwind CSS, REST APIs, Git.

Professional Experience:
NextGen Systems (2022 - Present) — Senior Software Engineer
- Led architecture and delivery of microservices in Node.js and React serving 2M+ monthly active users.
- Integrated AI vector search indexing pipelines, reducing query latency by 35%.
- Implemented CI/CD deployment pipelines on AWS ECS using Docker.

CodeCraft Studios (2020 - 2022) — Software Developer
- Developed modern web components and client dashboards with React, Redux Toolkit, and Tailwind CSS.
- Collaborated with product designers to implement responsive, accessible UI patterns.

Education:
B.S. in Computer Science — Columbia University (2016 - 2020)`;

  const [resumeText, setResumeText] = useState(sampleResume);
  const [extracting, setExtracting] = useState(false);
  const [sourceInfo, setSourceInfo] = useState(null);

  // 1. Fetch resume from Candidate Profile
  const handleFetchProfileResume = async () => {
    setExtracting(true);
    try {
      const result = await dispatch(fetchProfileResumeTextAction());
      if (fetchProfileResumeTextAction.fulfilled.match(result)) {
        const { text, source, fileName } = result.payload.data;
        setResumeText(text);
        setSourceInfo({
          type: source === 'resume_file' ? 'Profile Resume Document' : 'Profile Structured Data',
          name: fileName || `${user?.name || 'User'}'s Profile`
        });
        toast.success(
          source === 'resume_file'
            ? `Extracted text from attached resume: ${fileName || 'Resume'}`
            : 'Generated resume content from your profile information!'
        );
      } else {
        toast.error(result.payload || 'Failed to load resume from profile.');
      }
    } catch {
      toast.error('An unexpected error occurred while reading profile resume.');
    } finally {
      setExtracting(false);
    }
  };

  // 2. Manual Upload of PDF / DOCX / TXT file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so selecting the same file again triggers onChange
    e.target.value = '';

    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      toast.error('Unsupported file format. Please upload a PDF, DOCX, or TXT document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setExtracting(true);
    try {
      const result = await dispatch(extractResumeTextAction(file));
      if (extractResumeTextAction.fulfilled.match(result)) {
        const { text, fileName } = result.payload.data;
        setResumeText(text);
        setSourceInfo({
          type: 'Uploaded Document',
          name: fileName
        });
        toast.success(`Extracted content from ${fileName}!`);
      } else {
        toast.error(result.payload || 'Failed to extract text from file.');
      }
    } catch {
      toast.error('Failed to parse uploaded document.');
    } finally {
      setExtracting(false);
    }
  };

  // 3. Trigger AI Analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText || resumeText.trim().length < 50) {
      toast.error('Please enter at least 50 characters of resume content.');
      return;
    }

    const result = await dispatch(analyzeResumeAction(resumeText));
    if (analyzeResumeAction.fulfilled.match(result)) {
      toast.success('Resume evaluation complete!');
    } else {
      toast.error(result.payload || 'Failed to analyze resume.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              AI Resume Analyzer
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Deep semantic evaluation of skills, quantifiable impact, and ATS industry readiness
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-surface p-6 space-y-4">
            {/* Action Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Resume Content
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResumeText(sampleResume);
                    setSourceInfo({ type: 'Demo', name: 'Sample Engineering Resume' });
                  }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
                >
                  Insert Sample CV
                </button>
              </div>

              {/* Source Quick-Select Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Fetch from Profile Button */}
                <button
                  type="button"
                  onClick={handleFetchProfileResume}
                  disabled={extracting || loading}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Load resume document or skills & experience directly from your profile"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Fetch from Profile</span>
                </button>

                {/* 2. Upload Document Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={extracting || loading}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Upload a PDF, DOCX, or TXT file to extract text"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Resume File</span>
                </button>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
              </div>

              {/* Active Source Banner */}
              {sourceInfo && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      <strong>{sourceInfo.type}:</strong> {sourceInfo.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSourceInfo(null)}
                    className="text-emerald-600/70 hover:text-emerald-700 dark:text-emerald-400/70 dark:hover:text-emerald-300 ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Textarea */}
            <div className="relative">
              {extracting && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[1px] rounded-lg z-10 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-sky-500 animate-spin" />
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Extracting document text...
                  </p>
                </div>
              )}
              <textarea
                rows="15"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Upload your resume document or fetch from profile, or paste your resume content directly..."
                className="input-field text-xs font-mono leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || extracting}
              className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              {loading ? 'Evaluating Resume...' : 'Analyze Resume with AI'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="card-surface p-12 text-center">
              <Loader message="Extracting competencies and running AI scoring..." />
            </div>
          ) : resumeAnalysis ? (
            <div className="card-surface p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {/* Score Header */}
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                <ResumeScoreBadge score={resumeAnalysis.score} size="lg" />
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-500">
                    ATS Readiness Rating
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {resumeAnalysis.summary}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Key Strengths
                </h3>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {(resumeAnalysis.strengths || []).map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Missing or In-Demand Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(resumeAnalysis.missingSkills || []).map((ms, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    >
                      {ms}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Improvement Tips */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-sky-500" />
                  Actionable Recommendations
                </h3>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {(resumeAnalysis.suggestions || []).map((sug, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-sky-500 font-bold">&bull;</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card-surface p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-sky-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Your AI Analysis Report
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Use <strong>Fetch from Profile</strong> or <strong>Upload Resume File</strong>, or paste your text, then click "Analyze Resume with AI" to evaluate your resume.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiResumeAnalyzer;
