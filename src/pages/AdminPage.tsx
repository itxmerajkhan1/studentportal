import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  db,
  updateUserStatus,
  saveCourse,
  deleteCourseDoc,
  saveLesson,
  deleteLessonDoc,
  saveAnnouncementDoc,
  saveSiteSettings,
  fetchAllPaymentRequestsAdmin,
  approvePaymentRequest,
  rejectPaymentRequest,
  manuallySetStudentMembership,
  fetchSubjects,
  saveSubject,
  deleteSubjectDoc,
  fetchChapters,
  saveChapter,
  deleteChapterDoc,
} from '../firebase/config';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import {
  Course,
  Lesson,
  UserProfile,
  Announcement,
  SiteSettings,
  LessonProgress,
  PaymentRequest,
  PaymentMethod,
  PaymentStatus,
  MembershipStatus,
  Subject,
  Chapter,
} from '../types';
import { filterStudents, calculateMembershipExpiry } from '../utils/portalLogic';
import { PdfUploadField } from '../components/PdfUploadField';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Video,
  Bell,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  Save,
  BarChart,
  Eye,
  RefreshCw,
  Lock,
  CreditCard,
  Smartphone,
  Building,
  Copy,
  Check,
  Award,
  Layers,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Atom,
  FlaskConical,
  Calculator,
  Cpu,
  ChevronRight,
} from 'lucide-react';

