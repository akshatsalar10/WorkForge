import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../services/authApi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await forgotPassword(data).unwrap();
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Reset Link Request Sent</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          If an account exists for that email, we have sent instructions to reset your password.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot password?</h2>
        <p className="text-sm text-slate-400">Enter your email and we'll send you reset instructions.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2 py-2.5" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
};
