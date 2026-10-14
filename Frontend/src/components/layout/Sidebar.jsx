import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Scale,
  History,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Purchase Requirements', path: '/requirements', icon: ClipboardList },
  { name: 'Supplier Quotations', path: '/quotations', icon: FileText },
  { name: 'Compare & Analyze', path: '/analysis', icon: Scale },
  { name: 'Analysis History', path: '/analysis/history', icon: History },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-2xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E2EAE4] transition-all duration-300 ease-in-out lg:z-30 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2EAE4]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-700 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-base tracking-tight text-[#17211B] block">
                  QuoteWise <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] text-[#647067] font-medium uppercase tracking-wider block">
                  Procurement Decision
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50/80 text-emerald-800 border border-emerald-200 shadow-2xs font-semibold'
                      : 'text-[#647067] hover:text-[#17211B] hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-emerald-600' : 'text-[#647067]'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-[#E2EAE4] bg-[#F5FBF7]/50">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center shrink-0 text-xs border border-emerald-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-[#17211B] truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-[#647067] truncate">{user?.email}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
