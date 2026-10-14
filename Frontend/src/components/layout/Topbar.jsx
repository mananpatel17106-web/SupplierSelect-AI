import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  UploadCloud,
  ChevronDown,
  Shield,
} from 'lucide-react';
import Button from '../ui/Button';
import { logoutUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const routeTitleMap = {
  '/dashboard': 'Dashboard Overview',
  '/requirements': 'Purchase Requirements',
  '/requirements/new': 'Create Purchase Requirement',
  '/quotations': 'Supplier Quotations',
  '/quotations/upload': 'Upload Supplier Quotation',
  '/analysis': 'Compare & Analyze Quotations',
  '/analysis/history': 'Analysis History',
  '/reports': 'Procurement Analytics & Reports',
  '/settings': 'Account & Application Settings',
};

const Topbar = ({ openMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Derive current title
  let pageTitle = routeTitleMap[location.pathname];
  if (!pageTitle) {
    if (location.pathname.startsWith('/requirements/') && location.pathname.endsWith('/edit')) {
      pageTitle = 'Edit Purchase Requirement';
    } else if (location.pathname.startsWith('/requirements/')) {
      pageTitle = 'Purchase Requirement Details';
    } else if (location.pathname.startsWith('/quotations/')) {
      pageTitle = 'Quotation Details';
    } else if (location.pathname.startsWith('/analysis/')) {
      pageTitle = 'AI Quotation Analysis Results';
    } else {
      pageTitle = 'QuoteWise AI';
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E2EAE4] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobile}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#17211B] leading-tight">
            {pageTitle}
          </h1>
          <p className="hidden sm:block text-[11px] text-[#647067] font-medium">
            QuoteWise AI Procurement Portal
          </p>
        </div>
      </div>

      {/* Right: Quick Actions & Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions */}
        <Link to="/requirements/new" className="hidden md:inline-flex">
          <Button variant="outline" size="sm" icon={Plus}>
            New Requirement
          </Button>
        </Link>
        <Link to="/quotations/upload" className="hidden sm:inline-flex">
          <Button variant="primary" size="sm" icon={UploadCloud}>
            Upload Quotation
          </Button>
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-green-700 text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:block text-xs font-semibold text-[#17211B] max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2EAE4] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-[#E2EAE4]">
                <p className="text-xs font-bold text-[#17211B] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#647067] truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <Shield className="w-3 h-3" />
                  <span>Role: {user?.role || 'User'}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Account Settings</span>
                </Link>
                <Link
                  to="/requirements/new"
                  onClick={() => setDropdownOpen(false)}
                  className="flex sm:hidden items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span>New Requirement</span>
                </Link>
                <Link
                  to="/quotations/upload"
                  onClick={() => setDropdownOpen(false)}
                  className="flex sm:hidden items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-gray-400" />
                  <span>Upload Quotation</span>
                </Link>
              </div>

              <div className="border-t border-[#E2EAE4] py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
