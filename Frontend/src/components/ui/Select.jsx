import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      id,
      name,
      error,
      helperText,
      required = false,
      disabled = false,
      options = [],
      placeholder = 'Select an option',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          <select
            ref={ref}
            id={selectId}
            name={name}
            disabled={disabled}
            className={`block w-full rounded-lg border text-sm transition-colors py-2.5 px-3.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-[#E2EAE4] hover:border-gray-300 focus:border-emerald-600 focus:ring-emerald-100'
            } ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>

        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
