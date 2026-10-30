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
  RefreshCw,
} from 'lucide-react';
import { IlmoraLogo } from '../components/IlmoraLogo';

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

    setSubmitting(true);
    try {
      await registerStudent({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        academicLevel: formData.academicLevel,
        studentId: formData.studentId.trim() || undefined,
      });

      navigate('/application-status');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      if (msg.includes('email-already-in-use')) {
        setServerError('This email address is already registered. Please sign in instead.');
      } else {
        setServerError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setServerError(null);
    setSubmitting(true);
    try {
      await loginGoogle();
      navigate('/application-status');
    } catch (err: unknown) {
      console.error('Google Sign-up error:', err);
      setServerError(err instanceof Error ? err.message : 'Google sign-up failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <IlmoraLogo variant="full" theme="dark" size="lg" />
        </div>
        <p className="text-xs text-slate-600 font-sans">
          Online Student Admission Registration Form
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-heading font-bold text-slate-900">Student Registration</h1>
            <p className="text-xs text-slate-500 font-sans">Fill in your academic profile to request video streaming access</p>
          </div>

          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Muhammad Ali"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                {errors.phoneNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Stream / Class *</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.academicLevel}
                  onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  {academicOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target mt-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#033D6B]" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Admission Form</span>
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
            onClick={handleGoogleSignup}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#033D6B]" />
            <span>Fast Sign Up with Google</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-[#033D6B] hover:underline cursor-pointer"
              >
                Sign In Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
