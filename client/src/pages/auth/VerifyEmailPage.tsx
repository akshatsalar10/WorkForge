import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useVerifyEmailMutation } from '../../services/authApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token missing from link.');
      return;
    }

    verifyEmail({ token })
      .unwrap()
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.data?.message || 'Verification link expired or invalid.');
      });
  }, [token, verifyEmail]);

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner label="Verifying your email address..." />;
  }

  if (status === 'error') {
    return (
      <div className="text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Email Verification Failed</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{errorMessage}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 pt-2"
        >
          Return to Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5">
      <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-white">Email Address Verified!</h2>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        Thank you for verifying your email address. Your WorkForge account is fully activated.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 pt-2"
      >
        Continue to Dashboard <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
