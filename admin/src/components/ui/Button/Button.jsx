import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25',
    danger: 'bg-red-500/15 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white',
    outline: 'bg-transparent text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
