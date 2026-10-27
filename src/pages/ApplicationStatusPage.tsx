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
import { IlmoraLogo } from '../components/IlmoraLogo';
import { OFFICIAL_CONTACT_PHONE, PUBLIC_CONTACT_EMAIL } from '../config/constants';

interface ApplicationStatusPageProps {
  navigate: (route: string) => void;
  supportPhone?: string;
  supportEmail?: string;
}

export const ApplicationStatusPage: React.FC<ApplicationStatusPageProps> = ({
  navigate,
  supportPhone = OFFICIAL_CONTACT_PHONE,
  supportEmail = PUBLIC_CONTACT_EMAIL,
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
      <div className="min-h-screen bg-[#022544] text-[#FEFEFE] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="flex justify-center">
            <IlmoraLogo variant="icon" size="md" />
          </div>
          <h2 className="text-xl font-semibold text-[#FEFEFE] font-heading">Check Application Status</h2>
          <p className="text-xs text-[#FEFEFE]/75">Please log in to review your admission status.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs transition"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#022544] text-[#FEFEFE] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Brand Logo & Status Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <IlmoraLogo variant="full" theme="light" size="md" />
          </div>

          {isAdmin ? (
            <div className="w-14 h-14 rounded-xl bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-[#FECF35]" />
            </div>
          ) : isApproved ? (
            <div className="w-14 h-14 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : isRejected ? (
            <div className="w-14 h-14 rounded-xl bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
          ) : isSuspended ? (
            <div className="w-14 h-14 rounded-xl bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-[#FECF35]" />
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded bg-[#033D6B] text-[#FEFEFE]/80 border border-[#FEFEFE]/15">
              Application ID: {user.uid.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#FEFEFE] mt-2 font-heading">
              {isAdmin
                ? 'Administrator Account Active'
                : isApproved
                ? 'Admission Approved'
                : isRejected
                ? 'Application Not Approved'
                : isSuspended
                ? 'Account Suspended'
                : 'Awaiting Administrator Approval'}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#FEFEFE]/80 max-w-md mx-auto leading-relaxed">
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
          <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 space-y-1">
            <span className="font-semibold text-rose-300">Administration Note:</span>
            <p className="leading-relaxed">{profile.rejectionReason}</p>
          </div>
        )}

        {/* Student Application Summary Card */}
        <div className="bg-[#033D6B] border border-[#FEFEFE]/15 rounded-lg p-4 sm:p-5 space-y-3 text-xs">
          <h2 className="font-semibold text-[#FEFEFE] uppercase tracking-wider text-[11px] pb-2 border-b border-[#FEFEFE]/15 font-heading">
            Registered Profile Details
          </h2>

          <div className="grid grid-cols-2 gap-3 text-[#FEFEFE]/75">
            <div>
              <p className="text-[10px] uppercase text-[#FEFEFE]/60 font-medium">Student name</p>
              <p className="text-[#FEFEFE] font-medium">{profile?.fullName || user.displayName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#FEFEFE]/60 font-medium">Registered email</p>
              <p className="text-[#FEFEFE] font-medium truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#FEFEFE]/60 font-medium">Academic stream</p>
              <p className="text-[#FECF35] font-medium">{profile?.academicLevel || 'Class 12'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#FEFEFE]/60 font-medium">Mobile number</p>
              <p className="text-[#FEFEFE] font-medium">{profile?.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#FEFEFE]/15 flex items-center justify-between">
            <span className="text-[11px] text-[#FEFEFE]/70 font-medium">Approval status:</span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                isAdmin || isApproved
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  : isRejected || isSuspended
                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                  : 'bg-[#FECF35]/15 text-[#FECF35] border border-[#FECF35]/40'
              }`}
            >
              {profile?.status || (isAdmin ? 'Admin' : 'Pending')}
            </span>
          </div>
        </div>

        {/* Refresh Feedback Message */}
        {refreshedNotice && (
          <div className="p-3 bg-[#033D6B] border border-[#FECF35]/40 text-[#FECF35] text-xs rounded-lg text-center">
            Status refreshed from database.
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isApproved || isAdmin ? (
            <button
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="w-full py-3 px-4 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAdmin ? 'Enter Admin Control Panel' : 'Enter Student Learning Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#033D6B] hover:bg-[#022544] text-[#FEFEFE] font-medium text-xs transition border border-[#FEFEFE]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Checking...' : 'Check approval status'}</span>
              </button>

              <a
                href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum,%20I%20have%20registered%20on%20ILMORA%20with%20email%20${encodeURIComponent(
                  user.email || ''
                )}.%20Please%20verify%20my%20account.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Expedite via WhatsApp</span>
              </a>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/courses')}
              className="text-xs text-[#FECF35] hover:underline font-medium cursor-pointer"
            >
              Browse course previews
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-[#FEFEFE]/65 hover:text-rose-400 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>

          <p className="text-[11px] text-center text-[#FEFEFE]/65 pt-2 border-t border-[#FEFEFE]/15">
            Admissions helpline: <a href={`mailto:${supportEmail}`} className="text-[#FECF35] hover:underline">{supportEmail}</a> • <a href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-[#FECF35] hover:underline">{supportPhone}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
