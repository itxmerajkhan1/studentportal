import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings, PaymentMethod } from '../types';
import { submitPaymentRequest, fetchStudentPaymentRequests } from '../firebase/config';
import { validatePaymentSubmission, findDuplicateTransaction } from '../utils/portalLogic';
import {
  CreditCard,
  CheckCircle2,
  Copy,
  Upload,
  AlertCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Building,
  Smartphone,
  Info,
  Check,
} from 'lucide-react';

import {
  OFFICIAL_PAYMENT_ACCOUNTS,
  OFFICIAL_CONTACT_PHONE,
  PUBLIC_CONTACT_EMAIL,
} from '../config/constants';

interface PaymentPageProps {
  siteSettings: SiteSettings;
  navigate: (route: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ siteSettings, navigate }) => {
  const { user, profile, isApproved, isPending, membershipStatus, refreshProfile } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid receipt image (JPG, PNG, or WebP).');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Receipt image size exceeds 2 MB. Please upload a smaller screenshot.');
      return;
    }

    setReceiptFileName(file.name);

    // Convert to Base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the receipt image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      setErrorMsg('Please log in to submit a payment request.');
      return;
    }

    if (!isApproved) {
      setErrorMsg('Your student admission must be approved by administration before purchasing annual membership.');
      return;
    }

    const validation = validatePaymentSubmission({
      paymentMethod,
      transactionReference,
      receiptUrl: receiptBase64,
      amount: siteSettings.annualMembershipFee,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setErrorMsg(firstError || 'Please correct the payment form errors.');
      return;
    }

    setSubmitting(true);
    try {
      // Check for duplicate pending submission by this student
      const existing = await fetchStudentPaymentRequests(user.uid);
      if (existing) {
        const hasPending = existing.some((r) => r.status === 'pending');
        if (hasPending) {
          setErrorMsg('You already have a pending payment request under verification. Please wait for the admin to review it.');
          setSubmitting(false);
          return;
        }

        const isDuplicateTrx = findDuplicateTransaction(
          existing.map((r) => r.transactionReference),
          transactionReference
        );
        if (isDuplicateTrx) {
          setErrorMsg('You have already submitted a payment with this Transaction Reference number.');
          setSubmitting(false);
          return;
        }
      }

      await submitPaymentRequest({
        studentUid: user.uid,
        studentName: profile?.fullName || user.email || 'Registered Student',
        studentEmail: user.email || '',
        amount: siteSettings.annualMembershipFee,
        currency: 'PKR',
        paymentMethod,
        transactionReference: transactionReference.trim(),
        receiptUrl: receiptBase64,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      });

      await refreshProfile();
      setSuccessMsg('Payment request submitted successfully! Our administrative team will verify your payment within 2–6 hours.');
      setTimeout(() => {
        navigate('/membership');
      }, 2500);
    } catch (err: any) {
      console.error('Payment submission failed:', err);
      setErrorMsg(err?.message || 'Failed to submit payment request. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Warning if not logged in or not approved
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-cyan-400 mx-auto" />
          <h2 className="text-xl font-bold">Login Required</h2>
          <p className="text-xs text-slate-400">
            Please log in with your registered student account to access the annual membership payment portal.
          </p>
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

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-8 text-center space-y-4 shadow-md">
          <Clock className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold font-heading text-slate-900">Admission Approval Pending</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Your initial student registration is currently being verified by the admissions committee. Once approved, you can activate the annual membership pass.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/application-status')}
              className="w-full py-2.5 rounded-xl bg-[#FECF35] text-[#033D6B] font-bold text-xs shadow-xs"
            >
              Check Admission Status
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Browse Course Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#FECF35] selection:text-[#033D6B]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/membership')}
            className="inline-flex items-center gap-1.5 text-xs text-[#FEFEFE]/75 hover:text-[#FECF35] font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to membership overview</span>
          </button>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#033D6B] text-[#FECF35] border border-[#FECF35]/25">
            Secure Verification
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-[#FEFEFE] tracking-tight">
            Annual Membership Payment
          </h1>
          <p className="text-xs sm:text-sm text-[#FEFEFE]/75 max-w-xl mx-auto font-sans leading-relaxed">
            Send fee via Bank Transfer (Meezan Bank), SadaPay, or Easypaisa and submit your transaction reference below for verified activation.
          </p>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-[#093D6C] border border-[#FECF35]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FECF35]">Official Student Package</span>
            <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#FEFEFE]">Full-Year Academic Membership</h2>
            <p className="text-xs text-[#FEFEFE]/75 font-sans">
              Valid for {siteSettings.membershipDurationDays || 365} days • Access to all FSc/Matric lectures, notes, & past papers
            </p>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <div className="text-3xl sm:text-4xl font-heading font-semibold text-[#FECF35]">
              Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}
            </div>
            <p className="text-[11px] text-[#FEFEFE]/60 mt-0.5 font-sans">PKR / Annual (No recurring charges)</p>
          </div>
        </div>

        {/* Section 1: Official Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-[#FEFEFE] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FECF35]" />
              <span>Step 1: Transfer Fee to Verified Accounts</span>
            </h3>
            <span className="text-[11px] text-[#FEFEFE]/60 font-sans">Click to copy account details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Bank Transfer (Meezan Bank) */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-[#FECF35]/40 transition shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#FECF35] uppercase tracking-wide flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> Bank Transfer
                </span>
                <span className="text-[10px] bg-[#033D6B] text-[#FECF35] px-2 py-0.5 rounded font-mono font-semibold border border-[#FECF35]/25">
                  {siteSettings.bankBranch || OFFICIAL_PAYMENT_ACCOUNTS.bank.branchLabel}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Bank / Branch</p>
                <p className="text-xs font-semibold text-[#FEFEFE]">{siteSettings.bankName || OFFICIAL_PAYMENT_ACCOUNTS.bank.bankName} - {siteSettings.bankBranch || OFFICIAL_PAYMENT_ACCOUNTS.bank.branchLabel}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Account Title</p>
                  <p className="text-xs font-semibold text-[#FEFEFE]">{siteSettings.bankTitle || OFFICIAL_PAYMENT_ACCOUNTS.bank.accountTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(siteSettings.bankTitle || OFFICIAL_PAYMENT_ACCOUNTS.bank.accountTitle, 'btitle')}
                  className="px-2 py-1 rounded bg-[#033D6B] hover:bg-[#07355c] text-[10px] text-[#FEFEFE] border border-[#FEFEFE]/15 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'btitle' ? <Check className="w-3 h-3 text-[#FECF35]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'btitle' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Account Number</p>
                  <p className="text-xs font-mono font-semibold text-[#FECF35]">{siteSettings.bankAccountNumber || OFFICIAL_PAYMENT_ACCOUNTS.bank.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(siteSettings.bankAccountNumber || OFFICIAL_PAYMENT_ACCOUNTS.bank.accountNumber, 'bacc')}
                  className="px-2 py-1 rounded bg-[#033D6B] hover:bg-[#07355c] text-[10px] text-[#FEFEFE] border border-[#FEFEFE]/15 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'bacc' ? <Check className="w-3 h-3 text-[#FECF35]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'bacc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="truncate pr-1">
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">IBAN</p>
                  <p className="text-[11px] font-mono font-semibold text-[#FECF35] truncate">{siteSettings.bankIban || OFFICIAL_PAYMENT_ACCOUNTS.bank.iban}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(siteSettings.bankIban || OFFICIAL_PAYMENT_ACCOUNTS.bank.iban, 'biban')}
                  className="px-2 py-1 rounded bg-[#033D6B] hover:bg-[#07355c] text-[10px] text-[#FEFEFE] border border-[#FEFEFE]/15 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'biban' ? <Check className="w-3 h-3 text-[#FECF35]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'biban' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 2. SadaPay */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-[#FECF35]/40 transition shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#FECF35] uppercase tracking-wide flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> SadaPay
                  </span>
                  <span className="text-[10px] bg-[#033D6B] text-[#FECF35] px-2 py-0.5 rounded font-mono font-semibold border border-[#FECF35]/25">
                    Fast & Zero Fee
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Account Holder</p>
                  <p className="text-sm font-semibold text-[#FEFEFE]">{siteSettings.sadapayTitle || OFFICIAL_PAYMENT_ACCOUNTS.sadapay.accountHolder}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Payment Number</p>
                  <p className="text-base font-mono font-semibold text-[#FECF35]">{siteSettings.sadapayNumber || OFFICIAL_PAYMENT_ACCOUNTS.sadapay.paymentNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(siteSettings.sadapayNumber || OFFICIAL_PAYMENT_ACCOUNTS.sadapay.paymentNumber, 'sp')}
                className="w-full py-2 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#FEFEFE]/15"
              >
                {copiedKey === 'sp' ? <Check className="w-3.5 h-3.5 text-[#FECF35]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sp' ? 'Number Copied!' : 'Copy SadaPay Number'}</span>
              </button>
            </div>

            {/* 3. Easypaisa */}
            <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-[#FECF35]/40 transition shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Easypaisa
                  </span>
                  <span className="text-[10px] bg-[#033D6B] text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-500/25">
                    Mobile Wallet
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Account Holder</p>
                  <p className="text-sm font-semibold text-[#FEFEFE]">{siteSettings.easypaisaTitle || OFFICIAL_PAYMENT_ACCOUNTS.easypaisa.accountHolder}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-medium text-[#FEFEFE]/60">Payment Number</p>
                  <p className="text-base font-mono font-semibold text-emerald-400">{siteSettings.easypaisaNumber || OFFICIAL_PAYMENT_ACCOUNTS.easypaisa.paymentNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(siteSettings.easypaisaNumber || OFFICIAL_PAYMENT_ACCOUNTS.easypaisa.paymentNumber, 'ep')}
                className="w-full py-2 rounded-lg bg-[#033D6B] hover:bg-[#07355c] text-[#FEFEFE] text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#FEFEFE]/15"
              >
                {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ep' ? 'Number Copied!' : 'Copy Easypaisa Number'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Form */}
        <div className="bg-[#093D6C] border border-[#FEFEFE]/15 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-[#FEFEFE]/10 pb-4">
            <h3 className="text-base font-heading font-semibold text-[#FEFEFE] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FECF35]" />
              <span>Step 2: Submit Payment & Receipt Details</span>
            </h3>
            <p className="text-xs text-[#FEFEFE]/75 mt-1 font-sans">
              Enter the TRX ID from your SMS or banking app and upload your receipt screenshot for administrator review.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Payment Method Selector */}
            <div>
              <label className="block font-medium text-[#FEFEFE]/90 mb-2">
                Select Used Payment Method <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'bank_transfer', label: 'Bank Transfer (Meezan)', icon: <Building className="w-4 h-4 text-[#FECF35]" /> },
                  { id: 'sadapay', label: 'SadaPay', icon: <Smartphone className="w-4 h-4 text-[#FECF35]" /> },
                  { id: 'easypaisa', label: 'Easypaisa', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#033D6B] border-[#FECF35] text-white shadow-md'
                        : 'bg-[#033D6B]/50 border-[#FEFEFE]/15 text-[#FEFEFE]/70 hover:border-[#FEFEFE]/30'
                    }`}
                  >
                    {m.icon}
                    <span className="font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TRX ID & Payment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#FEFEFE]/90 mb-1.5">
                  Transaction ID / Reference Number (TRX ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10482938192 or TRX-2849"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-white font-mono placeholder:text-[#FEFEFE]/40 focus:outline-none focus:ring-1 focus:ring-[#FECF35] focus:border-[#FECF35]"
                />
                <p className="text-[11px] text-[#FEFEFE]/60 mt-1 font-sans">Found in your SMS receipt or mobile app confirmation</p>
              </div>

              <div>
                <label className="block font-medium text-[#FEFEFE]/90 mb-1.5">
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#033D6B] border border-[#FEFEFE]/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FECF35] focus:border-[#FECF35]"
                />
              </div>
            </div>

            {/* Amount Confirmation (Read-only PKR 1,000) */}
            <div className="p-3.5 bg-[#033D6B] rounded-xl border border-[#FEFEFE]/15 flex items-center justify-between">
              <div>
                <span className="text-[#FEFEFE]/70">Membership Fee Amount:</span>
                <span className="text-white font-semibold ml-2">PKR {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}</span>
              </div>
              <span className="text-[10px] text-[#033D6B] font-semibold bg-[#FECF35] px-2 py-0.5 rounded">
                Annual Subscription
              </span>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block font-medium text-[#FEFEFE]/90 mb-1.5">
                Upload Receipt Screenshot <span className="text-rose-400">*</span>
              </label>
              <div className="border-2 border-dashed border-[#FEFEFE]/25 hover:border-[#FECF35] rounded-xl p-6 text-center transition bg-[#033D6B] relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  required={!receiptBase64}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-lg bg-[#093D6C] border border-[#FEFEFE]/15 flex items-center justify-center mx-auto text-[#FECF35]">
                    <Upload className="w-5 h-5" />
                  </div>
                  {receiptFileName ? (
                    <div>
                      <p className="text-xs font-semibold text-emerald-300 truncate max-w-sm mx-auto">{receiptFileName}</p>
                      <p className="text-[10px] text-[#FEFEFE]/60">Click to change selected image</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-[#FEFEFE]">
                        Click or drag receipt screenshot here
                      </p>
                      <p className="text-[10px] text-[#FEFEFE]/60">PNG, JPG, or WebP up to 2 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Preview */}
              {receiptBase64 && (
                <div className="mt-3 p-3 bg-[#033D6B] border border-[#FEFEFE]/15 rounded-xl flex items-center gap-3">
                  <img
                    src={receiptBase64}
                    alt="Receipt Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-[#FEFEFE]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{receiptFileName || 'Receipt Screenshot'}</p>
                    <p className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Ready for verification
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptBase64('');
                      setReceiptFileName('');
                    }}
                    className="text-xs text-rose-300 hover:underline font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Refund & Verification Terms Note */}
            <div className="p-3.5 bg-[#033D6B] rounded-xl border border-[#FEFEFE]/15 text-[11px] text-[#FEFEFE]/80 flex items-start gap-2.5 font-sans">
              <Info className="w-4 h-4 text-[#FECF35] shrink-0 mt-0.5" />
              <span>
                <strong>Verification Policy:</strong> Manual verification ensures authentic student access. Our administrator checks bank statements against your TRX ID. Membership activates automatically for 365 days upon approval.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-[#FECF35] hover:bg-[#ebd02f] text-[#033D6B] font-medium text-sm shadow transition cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-[#033D6B]" />
                    <span>Verifying & submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#033D6B]" />
                    <span>Submit payment request for review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
