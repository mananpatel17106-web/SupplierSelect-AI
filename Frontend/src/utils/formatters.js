export const formatCurrency = (amount, currency = '$') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return `${currency}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateInput);
  }
};

export const formatScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) return '0.0';
  return Number(score).toFixed(1);
};

export const formatDays = (days) => {
  if (days === null || days === undefined || isNaN(days)) return '—';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const formatWarranty = (years) => {
  if (years === null || years === undefined || isNaN(years)) return '—';
  return `${years} ${years === 1 ? 'year' : 'years'}`;
};

export const getEligibilityBadgeProps = (status) => {
  switch (status?.toLowerCase()) {
    case 'eligible':
    case 'passed':
      return {
        label: 'Eligible',
        variant: 'success',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'needs_verification':
      return {
        label: 'Needs Verification',
        variant: 'warning',
        bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
      };
    case 'ineligible':
    case 'failed':
      return {
        label: 'Ineligible',
        variant: 'error',
        bgColor: 'bg-red-50 text-red-800 border-red-200',
        dotColor: 'bg-red-500',
      };
    case 'processed':
      return {
        label: 'Processed',
        variant: 'success',
        bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'processing':
      return {
        label: 'Processing',
        variant: 'warning',
        bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
      };
    default:
      return {
        label: status || 'Pending',
        variant: 'neutral',
        bgColor: 'bg-gray-50 text-gray-700 border-gray-200',
        dotColor: 'bg-gray-400',
      };
  }
};
