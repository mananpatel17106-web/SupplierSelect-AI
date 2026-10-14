import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changeUserPassword, logoutUser } from '../../features/auth/authSlice';
import { changePasswordSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  LogOut,
  Sliders,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(
    localStorage.getItem('quotewise_currency') || '$'
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onChangePassword = async (data) => {
    try {
      const res = await dispatch(changeUserPassword(data)).unwrap();
      toast.success(res || 'Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(err || 'Failed to change password');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleCurrencyChange = (newVal) => {
    setPreferredCurrency(newVal);
    localStorage.setItem('quotewise_currency', newVal);
    toast.success(`Display currency preference set to ${newVal}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2EAE4]">
        <h2 className="text-xl font-bold text-[#17211B]">Account & Application Settings</h2>
        <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
          Manage your credentials, profile details, and display preferences.
        </p>
      </div>

      {/* Account Profile Card */}
      <Card title="Account Profile" subtitle="Your registered procurement officer profile">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F5FBF7] border border-[#E2EAE4]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17211B]">{user?.name}</h3>
              <p className="text-xs text-[#647067] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success">Role: {user?.role || 'User'}</Badge>
            <span className="text-xs text-[#647067]">
              Member since {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card
        title="Change Password"
        subtitle="Ensure your account is protected with a secure password"
      >
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-xl">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.currentPassword?.message}
            required
            {...register('currentPassword')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            icon={Lock}
            error={errors.newPassword?.message}
            required
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            required
            {...register('confirmPassword')}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              icon={CheckCircle2}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Display & Interface Preferences */}
      <Card
        title="Display & Regional Preferences"
        subtitle="Customize currency format and table density"
      >
        <div className="space-y-4 max-w-xl text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              Preferred Currency Symbol
            </label>
            <div className="flex items-center gap-3">
              {['$', '€', '£', '₹'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm border transition-all flex items-center justify-center ${
                    preferredCurrency === curr
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Used when displaying procurement pricing figures across the dashboard and comparison matrices.
            </p>
          </div>
        </div>
      </Card>

      {/* Danger Zone: Session Termination */}
      <Card title="Session Management" subtitle="Sign out of QuoteWise AI on this device">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-900">Sign Out</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Clears your active HTTP cookie session.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={() => setShowLogoutConfirm(true)}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of QuoteWise AI"
        message="Are you sure you want to end your current procurement session?"
        confirmText="Sign Out"
      />
    </div>
  );
};

export default Settings;
