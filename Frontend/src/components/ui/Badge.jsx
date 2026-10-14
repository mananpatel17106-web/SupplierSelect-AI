import React from 'react';

const Badge = ({
  children,
  variant = 'neutral', // 'success', 'warning', 'error', 'info', 'neutral'
  size = 'md', // 'sm', 'md'
  showDot = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    error: 'bg-red-50 text-red-800 border-red-200/80',
    info: 'bg-blue-50 text-blue-800 border-blue-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs tracking-wide ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-gray-400'}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
