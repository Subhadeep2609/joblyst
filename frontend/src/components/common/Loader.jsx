import React from 'react';

const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[2.5px]',
    lg: 'w-12 h-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin`}
      />
      {message && (
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
