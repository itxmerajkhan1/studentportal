import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Hash,
  ShieldCheck,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface ProfilePageProps {
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, profile, refreshProfile, isAdmin } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [academicLevel, setAcademicLevel] = useState(profile?.academicLevel || 'FSc Part 2 (Pre-Engineering)');
  const [studentId, setStudentId] = useState(profile?.studentId || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);
    setSuccessMsg(false);
    setSaving(true);

    try {
      // Students can only update their personal contact & level info
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        academicLevel,
        studentId: studentId.trim(),
        updatedAt: new Date().toISOString(),
      });
      await refreshProfile();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: unknown) {
      console.error('Profile update failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl"
        >
          Please Log In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#022544] text-[#FEFEFE] min-h-screen py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="pb-6 border-b border-[#FEFEFE]/10">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE] tracking-tight">Student profile</h1>
          <p className="text-xs sm:text-sm text-[#FEFEFE]/70 mt-1">
            Manage your registered contact information and academic details.
          </p>
        </div>

        {/* Status Badge Card */}
        <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#033D6B] border border-[#FECF35]/30 flex items-center justify-center text-[#FECF35] text-xl font-bold">
              {profile?.fullName?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-heading font-semibold text-[#FEFEFE]">{profile?.fullName || user.email}</h2>
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                    profile?.status === 'approved' || isAdmin
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/50'
                      : 'bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/40'
                  }`}
                >
                  {isAdmin ? 'ADMINISTRATOR' : profile?.status || 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-[#FEFEFE]/60 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/application-status')}
            className="px-3.5 py-2 rounded-lg bg-[#033D6B] hover:bg-[#FECF35] hover:text-[#033D6B] text-[#FEFEFE] text-xs font-medium transition border border-[#FEFEFE]/15 cursor-pointer"
          >
            Check admission status →
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-heading font-semibold text-[#FEFEFE] uppercase tracking-wider pb-3 border-b border-[#FEFEFE]/10">
            Account information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/80 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:border-[#FECF35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/80 mb-1.5">
                Registered Email (Immutable)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#FEFEFE]/40 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-[#022544]/60 border border-[#FEFEFE]/10 rounded-lg text-xs text-[#FEFEFE]/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/80 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:border-[#FECF35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FEFEFE]/80 mb-1.5">
                Roll Number / Student ID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Optional college ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] placeholder-[#FEFEFE]/40 focus:outline-none focus:border-[#FECF35]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#FEFEFE]/80 mb-1.5">
                Academic Class / Stream
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-[#FEFEFE]/50 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-xs text-[#FEFEFE] focus:outline-none focus:border-[#FECF35] appearance-none cursor-pointer"
                >
                  {academicOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#033D6B] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Security explanation note */}
          <div className="p-3.5 bg-[#022544]/60 border border-[#FEFEFE]/10 rounded-lg text-[11px] text-[#FEFEFE]/70 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[#FECF35]">
              <Lock className="w-3.5 h-3.5 text-[#FECF35]" />
              <span>Database integrity & access guard</span>
            </div>
            <p>
              Your account role (Student) and approval status are secured by Cloud Firestore security rules. Privileged status changes can only be performed by the authorized portal administrator.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save profile changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
