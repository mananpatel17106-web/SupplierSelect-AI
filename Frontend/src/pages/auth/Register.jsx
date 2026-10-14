import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../../features/auth/authSlice';
import { registerSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ShieldCheck, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success('Registration successful! Please sign in to continue.');
        navigate('/login');
      } else {
        toast.error(resultAction.payload || 'Registration failed');
      }
    } catch {
      toast.error('An unexpected error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17211B] tracking-tight">
          Create QuoteWise Account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#647067]">
          Empower your team with automated supplier evaluation and decision support
        </p>
      </div>

      {/* Register Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md border border-[#E2EAE4] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              icon={User}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              error={errors.password?.message}
              helperText="Must contain at least 6 characters"
              required
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
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
                className="w-full"
                isLoading={isLoading}
                icon={CheckCircle2}
                iconPosition="right"
              >
                Create Account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#E2EAE4] text-center">
            <p className="text-xs text-[#647067]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
