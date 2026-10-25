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

export type PaymentMethod = 'bank_transfer' | 'sadapay' | 'easypaisa' | 'jazzcash';
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

export interface Subject {
  id: string;
  name: string;
  code?: string;
  academicLevel: string;
  iconName: string;
  description: string;
  colorTheme: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  subjectId?: string;
  chapterId?: string;
  chapterTitle: string;
  title: string;
  description: string;
  videoUrl: string;
  videoProvider?: 'youtube' | 'vimeo' | 'direct' | 'storage';
  durationMinutes: number;
  order: number;
  pdfNotesUrl?: string;
  pdfStoragePath?: string;
  pdfFileName?: string;
  pdfFileSize?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonProgress {
  userId: string;
  courseId: string;
  subjectId?: string;
  chapterId?: string;
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
  // Bank Details
  bankName: string;
  bankBranch?: string;
  bankTitle: string;
  bankAccountNumber?: string;
  bankIban: string;
  // SadaPay
  sadapayTitle?: string;
  sadapayNumber?: string;
  // Easypaisa
  easypaisaTitle: string;
  easypaisaNumber: string;
  // Jazzcash
  jazzcashTitle?: string;
  jazzcashNumber?: string;
  paymentInstructions?: string;
  updatedAt?: string;
}
