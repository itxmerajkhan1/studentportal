import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  GraduationCap,
} from 'lucide-react';

interface AdminLoginPageProps {
  navigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { user, isAdmin, loginAdmin, loginAdminGoogle, logoutUser, requestPasswordReset, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forbiddenError, setForbiddenError] = useState<boolean>(false);

  // Password reset state
  const [showResetBox, setShowResetBox] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // If already logged in and verified as admin, redirect to /admin
  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        // Logged in user is NOT an admin
        setForbiddenError(true);
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setForbiddenError(false);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginAdmin(cleanEmail, password);
      if (result.isAdmin) {
        navigate('/admin');
      } else {
        // Authenticated with Firebase Auth, but NOT registered in /admins/{uid}
        setForbiddenError(true);
        setErrorMsg('403 Forbidden: Access Denied. This account does not possess administrative privileges.');
      }
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
        setErrorMsg('Invalid administrator credentials. Please check your email and password, or use the password reset option below.');
      } else if (msg.includes('operation-not-allowed')) {
        setErrorMsg('Email/Password provider is disabled in Firebase Console. Please enable Email/Password provider or sign in with Google.');
      } else if (msg.includes('too-many-requests')) {
        setErrorMsg('Too many unsuccessful attempts. Temporary lockout active. Please wait or reset password.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAdminSubmit = async () => {
    setErrorMsg(null);
    setForbiddenError(false);
    setSubmitting(true);
    try {
      const result = await loginAdminGoogle();
      if (result.isAdmin) {
        navigate('/admin');
      } else {
        setForbiddenError(true);
        setErrorMsg('403 Forbidden: Access Denied. The Google account you authenticated with is not registered as an administrator.');
      }
    } catch (err: unknown) {
      console.error('Google Admin Login error:', err);
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setErrorMsg('Please enter the administrator email address to send the password reset link.');
      return;
    }

    setResetSubmitting(true);
    try {
      await requestPasswordReset(targetEmail);
      setResetSuccessMsg(`Password reset email dispatched to ${targetEmail}. Please check your inbox and spam folder to set or update your password.`);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to send password reset email.';
      setErrorMsg(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleSwitchToStudent = () => {
    navigate('/dashboard');
  };

  const handleSignOutAndRetry = async () => {
    await logoutUser();
    setForbiddenError(false);
    setErrorMsg(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-cyan-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 space-y-6">
        {/* Top return link */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            Admin Portal
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-cyan-500/25">
            <ShieldCheck className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Secure clearance portal for curriculum management, admission approvals, and platform administration.
          </p>
        </div>

        {/* Forbidden 403 State for Authenticated Non-Admin Students */}
        {forbiddenError && user && !isAdmin && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-3 animate-fade-in shadow-lg">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-rose-300">
                  403 Forbidden — Access Denied
                </strong>
                <p className="text-rose-200/90 mt-1 leading-relaxed">
                  You are signed in as <strong className="text-white">{user.email}</strong>, which does not have administrative privileges. Only verified faculty and portal administrators may access the Admin Control Panel.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-rose-900/60">
              <button
                onClick={handleSwitchToStudent}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Go to Student View</span>
              </button>
              <button
                onClick={handleSignOutAndRetry}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Sign Out & Switch
              </button>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMsg && !forbiddenError && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Password Reset Success Notice */}
        {resetSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5 shadow-md">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-relaxed">{resetSuccessMsg}</span>
          </div>
        )}

        {/* Admin Form */}
        {(!user || isAdmin) && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Administrative Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetBox(!showResetBox)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer transition flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{showResetBox ? 'Hide reset' : 'Reset password'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 cursor-pointer transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 text-slate-950 font-bold text-sm hover:from-cyan-300 hover:to-sky-300 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Password Reset Drawer / Box */}
        {showResetBox && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-800/50 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Send Admin Password Reset Link</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enter your designated administrator email address to dispatch an official Firebase password setup / reset email.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="admin@domain.com"
                value={resetEmail || email}
                onChange={(e) => setResetEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetSubmitting}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                {resetSubmitting ? 'Sending...' : 'Send Link'}
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        {(!user || isAdmin) && (
          <>
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-slate-900 px-3 text-xs text-slate-500">
                Or authenticate via Google
              </span>
            </div>

            {/* Google Admin Sign In */}
            <button
              onClick={handleGoogleAdminSubmit}
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google (Admin)</span>
            </button>
          </>
        )}

        {/* Security Notice Footer */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Authorized staff only • All operations logged & verified</span>
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            >
              Student Sign In
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
