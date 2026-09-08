import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Users, Search, MapPin, FileText, Mail, ArrowRight } from 'lucide-react';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/candidates', {
        params: { search, skill, location }
      });
      setCandidates(res.data.data.candidates);
    } catch (err) {
      toast.error(err.message || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          Verified Talent Pool
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Search candidate portfolios, skill competencies, and verified technical resumes
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="card-surface p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or headline..."
            className="input-field pl-9 text-xs"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Filter by skill (e.g. React, Docker)..."
            className="input-field text-xs"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or state..."
              className="input-field pl-9 text-xs"
            />
          </div>
          <button type="submit" className="btn-primary text-xs px-4">
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="card-surface p-12">
          <Loader message="Searching verified talent..." />
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((cand) => (
            <div key={cand._id} className="card-surface p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm uppercase">
                    {cand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {cand.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {cand.profile?.location || 'Remote'}
                    </p>
                  </div>
                </div>

                {cand.profile?.headline && (
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    {cand.profile.headline}
                  </p>
                )}

                {cand.profile?.bio && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {cand.profile.bio}
                  </p>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(cand.profile?.skills || []).slice(0, 6).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px]"
                    >
                      {s}
                    </span>
                  ))}
                  {(cand.profile?.skills?.length || 0) > 6 && (
                    <span className="text-[10px] text-zinc-400 self-center">
                      +{cand.profile.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[130px]">{cand.email}</span>
                </div>

                {cand.profile?.resume ? (
                  <a
                    href={cand.profile.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 text-sky-600 dark:text-sky-400"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Resume
                  </a>
                ) : (
                  <span className="text-[11px] text-zinc-400 italic">No resume linked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No candidates matched your search criteria
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Try adjusting search filters or clearing the skill keyword.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
