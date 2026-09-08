import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, subtitle }) => {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
        {change && (
          <span className="text-xs font-semibold text-emerald-500">
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
