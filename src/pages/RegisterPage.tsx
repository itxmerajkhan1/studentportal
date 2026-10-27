import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateStudentRegistration } from '../utils/portalLogic';
import {
  User,
  Mail,
  Phone,
  Lock,
  BookOpen,
  Hash,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { IlmoraLogo } from '../components/IlmoraLogo';
import { OFFICIAL_CONTACT_PHONE, PUBLIC_CONTACT_EMAIL, OFFICIAL_WHATSAPP_URL } from '../config/constants';

interface RegisterPageProps {
  navigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { registerStudent, loginGoogle } = useAuth();

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
    <div className="min-h-screen bg-[#022544] text-[#FEFEFE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center pb-1">
            <IlmoraLogo variant="full" theme="light" size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-[#FEFEFE] font-heading">
            Student Admission Registration
          </h1>
          <p className="text-xs text-[#FEFEFE]/75">
            Register your profile for academic enrollment. Once verified by our administrators, your lecture classroom is unlocked.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
              Full name (as per Matric / BIE / FBISE records) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g., Muhammad Hamza Khan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 transition ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500/40' : 'border-[#FEFEFE]/20 focus:ring-[#FECF35]/50'
                }`}
              />
            </div>
            {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
              Active email address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 transition ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/40' : 'border-[#FEFEFE]/20 focus:ring-[#FECF35]/50'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
              Pakistani mobile / WhatsApp number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="0300-1234567 or +923001234567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 transition ${
                  errors.phoneNumber ? 'border-rose-500 focus:ring-rose-500/40' : 'border-[#FEFEFE]/20 focus:ring-[#FECF35]/50'
                }`}
              />
            </div>
            <p className="text-[10px] text-[#FEFEFE]/60 mt-0.5">Used by administration for instant admission verification.</p>
            {errors.phoneNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Academic Level & Optional Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
                Class / academic stream *
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] focus:outline-none focus:ring-2 focus:ring-[#FECF35]/50 transition appearance-none cursor-pointer"
                >
                  {academicOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#033D6B] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
                College roll no. / ID (optional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. GC-2024-912"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 focus:ring-[#FECF35]/50 transition"
                />
              </div>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
                Create password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 transition ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/40' : 'border-[#FEFEFE]/20 focus:ring-[#FECF35]/50'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/90 mb-1">
                Confirm password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border rounded-lg text-sm text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:ring-2 transition ${
                    errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/40' : 'border-[#FEFEFE]/20 focus:ring-[#FECF35]/50'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Notice about approval */}
          <div className="p-3.5 rounded-lg bg-[#033D6B] border border-[#FEFEFE]/15 text-xs text-[#FEFEFE]/85 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[#FECF35]">
              <ShieldCheck className="w-4 h-4 text-[#FECF35]" />
              <span>Admin verification policy</span>
            </div>
            <p className="text-[11px]">
              Your account status will default to <strong>"Pending Approval"</strong> upon submission. The administrative team reviews registrations promptly to authorize course and video streaming.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Submitting application...</span>
            ) : (
              <>
                <span>Submit admission application</span>
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
            Or register with Google
          </span>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignUp}
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
          <span>Continue with Google Account</span>
        </button>

        {/* Footer links */}
        <p className="text-center text-xs text-[#FEFEFE]/75 mt-4">
          Already registered an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#FECF35] hover:underline font-medium cursor-pointer"
          >
            Log in here
          </button>
        </p>

        <p className="text-center text-[11px] text-[#FEFEFE]/65 pt-4 border-t border-[#FEFEFE]/15">
          Admissions inquiry:{' '}
          <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="text-[#FECF35] hover:underline">
            {PUBLIC_CONTACT_EMAIL}
          </a>{' '}
          • WhatsApp{' '}
          <a href={OFFICIAL_WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-[#FECF35] hover:underline">
            {OFFICIAL_CONTACT_PHONE}
          </a>
        </p>
      </div>
    </div>
  );
};
