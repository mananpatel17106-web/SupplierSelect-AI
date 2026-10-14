import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">404</span>
      <h2 className="text-xl sm:text-2xl font-bold text-[#17211B] mt-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-[#647067] max-w-md mt-1 mb-6">
        The procurement page or document you are looking for does not exist or has been moved.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="md" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
