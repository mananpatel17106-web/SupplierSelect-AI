import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading data...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
      </div>
      {message && <p className="text-sm font-medium text-[#647067] animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#F5FBF7]/80 backdrop-blur-2xs z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
