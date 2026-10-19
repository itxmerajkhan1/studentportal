import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  RefreshCw,
  Phone,
  Mail,
  ArrowRight,
  LogOut,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface ApplicationStatusPageProps {
  navigate: (route: string) => void;
  supportPhone?: string;
}

export const ApplicationStatusPage: React.FC<ApplicationStatusPageProps> = ({
  navigate,
  supportPhone = '+92 300 1234567',
}) => {
  const { user, profile, isAdmin, isApproved, isPending, isRejected, isSuspended, refreshProfile, logoutUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedNotice, setRefreshedNotice] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshedNotice(false);
    try {
      await refreshProfile();
      setRefreshedNotice(true);
      setTimeout(() => setRefreshedNotice(false), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    navigate('/');
  };

  // If user is not logged in at all, direct them to login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <GraduationCap className="w-12 h-12 text-cyan-400 mx-auto" />
          <h2 className="text-xl font-bold">Check Application Status</h2>
          <p className="text-xs text-slate-400">Please log in to review your admission status.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Status Header Icon & Title */}
        <div className="text-center space-y-3">
          {isAdmin ? (
            <div className="w-16 h-16 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-700/60 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/50">
              <ShieldCheck className="w-9 h-9" />
            </div>
          ) : isApproved ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : isRejected ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-950 text-rose-400 border border-rose-700/60 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
              <XCircle className="w-9 h-9" />
            </div>
          ) : isSuspended ? (
            <div className="w-16 h-16 rounded-2xl bg-rose-950 text-rose-400 border border-rose-700/60 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
              <AlertOctagon className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-950 text-amber-400 border border-amber-700/60 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/50">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Application ID: {user.uid.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {isAdmin
                ? 'Administrator Account Active'
                : isApproved
                ? 'Admission Approved!'
                : isRejected
                ? 'Application Not Approved'
                : isSuspended
                ? 'Account Suspended'
                : 'Awaiting Administrator Approval'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {isAdmin
              ? 'You have full privileged access to manage students, approve admissions, create courses, and configure the portal.'
              : isApproved
              ? 'Congratulations! Your admission has been verified by the academic administration. You have full access to the lecture catalog and video streams.'
              : isRejected
              ? 'Your application could not be verified with the provided information. Please see the note from administration below or contact support.'
              : isSuspended
              ? 'Your student access has been temporarily suspended by the administration. Please resolve any pending formalities.'
              : 'Thank you for registering. For academic security and curriculum integrity, all student profiles are reviewed before video lecture access is granted.'}
          </p>
        </div>

        {/* Rejection / Suspension Alert Note if applicable */}
        {(isRejected || isSuspended) && profile?.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-xs text-rose-200 space-y-1">
            <span className="font-bold text-rose-300">Administration Note:</span>
            <p className="leading-relaxed">{profile.rejectionReason}</p>
          </div>
        )}

        {/* Student Application Summary Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
            Registered Profile Details
          </h3>

          <div className="grid grid-cols-2 gap-3 text-slate-400">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Student Name</p>
              <p className="text-slate-100 font-medium">{profile?.fullName || user.displayName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Registered Email</p>
              <p className="text-slate-100 font-medium truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Academic Stream</p>
              <p className="text-cyan-300 font-medium">{profile?.academicLevel || 'Class 12'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-semibold">Mobile Number</p>
              <p className="text-slate-100 font-medium">{profile?.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Approval Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isAdmin || isApproved
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  : isRejected || isSuspended
                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                  : 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
              }`}
            >
              {profile?.status || (isAdmin ? 'Admin' : 'Pending')}
            </span>
          </div>
        </div>

        {/* Refresh Feedback Message */}
        {refreshedNotice && (
          <div className="p-3 bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-xs rounded-xl text-center">
            Status refreshed from database.
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isApproved || isAdmin ? (
            <button
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAdmin ? 'Enter Admin Control Panel' : 'Enter Student Learning Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Checking...' : 'Check Approval Status'}</span>
              </button>

              <a
                href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum,%20I%20have%20registered%20on%20Meraj%20Learning%20Portal%20with%20email%20${encodeURIComponent(
                  user.email || ''
                )}.%20Please%20verify%20my%20account.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Expedite via WhatsApp</span>
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/courses')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Browse Course Previews
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
