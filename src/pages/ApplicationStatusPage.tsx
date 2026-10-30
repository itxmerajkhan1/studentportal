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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-md">
          <IlmoraLogo variant="full" theme="dark" size="md" className="mx-auto" />
          <h2 className="text-xl font-bold font-heading text-slate-900">Check Application Status</h2>
          <p className="text-xs text-slate-600 font-sans">Please log in to review your admission status.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs shadow-xs"
          >
            Sign In Here
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-4 text-center">
        <div className="inline-block cursor-pointer" onClick={() => navigate('/')}>
          <IlmoraLogo variant="full" theme="dark" size="lg" />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          {refreshedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-center font-medium">
              Profile status updated from server.
            </div>
          )}

          {/* Approved State */}
          {(isApproved || isAdmin) && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Admission Approved
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 pt-1">Welcome to ILMORA</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Your student admission account is active. You have full access to chapter-wise video lectures and student progress tools.
                </p>
              </div>
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                className="w-full py-3 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs hover:bg-[#ebd02f] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer touch-target"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pending State */}
          {isPending && !isAdmin && !isApproved && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  Under Review
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 pt-1">Application In Progress</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Your admission request is currently under review by our academic administrator. Video streaming will unlock automatically upon verification.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5 text-xs">
                <p className="font-semibold text-slate-900">Student Profile Submitted:</p>
                <p className="text-slate-600 font-mono">Name: {profile?.fullName || user.email}</p>
                <p className="text-slate-600 font-mono">Level: {profile?.academicLevel || 'FSc Student'}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#033D6B] ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Check Status Now</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Rejected / Suspended State */}
          {(isRejected || isSuspended) && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
                  {isSuspended ? 'Access Suspended' : 'Admission Rejected'}
                </span>
                <h2 className="text-xl font-heading font-bold text-slate-900 pt-1">Attention Required</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isSuspended
                    ? 'Your account access has been suspended. Please contact support.'
                    : 'Your admission application could not be verified automatically. Contact our administration.'}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Support Helpline Card */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <p className="font-semibold text-slate-800 text-center">Admission Support Helpline</p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#033D6B]" />
                <span>{supportPhone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#033D6B]" />
                <span>{supportEmail}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
