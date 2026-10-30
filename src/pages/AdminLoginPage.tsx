import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IlmoraLogo } from '../components/IlmoraLogo';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Sparkles,
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

  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin) {
        navigate('/admin');
      } else {
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
      setErrorMsg('Please enter both administrator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginAdmin(cleanEmail, password);
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
        setErrorMsg('Invalid administrator credentials.');
      } else if (msg.includes('403') || msg.includes('Forbidden')) {
        setForbiddenError(true);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAdmin = async () => {
    setErrorMsg(null);
    setForbiddenError(false);
    setSubmitting(true);
    try {
      await loginAdminGoogle();
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Google Admin Login error:', err);
      const msg = err instanceof Error ? err.message : 'Google admin sign-in failed.';
      if (msg.includes('403') || msg.includes('Forbidden')) {
        setForbiddenError(true);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccessMsg(null);
    setErrorMsg(null);
    if (!resetEmail.trim()) return;

    setResetSubmitting(true);
    try {
      await requestPasswordReset(resetEmail.trim());
      setResetSuccessMsg(`Password reset instructions sent to ${resetEmail.trim()}. Check your inbox.`);
    } catch (err: unknown) {
      console.error('Reset error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <IlmoraLogo variant="full" theme="dark" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#033D6B] text-[#FECF35] text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#FECF35]" />
          <span>Administrator Control Access</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          {forbiddenError ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-heading font-bold text-slate-900">403 Access Forbidden</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The account ({user?.email || 'Current user'}) does not possess administrator clearance.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <button
                  onClick={async () => {
                    await logoutUser();
                    setForbiddenError(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-xs"
                >
                  Sign Out & Switch Account
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Return to Student Dashboard
                </button>
              </div>
            </div>
          ) : showResetBox ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-heading font-bold text-slate-900">Reset Admin Password</h2>
                <button
                  onClick={() => setShowResetBox(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {resetSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl">
                  {resetSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#033D6B] text-white text-xs font-bold hover:bg-[#093D6C]"
                  >
                    {resetSubmitting ? 'Sending Link...' : 'Send Reset Password Link'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-heading font-bold text-slate-900">Admin Authentication</h2>
                <p className="text-xs text-slate-500 font-sans">Authorized academic administrator login</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Administrator Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="itxmerajkhan3109@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowResetBox(true);
                      }}
                      className="text-[11px] font-semibold text-[#033D6B] hover:underline"
                    >
                      Reset password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#033D6B]" />
                      <span>Verifying Admin Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In To Admin Panel</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-mono absolute">OR</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAdmin}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#033D6B]" />
                <span>Admin Google Sign-In</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold text-[#033D6B] hover:underline"
                >
                  ← Return to Student Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