interface AdminPageProps {
  courses: Course[];
  lessons: Lesson[];
  announcements: Announcement[];
  siteSettings: SiteSettings;
  subjects?: Subject[];
  chapters?: Chapter[];
  onRefreshData: () => Promise<void>;
  navigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  courses,
  lessons,
  announcements,
  siteSettings,
  subjects = [],
  chapters = [],
  onRefreshData,
  navigate,
}) => {
  const { user, isAdmin, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'payments' | 'curriculum' | 'courses' | 'lessons' | 'announcements' | 'settings'>('overview');
  const [curriculumSubTab, setCurriculumSubTab] = useState<'subjects' | 'chapters' | 'lectures'>('subjects');
  const [adminSubjects, setAdminSubjects] = useState<Subject[]>(subjects);
  const [adminChapters, setAdminChapters] = useState<Chapter[]>(chapters);
  const [selectedCurriculumSubjectId, setSelectedCurriculumSubjectId] = useState<string>('');
  const [selectedCurriculumChapterId, setSelectedCurriculumChapterId] = useState<string>('');

  // Modals for Subject, Chapter, and Curriculum Lecture
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);

  const [curriculumLectureModalOpen, setCurriculumLectureModalOpen] = useState(false);
  const [editingCurriculumLecture, setEditingCurriculumLecture] = useState<Partial<Lesson> | null>(null);

  useEffect(() => {
    if (subjects && subjects.length > 0) {
      setAdminSubjects(subjects);
      if (!selectedCurriculumSubjectId) {
        setSelectedCurriculumSubjectId(subjects[0].id);
      }
    }
  }, [subjects]);

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      setAdminChapters(chapters);
    }
  }, [chapters]);

  const loadCurriculumData = async () => {
    try {
      const s = await fetchSubjects();
      if (s && s.length > 0) setAdminSubjects(s);
      const c = await fetchChapters();
      if (c && c.length > 0) setAdminChapters(c);
    } catch (err) {
      console.warn('Failed to reload curriculum in admin:', err);
    }
  };
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Student filtering states
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Payment Verification states
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [rejectModalPayment, setRejectModalPayment] = useState<PaymentRequest | null>(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('Transaction reference not verified in bank/wallet records.');
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);
  const [grantMembershipStudent, setGrantMembershipStudent] = useState<UserProfile | null>(null);
  const [grantDays, setGrantDays] = useState<number>(365);

  // Modals
  const [rejectModalStudent, setRejectModalStudent] = useState<UserProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incomplete academic documentation or unreachable contact details.');
  const [detailsModalStudent, setDetailsModalStudent] = useState<UserProfile | null>(null);
  const [studentProgressList, setStudentProgressList] = useState<LessonProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Course Modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  // Lesson Modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);

  // Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'urgent' | 'info',
    isActive: true,
  });

  // Settings State
  const [portalSettings, setPortalSettings] = useState<SiteSettings>(siteSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (siteSettings) {
      setPortalSettings(siteSettings);
    }
  }, [siteSettings]);

  const fetchStudentsList = async () => {
    if (!isAdmin) return;
    setLoadingStudents(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, 'uid'>) }));
      setStudents(list);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchPaymentsList = async () => {
    if (!isAdmin) return;
    setLoadingPayments(true);
    try {
      const list = await fetchAllPaymentRequestsAdmin();
      if (list) setPaymentRequests(list);
    } catch (err) {
      console.error('Error fetching payment requests:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStudentsList();
      fetchPaymentsList();
    }
  }, [isAdmin]);

  useEffect(() => {
    setPortalSettings(siteSettings);
  }, [siteSettings]);

  // Guard: If not admin
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">403 Forbidden Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Administrative privileges required. Only verified portal administrators can access student admission reviews, curriculum publishing, and system configurations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const totalStudents = students.length;
  const pendingStudents = students.filter((s) => s.status === 'pending').length;
  const approvedStudents = students.filter((s) => s.status === 'approved').length;
  const activeMembershipsCount = students.filter((s) => s.membershipStatus === 'active').length;
  const totalCourses = courses.length;
  const totalLessons = lessons.length;

  // Payment Metrics & Duplicate TRX Map
  const totalVerifiedRevenue = useMemo(() => {
    return paymentRequests
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [paymentRequests]);

  const pendingPaymentsCount = useMemo(() => {
    return paymentRequests.filter((p) => p.status === 'pending').length;
  }, [paymentRequests]);

  const duplicateTrxMap = useMemo(() => {
    const counts: Record<string, number> = {};
    paymentRequests.forEach((p) => {
      const norm = p.transactionReference?.trim().toLowerCase();
      if (norm) counts[norm] = (counts[norm] || 0) + 1;
    });
    return counts;
  }, [paymentRequests]);

  const filteredPayments = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase();
    return paymentRequests.filter((p) => {
      const matchesSearch =
        q === '' ||
        p.studentName?.toLowerCase().includes(q) ||
        p.studentEmail?.toLowerCase().includes(q) ||
        p.transactionReference?.toLowerCase().includes(q);
      const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
      const matchesMethod = paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [paymentRequests, paymentSearch, paymentStatusFilter, paymentMethodFilter]);

  const filteredStudents = filterStudents(students, studentSearch, statusFilter, levelFilter);

  // Payment Action Handlers
  const handleApprovePayment = async (req: PaymentRequest) => {
    try {
      const durationDays = portalSettings.membershipDurationDays || 365;
      await approvePaymentRequest(req.id, req.studentUid, user?.email || 'admin@merajlearning.pk', durationDays);
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === req.id
            ? { ...p, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: user?.email }
            : p
        )
      );
      const newExpiry = calculateMembershipExpiry(null, durationDays);
      setStudents((prev) =>
        prev.map((s) =>
          s.uid === req.studentUid
            ? { ...s, membershipStatus: 'active', membershipExpiresAt: newExpiry }
            : s
        )
      );
      setFeedbackMsg(`Payment approved! 365-day membership activated for ${req.studentName}.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Failed to approve payment:', err);
    }
  };

  const handleOpenRejectPayment = (req: PaymentRequest) => {
    setRejectModalPayment(req);
    setPaymentRejectionReason('Transaction reference not verified in bank/wallet records.');
  };

  const handleConfirmRejectPayment = async () => {
    if (!rejectModalPayment) return;
    try {
      await rejectPaymentRequest(
        rejectModalPayment.id,
        rejectModalPayment.studentUid,
        paymentRejectionReason,
        user?.email || 'admin@merajlearning.pk'
      );
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === rejectModalPayment.id
            ? {
                ...p,
                status: 'rejected',
                rejectionReason: paymentRejectionReason,
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.email,
              }
            : p
        )
      );
      setStudents((prev) =>
        prev.map((s) => (s.uid === rejectModalPayment.studentUid ? { ...s, membershipStatus: 'unpaid' } : s))
      );
      setRejectModalPayment(null);
      setFeedbackMsg('Payment request marked as rejected.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Failed to reject payment:', err);
    }
  };

  const handleManualGrantMembership = async (studentUid: string, days: number) => {
    try {
      const targetStudent = students.find((s) => s.uid === studentUid);
      const newExpiry = calculateMembershipExpiry(targetStudent?.membershipExpiresAt, days);
      await manuallySetStudentMembership(studentUid, 'active', newExpiry);
      setStudents((prev) =>
        prev.map((s) =>
          s.uid === studentUid
            ? { ...s, membershipStatus: 'active', membershipExpiresAt: newExpiry }
            : s
        )
      );
      setGrantMembershipStudent(null);
      setFeedbackMsg(`Granted ${days}-day membership successfully.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Failed to manually grant membership:', err);
    }
  };

  const handleRevokeMembership = async (studentUid: string) => {
    if (!confirm('Are you sure you want to revoke this student membership?')) return;
    try {
      await manuallySetStudentMembership(studentUid, 'expired', null);
      setStudents((prev) =>
        prev.map((s) =>
          s.uid === studentUid
            ? { ...s, membershipStatus: 'expired', membershipExpiresAt: null }
            : s
        )
      );
      setFeedbackMsg('Student membership revoked.');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      console.error('Failed to revoke membership:', err);
    }
  };

  // Student Actions
  const handleApprove = async (uid: string) => {
    try {
      await updateUserStatus(uid, 'approved');
      setStudents((prev) => prev.map((s) => (s.uid === uid ? { ...s, status: 'approved' } : s)));
      setFeedbackMsg('Student admission approved successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to approve student:', err);
    }
  };

  const handleOpenReject = (student: UserProfile) => {
    setRejectModalStudent(student);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalStudent) return;
    try {
      await updateUserStatus(rejectModalStudent.uid, 'rejected', rejectionReason);
      setStudents((prev) =>
        prev.map((s) =>
          s.uid === rejectModalStudent.uid ? { ...s, status: 'rejected', rejectionReason } : s
        )
      );
      setRejectModalStudent(null);
      setFeedbackMsg('Student admission marked as rejected.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to reject student:', err);
    }
  };

  const handleSuspend = async (uid: string) => {
    try {
      await updateUserStatus(uid, 'suspended', 'Access suspended by administrator.');
      setStudents((prev) => prev.map((s) => (s.uid === uid ? { ...s, status: 'suspended' } : s)));
      setFeedbackMsg('Student access suspended.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to suspend student:', err);
    }
  };

  const handleReactivate = async (uid: string) => {
    try {
      await updateUserStatus(uid, 'approved');
      setStudents((prev) => prev.map((s) => (s.uid === uid ? { ...s, status: 'approved' } : s)));
      setFeedbackMsg('Student access reactivated.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to reactivate student:', err);
    }
  };

  const handleDeleteStudent = async (uid: string) => {
    if (!confirm('Are you sure you want to permanently delete this student record?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setStudents((prev) => prev.filter((s) => s.uid !== uid));
      setFeedbackMsg('Student record removed.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  const handleViewDetails = async (student: UserProfile) => {
    setDetailsModalStudent(student);
    setLoadingProgress(true);
    try {
      const snap = await getDocs(collection(db, 'users', student.uid, 'progress'));
      setStudentProgressList(snap.docs.map((d) => d.data() as LessonProgress));
    } catch (err) {
      console.error('Failed to load student progress:', err);
      setStudentProgressList([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Course Save & Delete
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title || !editingCourse.subject) return;
    try {
      await saveCourse({
        id: editingCourse.id,
        title: editingCourse.title,
        subject: editingCourse.subject,
        academicLevel: editingCourse.academicLevel || 'FSc Part 2 (Class 12)',
        instructor: editingCourse.instructor || 'Senior Faculty',
        description: editingCourse.description || '',
        thumbnailUrl:
          editingCourse.thumbnailUrl ||
          'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
        isPublished: editingCourse.isPublished ?? true,
        duration: editingCourse.duration || '16 Hours',
      });
      await onRefreshData();
      setCourseModalOpen(false);
      setEditingCourse(null);
      setFeedbackMsg('Course saved successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course and its curriculum references?')) return;
    try {
      await deleteCourseDoc(courseId);
      await onRefreshData();
      setFeedbackMsg('Course deleted.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  // Lesson Save & Delete
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson?.title || !editingLesson.courseId || !editingLesson.videoUrl) return;
    try {
      await saveLesson({
        id: editingLesson.id,
        courseId: editingLesson.courseId,
        chapterTitle: editingLesson.chapterTitle || 'Chapter 1: Foundations',
        title: editingLesson.title,
        description: editingLesson.description || '',
        videoUrl: editingLesson.videoUrl,
        videoProvider: editingLesson.videoProvider || 'youtube',
        durationMinutes: Number(editingLesson.durationMinutes) || 30,
        order: Number(editingLesson.order) || 1,
        pdfNotesUrl: editingLesson.pdfNotesUrl || '',
        pdfStoragePath: editingLesson.pdfStoragePath || '',
        pdfFileName: editingLesson.pdfFileName || '',
        pdfFileSize: editingLesson.pdfFileSize,
        isPublished: editingLesson.isPublished ?? true,
      });
      await onRefreshData();
      setLessonModalOpen(false);
      setEditingLesson(null);
      setFeedbackMsg('Lesson saved successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error saving lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      await deleteLessonDoc(lessonId);
      await onRefreshData();
      setFeedbackMsg('Lecture deleted.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error deleting lesson:', err);
    }
  };

  // Announcement Save
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      await saveAnnouncementDoc({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        isActive: newAnnouncement.isActive,
        createdAt: new Date().toISOString(),
      });
      await onRefreshData();
      setAnnouncementModalOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal',
        isActive: true,
      });
      setFeedbackMsg('Announcement published.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error publishing announcement:', err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveSiteSettings(portalSettings);
      await onRefreshData();
      setFeedbackMsg('Site configuration updated successfully.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Curriculum Handlers: Subjects
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject?.name) return;
    try {
      await saveSubject({
        id: editingSubject.id,
        name: editingSubject.name,
        code: editingSubject.code || '',
        academicLevel: editingSubject.academicLevel || 'Class 12 / HSSC-II',
        iconName: editingSubject.iconName || 'Atom',
        colorTheme: editingSubject.colorTheme || 'sky',
        description: editingSubject.description || '',
        order: Number(editingSubject.order) || 1,
        isPublished: editingSubject.isPublished ?? true,
      });
      await loadCurriculumData();
      await onRefreshData();
      setSubjectModalOpen(false);
      setEditingSubject(null);
      setFeedbackMsg(`Subject "${editingSubject.name}" saved successfully.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save subject:', err);
    }
  };

  const handleTogglePublishSubject = async (subj: Subject) => {
    try {
      await saveSubject({
        ...subj,
        isPublished: !subj.isPublished,
      });
      await loadCurriculumData();
      await onRefreshData();
      setFeedbackMsg(`Subject "${subj.name}" ${!subj.isPublished ? 'published' : 'unpublished'}.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to toggle publish subject:', err);
    }
  };

  const handleDeleteSubject = async (subj: Subject) => {
    if (!confirm(`Are you sure you want to permanently delete subject "${subj.name}"?`)) return;
    try {
      await deleteSubjectDoc(subj.id);
      await loadCurriculumData();
      await onRefreshData();
      setFeedbackMsg(`Subject "${subj.name}" deleted.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  // Curriculum Handlers: Chapters
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter?.title || !editingChapter.subjectId) return;
    try {
      await saveChapter({
        id: editingChapter.id,
        subjectId: editingChapter.subjectId,
        chapterNumber: Number(editingChapter.chapterNumber) || 1,
        title: editingChapter.title,
        description: editingChapter.description || '',
        order: Number(editingChapter.order) || 1,
        isPublished: editingChapter.isPublished ?? true,
      });
      await loadCurriculumData();
      await onRefreshData();
      setChapterModalOpen(false);
      setEditingChapter(null);
      setFeedbackMsg(`Chapter "${editingChapter.title}" saved.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save chapter:', err);
    }
  };

  const handleMoveChapter = async (chap: Chapter, direction: 'up' | 'down') => {
    const subjChaps = adminChapters
      .filter((c) => c.subjectId === chap.subjectId)
      .sort((a, b) => a.order - b.order);
    const idx = subjChaps.findIndex((c) => c.id === chap.id);
    if (direction === 'up' && idx > 0) {
      const prev = subjChaps[idx - 1];
      const prevOrder = prev.order;
      await saveChapter({ ...prev, order: chap.order });
      await saveChapter({ ...chap, order: prevOrder });
    } else if (direction === 'down' && idx < subjChaps.length - 1) {
      const next = subjChaps[idx + 1];
      const nextOrder = next.order;
      await saveChapter({ ...next, order: chap.order });
      await saveChapter({ ...chap, order: nextOrder });
    }
    await loadCurriculumData();
  };

  const handleDeleteChapter = async (chap: Chapter) => {
    if (!confirm(`Are you sure you want to delete chapter "${chap.title}"?`)) return;
    try {
      await deleteChapterDoc(chap.id);
      await loadCurriculumData();
      await onRefreshData();
      setFeedbackMsg(`Chapter "${chap.title}" deleted.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    }
  };

  // Curriculum Handlers: Lectures
  const handleSaveCurriculumLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurriculumLecture?.title) return;
    try {
      const chap = adminChapters.find((c) => c.id === editingCurriculumLecture.chapterId);
      await saveLesson({
        id: editingCurriculumLecture.id,
        courseId: editingCurriculumLecture.courseId || courses[0]?.id || 'course-phy-12',
        subjectId: editingCurriculumLecture.subjectId,
        chapterId: editingCurriculumLecture.chapterId,
        chapterTitle: chap ? chap.title : editingCurriculumLecture.chapterTitle || 'Chapter 1',
        title: editingCurriculumLecture.title,
        description: editingCurriculumLecture.description || '',
        videoUrl: editingCurriculumLecture.videoUrl || '',
        videoProvider: (editingCurriculumLecture.videoProvider as any) || 'youtube',
        durationMinutes: Number(editingCurriculumLecture.durationMinutes) || 30,
        order: Number(editingCurriculumLecture.order) || 1,
        pdfNotesUrl: editingCurriculumLecture.pdfNotesUrl || '',
        pdfStoragePath: editingCurriculumLecture.pdfStoragePath || '',
        pdfFileName: editingCurriculumLecture.pdfFileName || '',
        pdfFileSize: editingCurriculumLecture.pdfFileSize,
        isPublished: editingCurriculumLecture.isPublished ?? true,
      });
      await onRefreshData();
      setCurriculumLectureModalOpen(false);
      setEditingCurriculumLecture(null);
      setFeedbackMsg(`Lecture "${editingCurriculumLecture.title}" saved.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save lecture:', err);
    }
  };

  const handleDeleteCurriculumLecture = async (lec: Lesson) => {
    if (!confirm(`Are you sure you want to delete lecture "${lec.title}"?`)) return;
    try {
      await deleteLessonDoc(lec.id);
      await onRefreshData();
      setFeedbackMsg(`Lecture "${lec.title}" deleted.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete lecture:', err);
    }
  };

  const handleMoveCurriculumLecture = async (lec: Lesson, direction: 'up' | 'down') => {
    const chapLessons = lessons
      .filter((l) => l.chapterId === lec.chapterId)
      .sort((a, b) => a.order - b.order);
    const idx = chapLessons.findIndex((l) => l.id === lec.id);
    if (direction === 'up' && idx > 0) {
      const prev = chapLessons[idx - 1];
      const prevOrder = prev.order;
      await saveLesson({ ...prev, order: lec.order });
      await saveLesson({ ...lec, order: prevOrder });
    } else if (direction === 'down' && idx < chapLessons.length - 1) {
      const next = chapLessons[idx + 1];
      const nextOrder = next.order;
      await saveLesson({ ...next, order: lec.order });
      await saveLesson({ ...lec, order: nextOrder });
    }
    await onRefreshData();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Verifying administrator clearance...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800">
              403 Forbidden Access
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              Administrator Clearance Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account ({user?.email || 'Unauthenticated'}) is not authorized to access the Administrator Control Panel.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Go to Student Dashboard
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              Admin Portal Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Administrator Control Panel</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{user?.email}</strong> • Academic moderation & video asset distribution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStudentsList();
                fetchPaymentsList();
                onRefreshData();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 text-slate-300 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              Student View →
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedbackMsg && (
          <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: <BarChart className="w-4 h-4" /> },
            {
              id: 'students',
              label: `Student Approvals ${pendingStudents > 0 ? `(${pendingStudents} New)` : ''}`,
              icon: <Users className="w-4 h-4" />,
            },
            {
              id: 'payments',
              label: `Payment Verification ${pendingPaymentsCount > 0 ? `(${pendingPaymentsCount} New)` : ''}`,
              icon: <CreditCard className="w-4 h-4" />,
            },
            {
              id: 'curriculum',
              label: `Curriculum (${adminSubjects.length} Subjects)`,
              icon: <Layers className="w-4 h-4" />,
            },
            { id: 'courses', label: `Courses (${totalCourses})`, icon: <BookOpen className="w-4 h-4" /> },
            { id: 'lessons', label: `Lectures (${totalLessons})`, icon: <Video className="w-4 h-4" /> },
            { id: 'announcements', label: 'Circulars', icon: <Bell className="w-4 h-4" /> },
            { id: 'settings', label: 'Portal Settings', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">Total Registered</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{totalStudents}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Students in database</p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-950 text-blue-400 border border-blue-800">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-800/60 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-amber-400">Pending Admissions</p>
                  <p className="text-3xl font-extrabold text-amber-300 mt-1">{pendingStudents}</p>
                  <p className="text-[11px] text-amber-200/80 mt-1">Require moderation</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="bg-slate-900 border border-emerald-800/60 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-emerald-400">Total Verified Revenue</p>
                  <p className="text-3xl font-extrabold text-emerald-300 mt-1">
                    Rs. {totalVerifiedRevenue.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">From approved annual memberships</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-purple-800/60 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-purple-400">Pending Payments</p>
                  <p className="text-3xl font-extrabold text-purple-300 mt-1">{pendingPaymentsCount}</p>
                  <p className="text-[11px] text-purple-200/80 mt-1">Awaiting receipt verification</p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-950 text-purple-400 border border-purple-800">
                  <CreditCard className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="bg-slate-900 border border-cyan-800/60 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-cyan-400">Active Memberships</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{activeMembershipsCount}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Enrolled with video streaming</p>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-cyan-400">Published Lectures</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{totalLessons}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Across {totalCourses} courses</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700">
                  <Video className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Banner if pending payments exist */}
            {pendingPaymentsCount > 0 && (
              <div className="bg-purple-950/40 border border-purple-800/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-purple-300">
                      {pendingPaymentsCount} Student Payment Requests Awaiting Verification
                    </h3>
                    <p className="text-xs text-purple-200/80">
                      Students are waiting for receipt confirmation to begin streaming video lectures.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('payments');
                    setPaymentStatusFilter('pending');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                >
                  Verify Payments Now →
                </button>
              </div>
            )}

            {/* Quick Action Banner if pending admissions exist */}
            {pendingStudents > 0 && (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">
                      {pendingStudents} Student Admission Applications Awaiting Approval
                    </h3>
                    <p className="text-xs text-amber-200/80">
                      Unapproved students cannot view video lectures until authorized.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('students');
                    setStatusFilter('pending');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                >
                  Review Pending Applications Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS APPROVALS & MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search student name, email, phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <span className="px-2 text-slate-400 font-medium">Status:</span>
                  {['all', 'pending', 'approved', 'rejected', 'suspended'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                        statusFilter === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              {loadingStudents ? (
                <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Loading student records from Firestore...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <p>No student applications match the specified criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Academic Level</th>
                        <th className="py-3.5 px-4">Contact Phone</th>
                        <th className="py-3.5 px-4">Admission</th>
                        <th className="py-3.5 px-4">Annual Membership</th>
                        <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredStudents.map((s) => (
                        <tr key={s.uid} className="hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                {s.fullName}
                                {s.role === 'admin' && (
                                  <span className="text-[9px] font-bold bg-cyan-900 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-700">
                                    ADMIN
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-400">{s.email}</p>
                              {s.studentId && (
                                <p className="text-[10px] text-slate-400">ID: {s.studentId}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {s.academicLevel}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="font-mono text-[11px]">{s.phoneNumber}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                s.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                  : s.status === 'pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                                  : 'bg-rose-950 text-rose-300 border border-rose-600'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {s.role === 'admin' ? (
                              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                                Permanent Admin
                              </span>
                            ) : s.membershipStatus === 'active' ? (
                              <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Active (365d)
                                </span>
                                {s.membershipExpiresAt && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Exp: {new Date(s.membershipExpiresAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : s.membershipStatus === 'pending' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                Verification Pending
                              </span>
                            ) : s.membershipStatus === 'expired' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                                Unpaid
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Manage / Grant Membership */}
                              {s.status === 'approved' && s.role !== 'admin' && (
                                <button
                                  onClick={() => {
                                    setGrantMembershipStudent(s);
                                    setGrantDays(365);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 cursor-pointer border border-slate-700"
                                  title="Manage or Grant 365-Day Membership"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetails(s)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                title="View Student Progress Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Approve Button */}
                              {s.status !== 'approved' && (
                                <button
                                  onClick={() => handleApprove(s.uid)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shadow flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {/* Reject Button */}
                              {s.status === 'pending' && (
                                <button
                                  onClick={() => handleOpenReject(s)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-[11px] cursor-pointer shadow flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {/* Suspend / Reactivate */}
                              {s.status === 'approved' && (
                                <button
                                  onClick={() => handleSuspend(s.uid)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[11px] cursor-pointer border border-slate-700"
                                >
                                  Suspend
                                </button>
                              )}
                              {s.status === 'suspended' && (
                                <button
                                  onClick={() => handleReactivate(s.uid)}
                                  className="px-2 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-[11px] cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteStudent(s.uid)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CURRICULUM MANAGEMENT (SUBJECTS, CHAPTERS & LECTURES) */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Header & Sub-Navigation */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    Chapter-Wise Curriculum Hierarchy
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Curriculum Manager
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure subjects, organize chapters in order, and publish video lectures with PDF notes.
                  </p>
                </div>

                {/* Sub-tab pills */}
                <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setCurriculumSubTab('subjects')}
                    className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                      curriculumSubTab === 'subjects'
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Subjects ({adminSubjects.length})
                  </button>
                  <button
                    onClick={() => setCurriculumSubTab('chapters')}
                    className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                      curriculumSubTab === 'chapters'
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2. Chapters ({adminChapters.length})
                  </button>
                  <button
                    onClick={() => setCurriculumSubTab('lectures')}
                    className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
                      curriculumSubTab === 'lectures'
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3. Lectures ({lessons.length})
                  </button>
                </div>
              </div>
            </div>

            {/* SUB-VIEW 1: SUBJECTS */}
            {curriculumSubTab === 'subjects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Configured Subjects</h3>
                    <p className="text-xs text-slate-400">Independent academic subjects with separate syllabi</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSubject({
                        name: '',
                        code: '',
                        academicLevel: 'Class 12 / HSSC-II',
                        iconName: 'Atom',
                        colorTheme: 'sky',
                        description: '',
                        order: adminSubjects.length + 1,
                        isPublished: true,
                      });
                      setSubjectModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Subject</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {adminSubjects.map((subj) => {
                    const subjChapters = adminChapters.filter((c) => c.subjectId === subj.id);
                    const subjLessons = lessons.filter(
                      (l) => l.subjectId === subj.id || (l.courseId && l.courseId.includes(subj.name.toLowerCase().slice(0, 3)))
                    );

                    return (
                      <div
                        key={subj.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Order #{subj.order} {subj.code ? `• ${subj.code}` : ''}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                subj.isPublished
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : 'bg-rose-950 text-rose-300 border border-rose-700'
                              }`}
                            >
                              {subj.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>

                          <h4 className="text-lg font-bold text-white">{subj.name}</h4>
                          <span className="text-xs text-cyan-400 font-semibold">{subj.academicLevel}</span>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{subj.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{subjChapters.length} Chapters</span>
                            <span>{subjLessons.length} Lectures</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSelectedCurriculumSubjectId(subj.id);
                                setCurriculumSubTab('chapters');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                            >
                              <span>Manage Chapters</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleTogglePublishSubject(subj)}
                                title={subj.isPublished ? 'Unpublish' : 'Publish'}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSubject(subj);
                                  setSubjectModalOpen(true);
                                }}
                                title="Edit Subject"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subj)}
                                title="Delete Subject"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: CHAPTERS */}
            {curriculumSubTab === 'chapters' && (
              <div className="space-y-4">
                {/* Subject Selector Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-300 shrink-0">Filter By Subject:</label>
                    <select
                      value={selectedCurriculumSubjectId || (adminSubjects[0]?.id || '')}
                      onChange={(e) => setSelectedCurriculumSubjectId(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                    >
                      {adminSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.academicLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const curSubj = selectedCurriculumSubjectId || adminSubjects[0]?.id || '';
                      const existingChaps = adminChapters.filter((c) => c.subjectId === curSubj);
                      setEditingChapter({
                        subjectId: curSubj,
                        chapterNumber: existingChaps.length + 1,
                        title: `Chapter ${existingChaps.length + 1}: `,
                        description: '',
                        order: existingChaps.length + 1,
                        isPublished: true,
                      });
                      setChapterModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Chapter to Subject</span>
                  </button>
                </div>

                {/* Chapters List */}
                {(() => {
                  const targetSubjectId = selectedCurriculumSubjectId || adminSubjects[0]?.id || '';
                  const subj = adminSubjects.find((s) => s.id === targetSubjectId);
                  const chaps = adminChapters
                    .filter((c) => c.subjectId === targetSubjectId)
                    .sort((a, b) => a.order - b.order);

                  if (chaps.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                        No chapters configured for {subj?.name || 'this subject'} yet. Click &quot;Add Chapter&quot; above to create one.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {chaps.map((chap, idx) => {
                        const chapLessons = lessons.filter(
                          (l) =>
                            l.chapterId === chap.id ||
                            (l.chapterTitle && l.chapterTitle.toLowerCase().includes(chap.title.toLowerCase().slice(0, 15)))
                        );

                        return (
                          <div
                            key={chap.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition shadow-lg"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {chap.chapterNumber}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm sm:text-base font-bold text-white">{chap.title}</h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      chap.isPublished
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                                    }`}
                                  >
                                    {chap.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                </div>
                                {chap.description && (
                                  <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-1">
                                    {chap.description}
                                  </p>
                                )}
                                <div className="text-[11px] text-cyan-400 font-medium mt-1">
                                  {chapLessons.length} Lectures in Chapter • Order #{chap.order}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              {/* Reorder Buttons */}
                              <button
                                onClick={() => handleMoveChapter(chap, 'up')}
                                disabled={idx === 0}
                                title="Move Chapter Up"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveChapter(chap, 'down')}
                                disabled={idx === chaps.length - 1}
                                title="Move Chapter Down"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Manage Lectures */}
                              <button
                                onClick={() => {
                                  setSelectedCurriculumSubjectId(chap.subjectId);
                                  setSelectedCurriculumChapterId(chap.id);
                                  setCurriculumSubTab('lectures');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                              >
                                <span>Lectures</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Chapter */}
                              <button
                                onClick={() => {
                                  setEditingChapter(chap);
                                  setChapterModalOpen(true);
                                }}
                                title="Edit Chapter"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Chapter */}
                              <button
                                onClick={() => handleDeleteChapter(chap)}
                                title="Delete Chapter"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-VIEW 3: LECTURES */}
            {curriculumSubTab === 'lectures' && (
              <div className="space-y-4">
                {/* Selectors Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-300">Subject:</label>
                      <select
                        value={selectedCurriculumSubjectId || (adminSubjects[0]?.id || '')}
                        onChange={(e) => {
                          setSelectedCurriculumSubjectId(e.target.value);
                          const firstChap = adminChapters.find((c) => c.subjectId === e.target.value);
                          setSelectedCurriculumChapterId(firstChap?.id || '');
                        }}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        {adminSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-300">Chapter:</label>
                      <select
                        value={selectedCurriculumChapterId || ''}
                        onChange={(e) => setSelectedCurriculumChapterId(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white max-w-xs truncate"
                      >
                        <option value="">All Chapters in Subject</option>
                        {adminChapters
                          .filter((c) => c.subjectId === (selectedCurriculumSubjectId || adminSubjects[0]?.id))
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const curSubj = selectedCurriculumSubjectId || adminSubjects[0]?.id || '';
                      const chapsInSubj = adminChapters.filter((c) => c.subjectId === curSubj);
                      const curChap = selectedCurriculumChapterId || chapsInSubj[0]?.id || '';
                      const existingLessons = lessons.filter((l) => l.chapterId === curChap);

                      setEditingCurriculumLecture({
                        subjectId: curSubj,
                        chapterId: curChap,
                        courseId: courses[0]?.id || 'course-phy-12',
                        title: '',
                        description: '',
                        videoUrl: '',
                        videoProvider: 'youtube',
                        durationMinutes: 30,
                        order: existingLessons.length + 1,
                        pdfNotesUrl: '',
                        isPublished: true,
                      });
                      setCurriculumLectureModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition self-start md:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Lecture</span>
                  </button>
                </div>

                {/* Filtered Lectures List */}
                {(() => {
                  const curSubj = selectedCurriculumSubjectId || adminSubjects[0]?.id || '';
                  const filteredLessons = lessons
                    .filter((l) => {
                      if (selectedCurriculumChapterId) {
                        return l.chapterId === selectedCurriculumChapterId;
                      }
                      if (curSubj) {
                        return l.subjectId === curSubj;
                      }
                      return true;
                    })
                    .sort((a, b) => a.order - b.order);

                  if (filteredLessons.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                        No lectures found matching the selected subject and chapter. Click &quot;Add New Lecture&quot; to upload one.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
                      {filteredLessons.map((lec, idx) => (
                        <div
                          key={lec.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850 transition"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                              {lec.order}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{lec.title}</h4>
                                <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                  {lec.chapterTitle || 'Chapter'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    lec.isPublished
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                                  }`}
                                >
                                  {lec.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                                <span>{lec.durationMinutes} mins duration</span>
                                <span>•</span>
                                {lec.videoUrl && lec.videoUrl.trim() !== '' ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Video Ready
                                  </span>
                                ) : (
                                  <span className="text-amber-400">Scheduled / Video in Production</span>
                                )}
                                {lec.pdfNotesUrl && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-400">PDF Notes Available</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {/* Reorder */}
                            <button
                              onClick={() => handleMoveCurriculumLecture(lec, 'up')}
                              disabled={idx === 0}
                              title="Move Lecture Up"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCurriculumLecture(lec, 'down')}
                              disabled={idx === filteredLessons.length - 1}
                              title="Move Lecture Down"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingCurriculumLecture(lec);
                                setCurriculumLectureModalOpen(true);
                              }}
                              title="Edit Lecture"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteCurriculumLecture(lec)}
                              title="Delete Lecture"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Curriculum Courses</h2>
                <p className="text-xs text-slate-400">Create, edit, and publish course subjects</p>
              </div>
              <button
                onClick={() => {
                  setEditingCourse({
                    title: '',
                    subject: 'Physics',
                    academicLevel: 'FSc Part 2 (Class 12)',
                    instructor: 'Prof. Tariq Mehmood',
                    description: '',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
                    isPublished: true,
                    duration: '16 Hours',
                  });
                  setCourseModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Course</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-video bg-slate-800">
                      <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-cyan-950 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800">
                        {c.subject}
                      </span>
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.isPublished ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-white line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                      <p className="text-[11px] text-cyan-400 font-medium">Instructor: {c.instructor}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-800 flex items-center justify-between text-xs mt-3">
                    <span className="text-slate-400 text-[11px]">{c.academicLevel}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setCourseModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                        title="Edit course metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LESSONS & VIDEOS */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Lecture Video Library</h2>
                <p className="text-xs text-slate-400">Register video links (YouTube, Vimeo, MP4 direct) and PDF notes</p>
              </div>
              <button
                onClick={() => {
                  setEditingLesson({
                    courseId: courses[0]?.id || '',
                    chapterTitle: 'Chapter 1: Theory',
                    title: '',
                    description: '',
                    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
                    videoProvider: 'youtube',
                    durationMinutes: 30,
                    order: lessons.length + 1,
                    pdfNotesUrl: '',
                    isPublished: true,
                  });
                  setLessonModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Lecture</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <th className="py-3.5 px-4">Lecture Title</th>
                      <th className="py-3.5 px-4">Course & Chapter</th>
                      <th className="py-3.5 px-4">Video Link</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {lessons.map((l) => {
                      const courseObj = courses.find((c) => c.id === l.courseId);
                      return (
                        <tr key={l.id} className="hover:bg-slate-850/50">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white">{l.title}</p>
                            <p className="text-[10px] text-slate-400">Order #{l.order}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <p className="font-medium text-cyan-300">{courseObj?.title || l.courseId}</p>
                            <p className="text-[11px] text-slate-400">{l.chapterTitle}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px] truncate max-w-xs">
                            {l.videoUrl}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {l.durationMinutes} mins
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                l.isPublished ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {l.isPublished ? 'Published' : 'Hidden'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingLesson(l);
                                  setLessonModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(l.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Board Exam Circulars</h2>
                <p className="text-xs text-slate-400">Post announcements that appear in top banners and noticeboards</p>
              </div>
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Circular</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {a.priority}
                      </span>
                      <h4 className="font-bold text-white text-xs">{a.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{a.content}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, 'announcements', a.id));
                      await onRefreshData();
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white">Portal & Payment Configuration</h2>
              <p className="text-xs text-slate-400">
                Manage portal branding, WhatsApp helpline, public contact info, and official payment receiving accounts.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* SECTION 1: BRANDING & CONTACT */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <span>General Brand & Support Helpline</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Portal Brand Name
                    </label>
                    <input
                      type="text"
                      value={portalSettings.portalName || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, portalName: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WhatsApp Support / Helpline Number
                    </label>
                    <input
                      type="text"
                      placeholder="+92 321 2812203"
                      value={portalSettings.supportPhone || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, supportPhone: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Official contact number used for student WhatsApp support</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Public Helpline Email
                    </label>
                    <input
                      type="email"
                      placeholder="itxmirajkhan@gmail.com"
                      value={portalSettings.supportEmail || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, supportEmail: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Displayed to students and visitors (not admin auth email)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Annual Membership Fee (PKR)
                    </label>
                    <input
                      type="number"
                      value={portalSettings.annualMembershipFee ?? 5000}
                      onChange={(e) => setPortalSettings({ ...portalSettings, annualMembershipFee: Number(e.target.value) })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Header Announcement Banner Ticker
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Admissions open for Batch 2025-2026..."
                    value={portalSettings.announcementBanner || ''}
                    onChange={(e) => setPortalSettings({ ...portalSettings, announcementBanner: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* SECTION 2: OFFICIAL PAYMENT ACCOUNTS */}
              <div className="pt-4 border-t border-slate-800 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                    Official Payment Receiving Accounts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Students will see these account details with Copy buttons on the Payment verification page.
                  </p>
                </div>

                {/* 1. BANK TRANSFER */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Building className="w-4 h-4" />
                    <span>1. Bank Transfer (Meezan Bank)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={portalSettings.bankName || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Branch / Centre Label</label>
                      <input
                        type="text"
                        value={portalSettings.bankBranch || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, bankBranch: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Title</label>
                      <input
                        type="text"
                        value={portalSettings.bankTitle || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, bankTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={portalSettings.bankAccountNumber || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, bankAccountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={portalSettings.bankIban || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, bankIban: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. SADAPAY */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Smartphone className="w-4 h-4" />
                    <span>2. SadaPay Wallet</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={portalSettings.sadapayTitle || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, sadapayTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Payment Number</label>
                      <input
                        type="text"
                        value={portalSettings.sadapayNumber || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, sadapayNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. EASYPAISA */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                    <span>3. Easypaisa Wallet</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={portalSettings.easypaisaTitle || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, easypaisaTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Payment Number</label>
                      <input
                        type="text"
                        value={portalSettings.easypaisaNumber || ''}
                        onChange={(e) => setPortalSettings({ ...portalSettings, easypaisaNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save All Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REJECT CONFIRMATION MODAL */}
        {rejectModalStudent && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Reject Student Admission</h3>
                  <p className="text-xs text-slate-400">For {rejectModalStudent.fullName}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Rejection (Displayed to student)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STUDENT DETAILS & PROGRESS MODAL */}
        {detailsModalStudent && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">{detailsModalStudent.fullName}</h3>
                  <p className="text-xs text-slate-400">{detailsModalStudent.email}</p>
                </div>
                <button
                  onClick={() => setDetailsModalStudent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-slate-400 font-semibold">Phone Number</p>
                  <p className="text-white font-mono mt-0.5">{detailsModalStudent.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Class / Academic Stream</p>
                  <p className="text-cyan-300 font-medium mt-0.5">{detailsModalStudent.academicLevel}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Student / College ID</p>
                  <p className="text-white mt-0.5">{detailsModalStudent.studentId || 'None'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Approval Status</p>
                  <p className="text-amber-300 uppercase font-bold mt-0.5">{detailsModalStudent.status}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">Recorded Lecture Completion</h4>
                {loadingProgress ? (
                  <p className="text-xs text-slate-400">Loading progress data...</p>
                ) : studentProgressList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No completed lectures recorded for this student.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {studentProgressList.map((prog) => {
                      const lessonObj = lessons.find((l) => l.id === prog.lessonId);
                      return (
                        <div key={prog.lessonId} className="p-2 bg-slate-950 rounded-lg text-xs flex items-center justify-between">
                          <span className="text-slate-200 truncate">{lessonObj?.title || prog.lessonId}</span>
                          <span className="text-emerald-400 text-[10px] font-bold">Completed</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setDetailsModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COURSE CREATE / EDIT MODAL */}
        {courseModalOpen && editingCourse && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-white text-base">
                {editingCourse.id ? 'Edit Course' : 'Create New Course'}
              </h3>

              <form onSubmit={handleSaveCourse} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={editingCourse.subject || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, subject: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Academic Level</label>
                    <input
                      type="text"
                      value={editingCourse.academicLevel || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, academicLevel: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Instructor Name</label>
                    <input
                      type="text"
                      value={editingCourse.instructor || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Total Duration</label>
                    <input
                      type="text"
                      value={editingCourse.duration || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Thumbnail Image URL</label>
                  <input
                    type="url"
                    value={editingCourse.thumbnailUrl || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingCourse.description || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="coursePublished"
                    checked={editingCourse.isPublished ?? true}
                    onChange={(e) => setEditingCourse({ ...editingCourse, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <label htmlFor="coursePublished" className="text-slate-300 font-medium">
                    Publish Course (Visible in student catalog)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCourseModalOpen(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LESSON CREATE / EDIT MODAL */}
        {lessonModalOpen && editingLesson && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-white text-base">
                {editingLesson.id ? 'Edit Lecture' : 'Add New Lecture'}
              </h3>

              <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Course</label>
                  <select
                    value={editingLesson.courseId}
                    onChange={(e) => setEditingLesson({ ...editingLesson, courseId: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Chapter Heading</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 14: Magnetic Induction"
                      value={editingLesson.chapterTitle || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, chapterTitle: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Lecture Order #</label>
                    <input
                      type="number"
                      value={editingLesson.order || 1}
                      onChange={(e) => setEditingLesson({ ...editingLesson, order: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lecture Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lecture 1: Magnetic Flux & Faraday's Laws"
                    value={editingLesson.title || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Video Streaming URL</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/... or direct MP4 URL"
                    value={editingLesson.videoUrl || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Video Provider</label>
                    <select
                      value={editingLesson.videoProvider || 'youtube'}
                      onChange={(e) => setEditingLesson({ ...editingLesson, videoProvider: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="youtube">YouTube Embed / Unlisted</option>
                      <option value="vimeo">Vimeo Embed</option>
                      <option value="direct">Direct MP4 Video</option>
                      <option value="storage">Firebase Storage Protected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingLesson.durationMinutes || 30}
                      onChange={(e) => setEditingLesson({ ...editingLesson, durationMinutes: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <PdfUploadField
                  pdfNotesUrl={editingLesson.pdfNotesUrl}
                  pdfStoragePath={editingLesson.pdfStoragePath}
                  pdfFileName={editingLesson.pdfFileName}
                  pdfFileSize={editingLesson.pdfFileSize}
                  lessonId={editingLesson.id}
                  onChange={(meta) => setEditingLesson({ ...editingLesson, ...meta })}
                />

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Summary / Concept Notes</label>
                  <textarea
                    rows={2}
                    value={editingLesson.description || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="lessonPublished"
                    checked={editingLesson.isPublished ?? true}
                    onChange={(e) => setEditingLesson({ ...editingLesson, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <label htmlFor="lessonPublished" className="text-slate-300 font-medium">
                    Publish Lecture (Accessible by approved students)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLessonModalOpen(false);
                      setEditingLesson(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Lecture
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENT MODAL */}
        {announcementModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-white text-base">Publish Portal Circular</h3>

              <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Circular Title</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="normal">Normal Circular</option>
                    <option value="urgent">Urgent Board Alert</option>
                    <option value="info">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Announcement Content</label>
                  <textarea
                    rows={3}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBJECT MODAL */}
        {subjectModalOpen && editingSubject && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
              <h3 className="font-bold text-white text-base">
                {editingSubject.id ? 'Edit Subject' : 'Add New Subject'}
              </h3>

              <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Physics"
                      value={editingSubject.name || ''}
                      onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Subject Code</label>
                    <input
                      type="text"
                      placeholder="e.g. PHY-12"
                      value={editingSubject.code || ''}
                      onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Academic Level / Class</label>
                    <select
                      value={editingSubject.academicLevel || 'Class 12 / HSSC-II'}
                      onChange={(e) => setEditingSubject({ ...editingSubject, academicLevel: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Class 12 / HSSC-II">Class 12 / HSSC-II</option>
                      <option value="Class 11 / HSSC-I">Class 11 / HSSC-I</option>
                      <option value="Entry Test / NET">Entry Test / NET</option>
                      <option value="General Curriculum">General Curriculum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={editingSubject.order ?? 1}
                      onChange={(e) => setEditingSubject({ ...editingSubject, order: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Icon Representation</label>
                    <select
                      value={editingSubject.iconName || 'Atom'}
                      onChange={(e) => setEditingSubject({ ...editingSubject, iconName: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Atom">Atom (Physics / Science)</option>
                      <option value="FlaskConical">Flask (Chemistry)</option>
                      <option value="Calculator">Calculator (Mathematics)</option>
                      <option value="BookOpen">Book (English / Humanities)</option>
                      <option value="Cpu">CPU (Computer Science / IT)</option>
                      <option value="Building">Building (Architecture / Aptitude)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Accent Border Color</label>
                    <select
                      value={editingSubject.colorTheme || 'sky'}
                      onChange={(e) => setEditingSubject({ ...editingSubject, colorTheme: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="sky">Sky Cyan</option>
                      <option value="emerald">Emerald Green</option>
                      <option value="blue">Royal Blue</option>
                      <option value="amber">Amber Gold</option>
                      <option value="purple">Violet Purple</option>
                      <option value="rose">Rose Red</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Curriculum Scope / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of board topics and learning outcomes..."
                    value={editingSubject.description || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="subjectPublished"
                    checked={editingSubject.isPublished ?? true}
                    onChange={(e) => setEditingSubject({ ...editingSubject, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <label htmlFor="subjectPublished" className="text-slate-300 font-medium">
                    Publish Subject (Visible to students)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectModalOpen(false);
                      setEditingSubject(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Subject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CHAPTER MODAL */}
        {chapterModalOpen && editingChapter && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
              <h3 className="font-bold text-white text-base">
                {editingChapter.id ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>

              <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Subject</label>
                  <select
                    value={editingChapter.subjectId}
                    onChange={(e) => setEditingChapter({ ...editingChapter, subjectId: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {adminSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.academicLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Chapter Number</label>
                    <input
                      type="number"
                      value={editingChapter.chapterNumber ?? 1}
                      onChange={(e) => setEditingChapter({ ...editingChapter, chapterNumber: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={editingChapter.order ?? 1}
                      onChange={(e) => setEditingChapter({ ...editingChapter, order: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Chapter Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 1: Electrostatics"
                    value={editingChapter.title || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Chapter Description / Syllabus Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Concepts covered in this chapter..."
                    value={editingChapter.description || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="chapterPublished"
                    checked={editingChapter.isPublished ?? true}
                    onChange={(e) => setEditingChapter({ ...editingChapter, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <label htmlFor="chapterPublished" className="text-slate-300 font-medium">
                    Publish Chapter (Visible to students)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setChapterModalOpen(false);
                      setEditingChapter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Chapter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CURRICULUM LECTURE MODAL */}
        {curriculumLectureModalOpen && editingCurriculumLecture && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
              <h3 className="font-bold text-white text-base">
                {editingCurriculumLecture.id ? 'Edit Curriculum Lecture' : 'Add New Curriculum Lecture'}
              </h3>

              <form onSubmit={handleSaveCurriculumLecture} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Subject</label>
                    <select
                      value={editingCurriculumLecture.subjectId || adminSubjects[0]?.id || ''}
                      onChange={(e) => {
                        const newSubjId = e.target.value;
                        const chapsInNewSubj = adminChapters.filter((c) => c.subjectId === newSubjId);
                        setEditingCurriculumLecture({
                          ...editingCurriculumLecture,
                          subjectId: newSubjId,
                          chapterId: chapsInNewSubj[0]?.id || '',
                        });
                      }}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      {adminSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Chapter</label>
                    <select
                      value={editingCurriculumLecture.chapterId || ''}
                      onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, chapterId: e.target.value })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      {adminChapters
                        .filter((c) => c.subjectId === (editingCurriculumLecture.subjectId || adminSubjects[0]?.id))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lecture Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lecture 1: Electric Charge & Quantization"
                    value={editingCurriculumLecture.title || ''}
                    onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, title: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Video Stream URL</label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/..."
                      value={editingCurriculumLecture.videoUrl || ''}
                      onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, videoUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Leave blank if lecture is scheduled/in production.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingCurriculumLecture.durationMinutes ?? 30}
                      onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, durationMinutes: Number(e.target.value) })}
                      required
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lecture Order #</label>
                  <input
                    type="number"
                    value={editingCurriculumLecture.order ?? 1}
                    onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, order: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <PdfUploadField
                    pdfNotesUrl={editingCurriculumLecture.pdfNotesUrl}
                    pdfStoragePath={editingCurriculumLecture.pdfStoragePath}
                    pdfFileName={editingCurriculumLecture.pdfFileName}
                    pdfFileSize={editingCurriculumLecture.pdfFileSize}
                    lessonId={editingCurriculumLecture.id}
                    onChange={(meta) => setEditingCurriculumLecture({ ...editingCurriculumLecture, ...meta })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Concept Summary / Board Objectives</label>
                  <textarea
                    rows={3}
                    placeholder="Key concepts discussed in this lecture..."
                    value={editingCurriculumLecture.description || ''}
                    onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="curriculumLecturePublished"
                    checked={editingCurriculumLecture.isPublished ?? true}
                    onChange={(e) => setEditingCurriculumLecture({ ...editingCurriculumLecture, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <label htmlFor="curriculumLecturePublished" className="text-slate-300 font-medium">
                    Publish Lecture (Accessible by active members)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurriculumLectureModalOpen(false);
                      setEditingCurriculumLecture(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Lecture
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
