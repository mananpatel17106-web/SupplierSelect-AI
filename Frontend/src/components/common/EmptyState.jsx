import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#E2EAE4] bg-white ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[#17211B]">{title}</h4>
      <p className="text-xs sm:text-sm text-[#647067] max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
