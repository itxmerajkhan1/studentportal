export type UserRole = 'student' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type MembershipStatus = 'unpaid' | 'pending' | 'active' | 'expired';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  academicLevel: string;
  studentId?: string;
  role: UserRole;
  status: ApprovalStatus;
  rejectionReason?: string;
  membershipStatus?: MembershipStatus;
  membershipExpiresAt?: string | null;
  registeredAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  currency: string; // 'PKR'
  paymentMethod: PaymentMethod;
  transactionReference: string;
  receiptUrl: string;
  submittedAt: string;
  status: PaymentStatus;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  academicLevel: string;
  instructor: string;
  description: string;
  thumbnailUrl: string;
  isPublished: boolean;
  totalLessons?: number;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  chapterTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  videoProvider?: 'youtube' | 'vimeo' | 'direct' | 'storage';
  durationMinutes: number;
  order: number;
  pdfNotesUrl?: string;
  isPublished: boolean;
  createdAt?: string;
}

export interface LessonProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastWatchedSeconds?: number;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent' | 'info';
  isActive: boolean;
  createdAt: string;
}

export interface SiteSettings {
  portalName: string;
  supportPhone: string;
  supportEmail: string;
  announcementBanner?: string;
  allowPublicRegistration: boolean;
  annualMembershipFee: number;
  membershipDurationDays: number;
  easypaisaTitle: string;
  easypaisaNumber: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  bankName: string;
  bankTitle: string;
  bankIban: string;
  paymentInstructions?: string;
  updatedAt?: string;
}
