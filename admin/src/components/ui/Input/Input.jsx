import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}
          />
        )}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-10' : 'pr-3'} py-2.5 bg-white dark:bg-slate-950/60 border ${
            error ? 'border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500'
          } rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none transition-colors ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none p-0.5 rounded cursor-pointer"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span className="block mt-1 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});
