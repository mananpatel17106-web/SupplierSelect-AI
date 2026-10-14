import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      id,
      name,
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      icon: Icon,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Icon className="h-4 w-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            disabled={disabled}
            placeholder={placeholder}
            className={`block w-full rounded-lg border text-sm transition-colors py-2.5 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              Icon ? 'pl-9' : 'pl-3.5'
            } ${isPassword ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-[#E2EAE4] hover:border-gray-300 focus:border-emerald-600 focus:ring-emerald-100'
            } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
