import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-xl p-5 text-slate-100 shadow-xl shadow-black/20',
        hoverable && 'hover:border-slate-600 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
