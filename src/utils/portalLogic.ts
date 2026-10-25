/**
 * Pure business logic for Meraj Learning Portal
 * Decoupled from React and Firebase for high testability and deterministic validation.
 */

export interface StudentRegistrationInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  academicLevel: string;
  studentId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateStudentRegistration(input: StudentRegistrationInput, isPasswordRequired = true): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  // Support Pakistani mobile numbers (+923..., 03..., or standard 10-15 digit phone)
  const cleanPhone = input.phoneNumber.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+92|0092|92|0)?3[0-9]{9}$/;
  if (!cleanPhone || (!phoneRegex.test(cleanPhone) && cleanPhone.length < 8)) {
    errors.phoneNumber = 'Enter a valid phone number (e.g., 0300-1234567 or +923001234567).';
  }

  if (!input.academicLevel || input.academicLevel.trim() === '') {
    errors.academicLevel = 'Please select your class or academic level.';
  }

  if (isPasswordRequired) {
    if (!input.password || input.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (input.password !== input.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function canAccessCurriculum(role?: string, status?: string): boolean {
  if (role === 'admin') return true;
  return status === 'approved';
}

/**
 * Validates whether the student's annual membership is currently active and unexpired.
 */
export function isMembershipActive(
  membershipStatus?: string,
  membershipExpiresAt?: string | null,
  referenceTimestamp = Date.now()
): boolean {
  if (membershipStatus !== 'active') return false;
  if (!membershipExpiresAt) return false;
  const expiryTime = new Date(membershipExpiresAt).getTime();
  if (isNaN(expiryTime)) return false;
  return expiryTime > referenceTimestamp;
}

/**
/**
 * Single trusted access-control policy for lecture videos and PDF notes:
 * Access is granted to:
 * 1. Administrator (role === 'admin')
 * 2. Approved student (status === 'approved')
 *
 * Video access does NOT require a verified payment or active paid membership!
 * Approved students can stream published videos even if unpaid.
 * Suspended or rejected students remain blocked.
 */
export function canAccessLectureVideos(role?: string, approvalStatus?: string): boolean {
  if (role === 'admin') return true;
  return approvalStatus === 'approved';
}

/**
 * Backward-compatible wrapper aliasing the single trusted video access function.
 */
export function canAccessPaidLessons(
  role?: string,
  approvalStatus?: string,
  _membershipStatus?: string,
  _membershipExpiresAt?: string | null,
  _referenceTimestamp = Date.now()
): boolean {
  return canAccessLectureVideos(role, approvalStatus);
}

/**
 * Calculates new membership expiry.
 * If renewing an existing active membership that has not yet expired, extends from the current expiry date.
 * Otherwise, extends from the new activation timestamp.
 */
export function calculateMembershipExpiry(
  currentExpiresAt?: string | null,
  daysToAdd = 365,
  currentTimestamp = Date.now()
): string {
  let baseDate = new Date(currentTimestamp);
  if (currentExpiresAt) {
    const existingTime = new Date(currentExpiresAt).getTime();
    if (!isNaN(existingTime) && existingTime > currentTimestamp) {
      baseDate = new Date(existingTime);
    }
  }
  const newDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return newDate.toISOString();
}

export interface PaymentSubmissionInput {
  paymentMethod: string;
  transactionReference: string;
  receiptUrl: string;
  amount: number;
}

export function validatePaymentSubmission(input: PaymentSubmissionInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.paymentMethod || !['bank_transfer', 'sadapay', 'easypaisa', 'jazzcash'].includes(input.paymentMethod)) {
    errors.paymentMethod = 'Please select a valid payment method (Bank Transfer, SadaPay, or Easypaisa).';
  }

  const txRef = (input.transactionReference || '').trim();
  if (!txRef || txRef.length < 4) {
    errors.transactionReference = 'Transaction ID / Reference number must be at least 4 characters.';
  } else if (txRef.length > 80) {
    errors.transactionReference = 'Transaction Reference is too long (maximum 80 characters).';
  }

  if (!input.receiptUrl || input.receiptUrl.trim() === '') {
    errors.receiptUrl = 'Please upload a screenshot of your payment receipt.';
  }

  if (!input.amount || input.amount <= 0) {
    errors.amount = 'Valid payment amount is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function findDuplicateTransaction(
  existingReferences: string[],
  newReference: string,
  currentRequestId?: string
): boolean {
  const normalizedNew = newReference.trim().toLowerCase();
  if (!normalizedNew) return false;
  return existingReferences.some((ref) => ref.trim().toLowerCase() === normalizedNew);
}

export function computeCourseProgress(
  courseLessonIds: string[],
  completedLessonIds: string[]
): { completedCount: number; totalCount: number; percentage: number; isCompleted: boolean } {
  if (!courseLessonIds || courseLessonIds.length === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 0, isCompleted: false };
  }

  const completedSet = new Set(completedLessonIds);
  const completedCount = courseLessonIds.filter((id) => completedSet.has(id)).length;
  const totalCount = courseLessonIds.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    completedCount,
    totalCount,
    percentage,
    isCompleted: completedCount === totalCount,
  };
}

export interface LessonItem {
  id: string;
  order: number;
  courseId: string;
  title: string;
}

export function getNextLesson(lessons: LessonItem[], completedLessonIds: string[]): LessonItem | null {
  if (!lessons || lessons.length === 0) return null;
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const completedSet = new Set(completedLessonIds);

  const next = sorted.find((l) => !completedSet.has(l.id));
  return next || sorted[0]; // If all completed, return first
}

export interface StudentListItem {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  academicLevel: string;
  studentId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  membershipStatus?: 'unpaid' | 'pending' | 'active' | 'expired';
  membershipExpiresAt?: string | null;
  role: 'student' | 'admin';
}

export function filterStudents(
  students: StudentListItem[],
  query: string,
  statusFilter: string,
  levelFilter: string
): StudentListItem[] {
  const q = query.trim().toLowerCase();

  return students.filter((s) => {
    const matchesSearch =
      q === '' ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phoneNumber.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || s.academicLevel === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });
}
