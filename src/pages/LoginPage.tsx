import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { IlmoraLogo } from '../components/IlmoraLogo';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { loginStudent, loginGoogle, user, isAdmin, isApproved } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect appropriately
  React.useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else if (isApproved) {
        navigate('/dashboard');
      } else {
        navigate('/application-status');
      }
    }
  }, [user, isAdmin, isApproved, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await loginStudent(email.trim(), password);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg = err instanceof Error ? err.message : 'Invalid credentials.';
      if (msg.includes('operation-not-allowed')) {
        setErrorMsg('Email/Password sign-in is currently disabled in Firebase Console. Please enable "Email/Password" in Firebase Console -> Authentication -> Sign-in method, or sign in with Google.');
      } else if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
        setErrorMsg('Invalid email or password. Please re-check or use password reset.');
      } else if (msg.includes('too-many-requests')) {
        setErrorMsg('Access temporarily blocked due to multiple failed login attempts. Please try again in a few minutes.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginGoogle();
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#022544] text-[#FEFEFE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <IlmoraLogo variant="full" theme="light" size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-[#FEFEFE] font-heading">
            Student Portal Sign In
          </h1>
          <p className="text-xs text-[#FEFEFE]/75">
            Access your course lectures, notes, and academic progress.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
              Registered email
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#FEFEFE]/90">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-xs text-[#FECF35] hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 focus:ring-[#FECF35]/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign in to classroom</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FEFEFE]/15" />
          </div>
          <span className="relative bg-[#093D6C] px-3 text-xs text-[#FEFEFE]/60">
            Or quick sign-in
          </span>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-lg bg-[#033D6B] hover:bg-[#022544] border border-[#FEFEFE]/20 text-xs font-medium text-[#FEFEFE] transition flex items-center justify-center gap-2 cursor-pointer"
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
          <span>Continue with Google</span>
        </button>

        {/* Registration Link */}
        <p className="text-center text-xs text-[#FEFEFE]/75">
          New student?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#FECF35] hover:underline font-medium cursor-pointer"
          >
            Register for admission
          </button>
        </p>

        {/* Administrator Portal Access Link */}
        <div className="pt-4 border-t border-[#FEFEFE]/15 flex items-center justify-between text-xs text-[#FEFEFE]/75">
          <span>Portal administrator?</span>
          <button
            type="button"
            onClick={() => navigate('/admin-login')}
            className="text-[#033D6B] bg-[#FECF35] hover:bg-[#ebd02f] font-medium cursor-pointer flex items-center gap-1.5 py-1 px-2.5 rounded transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
