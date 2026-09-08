import React from 'react';

const ResumeScoreBadge = ({ score = 0, size = 'md' }) => {
  const getScoreColor = (num) => {
    if (num >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (num >= 65) return 'text-sky-500 border-sky-500/30 bg-sky-500/10';
    if (num >= 50) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-red-500 border-red-500/30 bg-red-500/10';
  };

  const dimensions = {
    sm: 'w-10 h-10 text-xs font-bold',
    md: 'w-14 h-14 text-base font-extrabold',
    lg: 'w-20 h-20 text-2xl font-black'
  };

  return (
    <div
      className={`rounded-2xl border flex flex-col items-center justify-center font-mono ${dimensions[size]} ${getScoreColor(
        score
      )} shadow-sm transition-all`}
    >
      <span>{score}</span>
      <span className="text-[9px] font-sans font-medium uppercase tracking-wider opacity-80">
        Score
      </span>
    </div>
  );
};

export default ResumeScoreBadge;
