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
import { IlmoraLogo } from '../components/IlmoraLogo';

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
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#033D6B] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#033D6B]" />
            <span>Annual Academic Membership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            ILMORA Academic Membership
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            Annual access for Class 11, Class 12, and MDCAT/ECAT students. Watch full HD video lectures and track board exam preparation.
          </p>
        </div>

        {/* Current Student Membership Status Card */}
        {user && (
          <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#FEFEFE]/10">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase text-[#FEFEFE]/60 tracking-wider">
                  Your Account Status
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#FEFEFE]">
                    {profile?.fullName || user.email}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/25">
                    {profile?.academicLevel || 'Student'}
                  </span>
                </div>
                <p className="text-xs text-[#FEFEFE]/60 font-mono">{user.email}</p>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {isAdmin ? (
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30 font-medium text-xs flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-[#FECF35]" /> Administrator (Full Access)
                  </span>
                ) : membershipStatus === 'active' ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-lg bg-[#033D6B] text-emerald-300 border border-emerald-500/30 font-medium text-xs flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Membership
                    </span>
                    <button
                      onClick={() => setShowSlipModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] text-xs font-medium border border-[#FEFEFE]/15 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Membership slip</span>
                    </button>
                  </div>
                ) : isPaymentPending ? (
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30 font-medium text-xs flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-4 h-4 text-[#FECF35]" /> Verification In Progress
                  </span>
                ) : membershipStatus === 'expired' ? (
                  <span className="px-3.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-700 font-medium text-xs flex items-center gap-1.5 shadow-sm">
                    <XCircle className="w-4 h-4 text-rose-400" /> Membership Expired
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/25 font-medium text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#FECF35]" /> Unpaid / Not Active
                  </span>
                )}
              </div>
            </div>

            {/* Membership Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div>
                <p className="text-xs text-[#FEFEFE]/70 font-medium">Annual Fee</p>
                <p className="text-lg font-heading font-semibold text-[#FEFEFE] mt-0.5">
                  Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'} / Year
                </p>
                <p className="text-[11px] text-[#FEFEFE]/60">Non-recurring manual payment</p>
              </div>

              <div>
                <p className="text-xs text-[#FEFEFE]/70 font-medium">Expiration & Validity</p>
                {isAdmin ? (
                  <p className="text-lg font-heading font-semibold text-[#FECF35] mt-0.5">Permanent Admin Access</p>
                ) : membershipStatus === 'active' && membershipExpiresAt ? (
                  <div>
                    <p className="text-lg font-heading font-semibold text-emerald-300 mt-0.5">
                      {new Date(membershipExpiresAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-[11px] text-emerald-300 font-medium">
                      {membershipDaysRemaining} days remaining
                    </p>
                  </div>
                ) : isPaymentPending ? (
                  <div>
                    <p className="text-lg font-heading font-semibold text-[#FECF35] mt-0.5">Pending Approval</p>
                    <p className="text-[11px] text-[#FEFEFE]/60">Usually verified within 2–6 hours</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-heading font-semibold text-[#FEFEFE]/70 mt-0.5">No Active Subscription</p>
                    <p className="text-[11px] text-[#FEFEFE]/60">Purchase below for 365-day access</p>
                  </div>
                )}
              </div>

              <div className="flex items-center sm:justify-end">
                {isAdmin || membershipStatus === 'active' ? (
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-4 py-2.5 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] border border-[#FEFEFE]/15 text-xs font-medium transition cursor-pointer flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-[#FECF35]" />
                    <span>Extend / renew (+365 days)</span>
                  </button>
                ) : isPaymentPending ? (
                  <div className="text-right">
                    <p className="text-xs text-[#FECF35] font-medium">Payment under review</p>
                    <p className="text-[11px] text-[#FEFEFE]/60">TRX: {latestPayment?.transactionReference}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-5 py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'} Now →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pending verification alert banner */}
            {isPaymentPending && (
              <div className="mt-6 p-4 rounded-xl bg-[#033D6B] border border-[#FECF35]/30 text-[#FEFEFE] text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-[#FECF35]">
                  <Clock className="w-4 h-4 text-[#FECF35]" />
                  <span>Verification in Progress</span>
                </div>
                <p className="text-[11px] text-[#FEFEFE]/80 leading-relaxed font-sans">
                  We have received your payment request of Rs. {latestPayment.amount} submitted via {latestPayment.paymentMethod.toUpperCase()} (TRX: <span className="font-mono font-semibold text-[#FECF35]">{latestPayment.transactionReference}</span>). Our admin reviews payments during operating hours. Your 365-day membership will activate immediately upon verification.
                </p>
              </div>
            )}

            {/* Rejection alert banner */}
            {isPaymentRejected && (
              <div className="mt-6 p-4 rounded-xl bg-rose-950/50 border border-rose-700/60 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Previous Payment Request Rejected</span>
                </div>
                <p className="text-[11px] text-rose-200/90 font-sans">
                  Reason provided: <strong className="text-white font-medium">{latestPayment.rejectionReason || 'Invalid transaction ID or receipt could not be verified.'}</strong>
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-medium text-xs cursor-pointer"
                  >
                    Submit new payment request
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing & Plan Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plan Card */}
          <div className="lg:col-span-2 bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#FEFEFE]/10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FECF35]">Everything Included</span>
                <h3 className="text-xl font-heading font-semibold text-[#FEFEFE] mt-1">365-Day Academic Access</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE]">
                  Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}
                </span>
                <span className="text-xs text-[#FEFEFE]/60 block font-sans">per student / year</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-[#FEFEFE]/80 uppercase tracking-wider">Features & Privileges</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {[
                  {
                    title: 'Full Video Lecture Streaming',
                    desc: 'Instant streaming of all Physics, Math & Chemistry recorded chapters with zero ads.',
                    icon: <Video className="w-4 h-4 text-[#FECF35]" />,
                  },
                  {
                    title: 'Chapter-Wise PDF Notes',
                    desc: 'Downloadable board exam revision guides, derivations, and formula summary sheets.',
                    icon: <FileText className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    title: 'MDCAT & ECAT Question Banks',
                    desc: 'Step-by-step video solutions to past 10-year board questions & entry test questions.',
                    icon: <BookOpen className="w-4 h-4 text-sky-400" />,
                  },
                  {
                    title: 'Course Completion Certificates',
                    desc: 'Official digital verified certificate recognizing completion of coursework.',
                    icon: <Award className="w-4 h-4 text-[#FECF35]" />,
                  },
                  {
                    title: 'Adaptive Playback Controls',
                    desc: 'Resume where you left off with variable speeds (0.75x to 2.0x) and theater modes.',
                    icon: <Sparkles className="w-4 h-4 text-[#FECF35]" />,
                  },
                  {
                    title: 'Priority WhatsApp Support',
                    desc: 'Direct helpline assistance for curriculum questions and exam announcements.',
                    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                  },
                ].map((feat, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#033D6B] border border-[#FEFEFE]/15 space-y-1">
                    <div className="flex items-center gap-2 font-medium text-[#FEFEFE]">
                      {feat.icon}
                      <span>{feat.title}</span>
                    </div>
                    <p className="text-[11px] text-[#FEFEFE]/70 leading-relaxed pl-6 font-sans">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund & Guarantee */}
            <div className="p-4 rounded-xl bg-[#033D6B] border border-[#FEFEFE]/15 text-xs text-[#FEFEFE]/85 space-y-1">
              <p className="font-heading font-semibold text-[#FEFEFE] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FECF35]" />
                <span>100% Satisfaction & Disputed Transaction Guarantee</span>
              </p>
              <p className="text-[11px] text-[#FEFEFE]/75 leading-relaxed font-sans">
                If you face any issues streaming video lessons or downloading curriculum notes within 48 hours of your membership activation, our support team will promptly resolve them or provide a full refund.
              </p>
            </div>
          </div>

          {/* Quick Pay / Status Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 space-y-5 shadow-xl">
              <h3 className="font-heading font-semibold text-[#FEFEFE] text-base">Payment Methods</h3>
              <p className="text-xs text-[#FEFEFE]/75 font-sans">
                Pay using your preferred Pakistani mobile wallet or banking app:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#033D6B] rounded-xl border border-[#FEFEFE]/15 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#FECF35] block">Bank Transfer</span>
                    <span className="text-[#FEFEFE]/60 text-[10px]">{siteSettings.bankBranch || 'MEEZAN DIGITAL CENTRE'}</span>
                  </div>
                  <span className="text-[#FEFEFE] text-[11px] font-mono">{siteSettings.bankAccountNumber || '00300116151367'}</span>
                </div>
                <div className="p-3 bg-[#033D6B] rounded-xl border border-[#FEFEFE]/15 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#FECF35] block">SadaPay</span>
                    <span className="text-[#FEFEFE]/60 text-[10px]">{siteSettings.sadapayTitle || 'Muhammad Mairaj Khan'}</span>
                  </div>
                  <span className="text-[#FEFEFE] text-[11px] font-mono">{siteSettings.sadapayNumber || '03323242608'}</span>
                </div>
                <div className="p-3 bg-[#033D6B] rounded-xl border border-[#FEFEFE]/15 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-400 block">Easypaisa</span>
                    <span className="text-[#FEFEFE]/60 text-[10px]">{siteSettings.easypaisaTitle || 'Muhammad Mubeen Khan'}</span>
                  </div>
                  <span className="text-[#FEFEFE] text-[11px] font-mono">{siteSettings.easypaisaNumber || '03265877959'}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/payment')}
                className="w-full py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Proceed to payment form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Helpline Assistance */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 space-y-3 text-xs shadow-xl">
              <h4 className="font-heading font-semibold text-[#FEFEFE] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#FECF35]" />
                <span>Need Assistance?</span>
              </h4>
              <p className="text-[#FEFEFE]/75 text-[11px] leading-relaxed font-sans">
                If your payment is delayed or you have inquiries about board course coverage:
              </p>
              <div className="space-y-1 font-mono text-[11px]">
                <p className="text-[#FECF35]">WhatsApp: {siteSettings.supportPhone}</p>
                <p className="text-[#FEFEFE]/70">{siteSettings.supportEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Payment History Table */}
        {user && paymentHistory.length > 0 && (
          <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-semibold text-[#FEFEFE]">Your Payment Request History</h3>
                <p className="text-xs text-[#FEFEFE]/70 font-sans">Track the review status of your membership submissions</p>
              </div>
              <button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="p-2 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] border border-[#FEFEFE]/15 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#FEFEFE]/90">
                <thead className="bg-[#033D6B] text-[#FEFEFE]/70 uppercase font-medium text-[10px] tracking-wider border-b border-[#FEFEFE]/15">
                  <tr>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">TRX Reference</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FEFEFE]/10">
                  {paymentHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-[#033D6B]/50 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#FEFEFE]/70">
                        {new Date(p.submittedAt).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-[#FEFEFE]">
                        {p.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#FECF35]">
                        {p.transactionReference}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#FEFEFE]">
                        Rs. {p.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#033D6B] text-emerald-300 border border-emerald-500/30">
                            Approved & Active
                          </span>
                        ) : p.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950 text-rose-300 border border-rose-700" title={p.rejectionReason || ''}>
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/30">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.receiptUrl && (
                          <button
                            onClick={() => setViewReceiptModal(p.receiptUrl)}
                            className="text-[#FECF35] hover:underline font-medium text-[11px] cursor-pointer"
                          >
                            View receipt
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
                <div className="flex justify-center pb-2">
                  <IlmoraLogo variant="full" theme="light" size="md" className="print:hidden" />
                  <IlmoraLogo variant="full" theme="dark" size="md" className="hidden print:inline-flex" />
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
                This document certifies that the above-named student is actively enrolled with full academic curriculum privileges for Physics, Mathematics, and Chemistry at ILMORA (Learn Today. Lead Tomorrow.).
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
