import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvitationMutation } from '../../services/organizationApi';
import { useDispatch } from 'react-redux';
import { setActiveOrganization } from '../../store/authSlice';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [acceptInvite, { isLoading }] = useAcceptInvitationMutation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invitation token missing from URL.');
      return;
    }

    acceptInvite({ token })
      .unwrap()
      .then((res) => {
        setStatus('success');
        dispatch(setActiveOrganization(res.data.organization.id || res.data.organization._id));
        setTimeout(() => navigate('/dashboard'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.data?.message || 'Invalid or expired invitation link.');
      });
  }, [token, acceptInvite, dispatch, navigate]);

  if (status === 'loading' || isLoading) {
    return <LoadingSpinner label="Joining organization..." />;
  }

  if (status === 'error') {
    return (
      <div className="text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Invitation Acceptance Failed</h2>
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
      <h2 className="text-xl font-bold text-white">Welcome to the Workspace!</h2>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        You have successfully accepted the invitation. Redirecting to your workspace dashboard...
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 pt-2"
      >
        Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
