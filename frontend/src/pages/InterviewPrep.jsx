import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import {
  generateInterviewPrepAction,
  fetchMoreInterviewQuestionsAction
} from '../redux/slices/aiSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  Brain,
  Code2,
  Users2,
  Briefcase,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const InterviewPrep = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { jobs } = useSelector((state) => state.jobs);
  const { interviewPrep, loading, loadingMore } = useSelector((state) => state.ai);

  const initialJobId = searchParams.get('jobId') || '';
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [activeTab, setActiveTab] = useState('technical');
  const [openIndexes, setOpenIndexes] = useState({ technical: 0, behavioral: 0 });

  useEffect(() => {
    dispatch(fetchJobs({ limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedJobId) {
      dispatch(generateInterviewPrepAction(selectedJobId));
      setOpenIndexes({ technical: 0, behavioral: 0 });
    }
  }, [dispatch, selectedJobId]);

  const handleJobSelect = (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
  };

  const toggleIndex = (category, index) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [category]: prev[category] === index ? -1 : index
    }));
  };

  // Fetch more questions while preserving existing ones
  const handleFetchMoreQuestions = async () => {
    if (!selectedJobId || loadingMore) return;

    const currentTech = interviewPrep?.technicalQuestions || [];
    const currentBeh = interviewPrep?.behavioralQuestions || [];

    const existingQuestions = [
      ...currentTech.map((q) => q.question),
      ...currentBeh.map((q) => q.question)
    ];

    const currentCount = activeTab === 'technical' ? currentTech.length : currentBeh.length;
    const nextPage = Math.floor(currentCount / 3) + 1;

    const result = await dispatch(
      fetchMoreInterviewQuestionsAction({
        jobId: selectedJobId,
        excludeQuestions: existingQuestions,
        page: nextPage
      })
    );

    if (fetchMoreInterviewQuestionsAction.fulfilled.match(result)) {
      toast.success('Generated more interview scenarios! Added to your list.');
      // Auto open the newly added question
      setOpenIndexes((prev) => ({
        ...prev,
        [activeTab]: currentCount
      }));
    } else {
      toast.error(result.payload || 'Failed to fetch more questions.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              AI Interview Preparation
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simulate technical and behavioral hiring questions with model answers tailored to any position
            </p>
          </div>
        </div>
      </div>

      {/* Target Job Selector */}
      <div className="card-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Select Target Opportunity
          </label>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Choose a job from our directory to tailor the technical drill down
          </p>
        </div>

        <select
          value={selectedJobId}
          onChange={handleJobSelect}
          className="input-field sm:max-w-xs text-xs font-medium cursor-pointer"
        >
          <option value="">-- Select a Job Position --</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title} ({j.company})
            </option>
          ))}
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="card-surface p-12 text-center">
          <Loader message="Synthesizing interview questions and model answers..." />
        </div>
      ) : interviewPrep ? (
        <div className="space-y-6">
          {/* Target Banner */}
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Interview Guide Target
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {interviewPrep.job?.title} at {interviewPrep.job?.company}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
              AI Prepared
            </span>
          </div>

          {/* Navigation Tabs with Dynamic Counts */}
          <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('technical')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'technical'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Technical Scenarios</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700/20 dark:bg-zinc-300/20">
                {interviewPrep.technicalQuestions?.length || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('behavioral')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'behavioral'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Behavioral / STAR</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700/20 dark:bg-zinc-300/20">
                {interviewPrep.behavioralQuestions?.length || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tips')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'tips'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Pro Interview Tips</span>
            </button>
          </div>

          {/* Tab 1: Technical Questions */}
          {activeTab === 'technical' && (
            <div className="space-y-4">
              {(interviewPrep.technicalQuestions || []).map((q, idx) => {
                const isOpen = openIndexes.technical === idx;
                const formattedNum = String(idx + 1).padStart(2, '0');
                return (
                  <div key={idx} className="card-surface p-5 space-y-3 transition-all">
                    <div
                      onClick={() => toggleIndex('technical', idx)}
                      className="flex items-start justify-between cursor-pointer gap-3"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="font-mono text-xs font-bold text-sky-500 mt-0.5 shrink-0">
                          {formattedNum}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {q.question}
                        </h3>
                      </div>
                      <button className="text-zinc-400 mt-0.5 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in">
                        <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Recommended Model Response
                          </p>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {q.sampleAnswer}
                          </p>
                        </div>
                        {q.tip && (
                          <div className="flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400">
                            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p><strong>Interviewer insight:</strong> {q.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Fetch More Questions Button Bar */}
              <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Want more scenarios for this role?
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Currently displaying {interviewPrep.technicalQuestions?.length || 0} questions &bull; Generates additional questions without replacing current ones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchMoreQuestions}
                  disabled={loadingMore}
                  className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Scenarios...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Fetch More Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Behavioral Questions */}
          {activeTab === 'behavioral' && (
            <div className="space-y-4">
              {(interviewPrep.behavioralQuestions || []).map((q, idx) => {
                const isOpen = openIndexes.behavioral === idx;
                return (
                  <div key={idx} className="card-surface p-5 space-y-3 transition-all">
                    <div
                      onClick={() => toggleIndex('behavioral', idx)}
                      className="flex items-start justify-between cursor-pointer gap-3"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="font-mono text-xs font-bold text-purple-500 mt-0.5 shrink-0">
                          STAR {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {q.question}
                        </h3>
                      </div>
                      <button className="text-zinc-400 mt-0.5 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in">
                        <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                            Model STAR Framework Response
                          </p>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {q.sampleAnswer}
                          </p>
                        </div>
                        {q.tip && (
                          <div className="flex items-start space-x-2 text-xs text-amber-600 dark:text-amber-400">
                            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p><strong>Key takeaway:</strong> {q.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Fetch More Behavioral Questions Bar */}
              <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    Need more behavioral STAR questions?
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Currently displaying {interviewPrep.behavioralQuestions?.length || 0} questions &bull; Expands your prep with new situation-based questions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchMoreQuestions}
                  disabled={loadingMore}
                  className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Scenarios...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Fetch More Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Tips */}
          {activeTab === 'tips' && (
            <div className="card-surface p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Strategic Interview Guidance
              </h3>
              <ul className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                {(interviewPrep.generalTips || []).map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="card-surface p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-amber-500">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Select a target position to generate questions
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Choose any position from the dropdown above to generate personalized technical drills and behavioral STAR guidelines.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
