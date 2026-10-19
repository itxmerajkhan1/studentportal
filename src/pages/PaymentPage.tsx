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

interface PaymentPageProps {
  siteSettings: SiteSettings;
  navigate: (route: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ siteSettings, navigate }) => {
  const { user, profile, isApproved, isPending, membershipStatus, refreshProfile } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-amber-800/80 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-white">Admission Approval Pending</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your initial student registration is currently being verified by the admissions committee. Once approved, you can purchase the annual membership here.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/application-status')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Check Admission Status
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Browse Course Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/membership')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Membership Overview</span>
          </button>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
            Secure Verification
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Annual Membership Payment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Send fee via Easypaisa, JazzCash, or online bank transfer and submit your transaction reference below for verified activation.
          </p>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-cyan-800/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Official Student Package</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Full-Year Academic Membership</h2>
            <p className="text-xs text-slate-300">
              Valid for {siteSettings.membershipDurationDays || 365} days • Access to all FSc/Matric lectures, notes, & past papers
            </p>
          </div>
          <div className="text-center sm:text-right shrink-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white">
              Rs. {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">PKR / Annual (No recurring charges)</p>
          </div>
        </div>

        {/* Section 1: Official Verified Accounts (Configured by Admin) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Transfer Fee to Verified Accounts</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click to copy account number</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Easypaisa */}
            <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Easypaisa
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  Instant
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Account Title</p>
                <p className="text-sm font-bold text-white">{siteSettings.easypaisaTitle || 'Meraj Educational Portal'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Mobile / Account No.</p>
                <p className="text-sm font-mono font-bold text-emerald-300">{siteSettings.easypaisaNumber || '0300-1234567'}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(siteSettings.easypaisaNumber || '0300-1234567', 'ep')}
                className="w-full py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-800"
              >
                {copiedKey === 'ep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ep' ? 'Copied!' : 'Copy Number'}</span>
              </button>
            </div>

            {/* JazzCash */}
            <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> JazzCash
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  Instant
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Account Title</p>
                <p className="text-sm font-bold text-white">{siteSettings.jazzcashTitle || 'Meraj Educational Portal'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Mobile / Account No.</p>
                <p className="text-sm font-mono font-bold text-amber-300">{siteSettings.jazzcashNumber || '0301-7654321'}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(siteSettings.jazzcashNumber || '0301-7654321', 'jc')}
                className="w-full py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-800"
              >
                {copiedKey === 'jc' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'jc' ? 'Copied!' : 'Copy Number'}</span>
              </button>
            </div>

            {/* Bank Transfer */}
            <div className="bg-slate-900 border border-cyan-900/60 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/60 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> Bank Transfer
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold truncate max-w-[90px]">
                  {siteSettings.bankName || 'Meezan Bank'}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Account Title</p>
                <p className="text-sm font-bold text-white truncate">{siteSettings.bankTitle || 'Meraj Learning Academy'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">IBAN / Account Number</p>
                <p className="text-xs font-mono font-bold text-cyan-300 truncate">{siteSettings.bankIban || 'PK36MEZN0001234567890123'}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(siteSettings.bankIban || 'PK36MEZN0001234567890123', 'bank')}
                className="w-full py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-cyan-800"
              >
                {copiedKey === 'bank' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'bank' ? 'Copied!' : 'Copy IBAN'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <span>Step 2: Submit Payment & Receipt Details</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter the TRX ID from your SMS or bank app and upload the transaction screenshot for admin review.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Payment Method Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2">
                Select Used Payment Method <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'easypaisa', label: 'Easypaisa', icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
                  { id: 'jazzcash', label: 'JazzCash', icon: <Smartphone className="w-4 h-4 text-amber-400" /> },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: <Building className="w-4 h-4 text-cyan-400" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m.icon}
                    <span className="font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TRX ID & Payment Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Transaction ID / Reference Number (TRX ID) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10482938192 or TRX-2849"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Found in your SMS receipt or mobile app confirmation</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Amount Confirmation (Read-only PKR 1,000) */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Membership Fee Amount:</span>
                <span className="text-white font-bold ml-2">PKR {siteSettings.annualMembershipFee?.toLocaleString() || '1,000'}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Annual Subscription
              </span>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Upload Receipt Screenshot <span className="text-rose-400">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center transition bg-slate-950 relative">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  required={!receiptBase64}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  {receiptFileName ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-400 truncate max-w-sm mx-auto">{receiptFileName}</p>
                      <p className="text-[10px] text-slate-400">Click to change selected image</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Click or drag receipt screenshot here
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, or WebP up to 2 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Preview */}
              {receiptBase64 && (
                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <img
                    src={receiptBase64}
                    alt="Receipt Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{receiptFileName || 'Receipt Screenshot'}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Ready for verification
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptBase64('');
                      setReceiptFileName('');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Refund & Verification Terms Note */}
            <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-900/60 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Verification Policy:</strong> Manual verification ensures authentic student access. Our administrator checks bank statements against your TRX ID. Membership activates automatically for 365 days upon approval.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Verifying & Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Request for Review</span>
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
