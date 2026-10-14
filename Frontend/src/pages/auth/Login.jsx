import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';
import { loginSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Welcome back to QuoteWise AI');
        navigate(from, { replace: true });
      } else {
        toast.error(resultAction.payload || 'Login failed');
      }
    } catch {
      toast.error('An unexpected error occurred during login');
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
          QuoteWise <span className="text-emerald-600">AI</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#647067]">
          Sign in to evaluate supplier quotations and make confident procurement decisions
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md border border-[#E2EAE4] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
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
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-[#E2EAE4] text-center">
            <p className="text-xs text-[#647067]">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
