import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings, PaymentRequest } from '../types';
import { fetchStudentPaymentRequests } from '../firebase/config';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  ArrowRight,
  Sparkles,
  FileText,
  Award,
  Video,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Calendar,
  Printer,
  RefreshCw,
} from 'lucide-react';

interface MembershipPageProps {
  siteSettings: SiteSettings;
  navigate: (route: string) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ siteSettings, navigate }) => {
  const { user, profile, isApproved, isAdmin, membershipStatus, membershipExpiresAt, membershipDaysRemaining, refreshProfile } = useAuth();

  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<string | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const list = await fetchStudentPaymentRequests(user.uid);
      if (list) setPaymentHistory(list);
    } catch (err) {
      console.warn('Could not load student payment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const latestPayment = paymentHistory[0] || null;
  const isPaymentPending = latestPayment?.status === 'pending';
  const isPaymentRejected = latestPayment?.status === 'rejected' && membershipStatus !== 'active';

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Annual Academic Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meraj Learning Portal Membership
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Comprehensive annual access for Class 11, Class 12, and MDCAT/ECAT students. Watch full HD lectures, access chapter-wise PDF notes, and track your board examination preparation.
          </p>
        </div>

        {/* Current Student Membership Status Card */}
        {user && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Your Account Status
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {profile?.fullName || user.email}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {profile?.academicLevel || 'Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {isAdmin ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> Administrator (Full Access)
                  </span>
                ) : membershipStatus === 'active' ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Membership
                    </span>
                    <button
                      onClick={() => setShowSlipModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Membership Slip</span>
                    </button>
                  </div>
                ) : isPaymentPending ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-950 text-amber-300 border border-amber-600 font-bold text-xs flex items-center gap-1.5 shadow-sm animate-pulse">
                    <Clock className="w-4 h-4 text-amber-400" /> Verification In Progress
                  </span>
                ) : membershipStatus === 'expired' ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-600 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                    <XCircle className="w-4 h-4 text-rose-400" /> Membership Expired
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Unpaid / Not Active
                  </span>
                )}
              </div>
            </div>

            {/* Membership Details Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div>
                <p className="text-xs text-slate-400 font-medium">Annual Fee</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'} / Year
                </p>
                <p className="text-[11px] text-slate-400">Non-recurring manual payment</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Expiration & Validity</p>
                {isAdmin ? (
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">Permanent Admin Access</p>
                ) : membershipStatus === 'active' && membershipExpiresAt ? (
                  <div>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">
                      {new Date(membershipExpiresAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      {membershipDaysRemaining} days remaining
                    </p>
                  </div>
                ) : isPaymentPending ? (
                  <div>
                    <p className="text-lg font-bold text-amber-300 mt-0.5">Pending Approval</p>
                    <p className="text-[11px] text-slate-400">Usually verified within 2–6 hours</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-slate-400 mt-0.5">No Active Subscription</p>
                    <p className="text-[11px] text-slate-400">Purchase below for 365-day access</p>
                  </div>
                )}
              </div>

              <div className="flex items-center sm:justify-end">
                {isAdmin || membershipStatus === 'active' ? (
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>Extend / Renew (+365 Days)</span>
                  </button>
                ) : isPaymentPending ? (
                  <div className="text-right">
                    <p className="text-xs text-amber-300 font-semibold">Payment under review</p>
                    <p className="text-[11px] text-slate-400">TRX: {latestPayment?.transactionReference}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'} Now →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pending verification alert banner */}
            {isPaymentPending && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Verification in Progress</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We have received your payment request of Rs. {latestPayment.amount} submitted via {latestPayment.paymentMethod.toUpperCase()} (TRX: <span className="font-mono font-bold text-white">{latestPayment.transactionReference}</span>). Our admin reviews payments during operating hours. Your 365-day membership will activate immediately upon verification.
                </p>
              </div>
            )}

            {/* Rejection alert banner */}
            {isPaymentRejected && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Previous Payment Request Rejected</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Reason provided: <strong className="text-rose-200 font-medium">{latestPayment.rejectionReason || 'Invalid transaction ID or receipt could not be verified.'}</strong>
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Submit New Payment Request
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing & Plan Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plan Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Everything Included</span>
                <h3 className="text-xl font-bold text-white mt-1">365-Day Academic Access</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}
                </span>
                <span className="text-xs text-slate-400 block">per student / year</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features & Privileges</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {[
                  {
                    title: 'Full Video Lecture Streaming',
                    desc: 'Instant streaming of all Physics, Math & Chemistry recorded chapters with zero ads.',
                    icon: <Video className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    title: 'Chapter-Wise PDF Notes',
                    desc: 'Downloadable board exam revision guides, derivations, and formula summary sheets.',
                    icon: <FileText className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    title: 'MDCAT & ECAT Question Banks',
                    desc: 'Step-by-step video solutions to past 10-year board questions & entry test questions.',
                    icon: <BookOpen className="w-4 h-4 text-blue-400" />,
                  },
                  {
                    title: 'Course Completion Certificates',
                    desc: 'Official digital verified certificate recognizing completion of coursework.',
                    icon: <Award className="w-4 h-4 text-amber-400" />,
                  },
                  {
                    title: 'Adaptive Playback Controls',
                    desc: 'Resume where you left off with variable speeds (0.75x to 2.0x) and theater modes.',
                    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
                  },
                  {
                    title: 'Priority WhatsApp Support',
                    desc: 'Direct helpline assistance for curriculum questions and exam announcements.',
                    icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
                  },
                ].map((feat, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-white">
                      {feat.icon}
                      <span>{feat.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-6">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund & Guarantee */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>100% Satisfaction & Disputed Transaction Guarantee</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If you face any issues streaming video lessons or downloading curriculum notes within 48 hours of your membership activation, our support team will promptly resolve them or provide a full refund.
              </p>
            </div>
          </div>

          {/* Quick Pay / Status Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h3 className="font-bold text-white text-base">Payment Methods</h3>
              <p className="text-xs text-slate-400">
                Pay using your preferred Pakistani mobile wallet or banking app:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-950 flex items-center justify-between">
                  <span className="font-bold text-emerald-400">Easypaisa</span>
                  <span className="text-slate-400 text-[11px] font-mono">{siteSettings.easypaisaNumber}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-950 flex items-center justify-between">
                  <span className="font-bold text-amber-400">JazzCash</span>
                  <span className="text-slate-400 text-[11px] font-mono">{siteSettings.jazzcashNumber}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-950 flex items-center justify-between">
                  <span className="font-bold text-cyan-400">Bank Transfer</span>
                  <span className="text-slate-400 text-[11px]">{siteSettings.bankName}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/payment')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Payment Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Helpline Assistance */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Need Assistance?</span>
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If your payment is delayed or you have inquiries about board course coverage:
              </p>
              <div className="space-y-1 font-mono text-[11px]">
                <p className="text-cyan-300">WhatsApp: {siteSettings.supportPhone}</p>
                <p className="text-slate-400">{siteSettings.supportEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Payment History Table */}
        {user && paymentHistory.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Your Payment Request History</h3>
                <p className="text-xs text-slate-400">Track the review status of your membership submissions</p>
              </div>
              <button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">TRX Reference</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paymentHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(p.submittedAt).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-slate-200">
                        {p.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                        {p.transactionReference}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        Rs. {p.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Approved & Active
                          </span>
                        ) : p.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800" title={p.rejectionReason || ''}>
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.receiptUrl && (
                          <button
                            onClick={() => setViewReceiptModal(p.receiptUrl)}
                            className="text-cyan-400 hover:text-cyan-300 underline font-semibold text-[11px]"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECEIPT VIEW MODAL */}
        {viewReceiptModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-white text-sm">Payment Receipt Screenshot</h4>
                <button
                  onClick={() => setViewReceiptModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={viewReceiptModal}
                  alt="Payment Receipt"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              <div className="text-right">
                <button
                  onClick={() => setViewReceiptModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRINTABLE MEMBERSHIP SLIP MODAL */}
        {showSlipModal && profile && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 text-slate-100 print:text-black print:bg-white print:border-none">
              {/* Slip Header */}
              <div className="text-center pb-4 border-b border-slate-800 print:border-slate-300 space-y-1">
                <div className="inline-flex items-center gap-2 font-bold text-lg text-cyan-400 print:text-blue-800">
                  <Award className="w-6 h-6" />
                  <span>Meraj Learning Portal</span>
                </div>
                <h3 className="text-xl font-extrabold text-white print:text-black">
                  Official Student Membership Certificate & Slip
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Annual Enrollment Verification Record
                </p>
              </div>

              {/* Slip Data */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 print:bg-slate-100 p-5 rounded-2xl border border-slate-800 print:border-slate-300">
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Student Full Name</p>
                  <p className="text-sm font-bold text-white print:text-black mt-0.5">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Academic Level</p>
                  <p className="text-sm font-bold text-cyan-300 print:text-blue-700 mt-0.5">{profile.academicLevel}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Registered Email</p>
                  <p className="font-mono text-white print:text-black mt-0.5">{profile.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Phone Number</p>
                  <p className="font-mono text-white print:text-black mt-0.5">{profile.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Membership Status</p>
                  <p className="font-bold text-emerald-400 print:text-emerald-700 mt-0.5 uppercase">
                    {profile.membershipStatus || 'ACTIVE'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 print:text-slate-600 font-medium">Valid Until (365 Days)</p>
                  <p className="font-bold text-white print:text-black mt-0.5">
                    {profile.membershipExpiresAt
                      ? new Date(profile.membershipExpiresAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Active'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 print:text-slate-600 text-center leading-relaxed">
                This document certifies that the above-named student is actively enrolled with full academic curriculum privileges for Physics, Mathematics, and Chemistry at Meraj Learning Portal.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
