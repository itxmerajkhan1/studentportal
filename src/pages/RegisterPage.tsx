import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateStudentRegistration } from '../utils/portalLogic';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Lock,
  BookOpen,
  Hash,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface RegisterPageProps {
  navigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { registerStudent, loginGoogle, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    academicLevel: 'FSc Part 2 (Pre-Engineering)',
    studentId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const academicOptions = [
    'FSc Part 2 (Pre-Engineering)',
    'FSc Part 2 (Pre-Medical)',
    'FSc Part 1 (Pre-Engineering)',
    'FSc Part 1 (Pre-Medical)',
    'ICS Part 1 & 2 (Computer Science)',
    'MDCAT Medical Entrance Test Batch',
    'ECAT Engineering Entrance Test Batch',
    'Matriculation Class 10 (Science)',
    'Matriculation Class 9 (Science)',
    'O-Levels / A-Levels Science',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateStudentRegistration(formData, true);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      await registerStudent({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        academicLevel: formData.academicLevel,
        studentId: formData.studentId.trim(),
      });
      // Registration successful! Redirect to Application Status Page
      navigate('/application-status');
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your credentials.';
      if (msg.includes('operation-not-allowed')) {
        setServerError('Email/Password registration is currently disabled in Firebase Console. Please enable "Email/Password" under Firebase Console -> Authentication -> Sign-in method, or use "Continue with Google Account".');
      } else if (msg.includes('email-already-in-use')) {
        setServerError('This email address is already registered. Please log in instead.');
      } else if (msg.includes('weak-password')) {
        setServerError('The password provided is too weak. Please choose a stronger password.');
      } else {
        setServerError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setServerError(null);
    setSubmitting(true);
    try {
      await loginGoogle();
      navigate('/application-status');
    } catch (err: unknown) {
      console.error('Google Sign Up failed:', err);
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Admission Registration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Register your profile for academic enrollment. Once verified by our administrators, your lecture classroom is unlocked.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name (as per Matric / BIE / FBISE records) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g., Muhammad Hamza Khan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-cyan-500/40'
                }`}
              />
            </div>
            {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Active Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-cyan-500/40'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pakistani Mobile / WhatsApp Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                placeholder="0300-1234567 or +923001234567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                  errors.phoneNumber ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-cyan-500/40'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Used by administration for instant admission verification.</p>
            {errors.phoneNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Academic Level & Optional Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Class / Academic Stream *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition appearance-none cursor-pointer"
                >
                  {academicOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                College Roll No. / ID (Optional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. GC-2024-912"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-cyan-500/40'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                    errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-cyan-500/40'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Notice about approval */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300/90 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Verification Policy</span>
            </div>
            <p>
              Your account status will default to <strong>"Pending Approval"</strong> upon submission. The administrative team reviews registrations promptly to authorize course and video streaming.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-400 text-slate-950 font-bold text-sm hover:from-cyan-300 hover:to-sky-300 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <span>Submit Admission Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-xs text-slate-500">
            Or register with Google
          </span>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignUp}
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
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
          <span>Continue with Google Account</span>
        </button>

        {/* Footer links */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline underline-offset-2"
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};
