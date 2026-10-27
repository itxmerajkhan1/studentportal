import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { IlmoraLogo } from '../components/IlmoraLogo';

interface ForgotPasswordPageProps {
  navigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const msg = err instanceof Error ? err.message : 'Could not send reset link.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#022544] text-[#FEFEFE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <IlmoraLogo variant="full" theme="light" size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-[#FEFEFE] font-heading">
            Reset Password
          </h1>
          <p className="text-xs text-[#FEFEFE]/75">
            Enter your student account email to receive a password recovery link.
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-lg bg-[#033D6B] border border-emerald-700/60 text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
            <h2 className="text-sm font-semibold text-[#FEFEFE] font-heading">Recovery Email Dispatched</h2>
            <p className="text-xs text-[#FEFEFE]/85 leading-relaxed">
              We have sent a secure password reset link to <strong className="text-[#FECF35]">{email}</strong>. Please check your inbox and spam folder.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 px-5 py-2 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs transition cursor-pointer"
            >
              Return to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
                Registered email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 focus:ring-[#FECF35]/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {submitting ? 'Sending link...' : 'Send password recovery email'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-center text-xs text-[#FEFEFE]/75 hover:text-[#FECF35] flex items-center justify-center gap-1.5 pt-2 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
