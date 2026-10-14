import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-200 bg-red-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-red-900">{title}</h4>
      <p className="text-xs sm:text-sm text-red-700 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
