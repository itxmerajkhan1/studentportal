import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Course, Lesson, LessonProgress, Announcement, SiteSettings, PaymentRequest, MembershipStatus, Subject, Chapter } from '../types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const DESIGNATED_ADMIN_EMAIL = 'itxmerajkhan3109@gmail.com';

// Test connection on boot per Firebase guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Operations
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserRecord(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserStatus(
  uid: string,
  status: 'pending' | 'approved' | 'rejected' | 'suspended',
  rejectionReason?: string
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const payload: Partial<UserProfile> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (rejectionReason !== undefined) {
      payload.rejectionReason = rejectionReason;
    }
    await updateDoc(doc(db, 'users', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserRole(uid: string, role: 'student' | 'admin'): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: new Date().toISOString(),
    });
    if (role === 'admin') {
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email: auth.currentUser?.email || '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Check / ensure admin document exists for designated admin
export async function bootstrapAdminDocument(user: User): Promise<void> {
  if (user.email === DESIGNATED_ADMIN_EMAIL) {
    try {
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Ignore if rules or existing record
    }
  }
}

// Verify if a user UID has an administrator record in Firestore
export async function checkIsAdminInFirestore(uid: string): Promise<boolean> {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      return true;
    }
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists() && userDoc.data()?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn('Admin Firestore check notice:', err);
  }
  return false;
}

// Course Operations
export async function fetchPublishedCourses(): Promise<Course[]> {
  const path = 'courses';
  try {
    const q = query(collection(db, 'courses'), where('isPublished', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllCoursesAdmin(): Promise<Course[]> {
  const path = 'courses';
  try {
    const snap = await getDocs(collection(db, 'courses'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveCourse(course: Omit<Course, 'id'> & { id?: string }): Promise<string> {
  const courseId = course.id || `course_${Date.now()}`;
  const path = `courses/${courseId}`;
  try {
    const payload = {
      ...course,
      id: courseId,
      updatedAt: new Date().toISOString(),
      createdAt: course.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'courses', courseId), payload);
    return courseId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCourseDoc(courseId: string): Promise<void> {
  const path = `courses/${courseId}`;
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subject Operations
export async function fetchSubjects(publishedOnly = false): Promise<Subject[]> {
  const path = 'subjects';
  try {
    let q = query(collection(db, 'subjects'));
    if (publishedOnly) {
      q = query(collection(db, 'subjects'), where('isPublished', '==', true));
    }
    const snap = await getDocs(q);
    const subjects = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subject, 'id'>) }));
    return subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveSubject(subject: Omit<Subject, 'id'> & { id?: string }): Promise<string> {
  const subjectId = subject.id || `subj_${Date.now()}`;
  const path = `subjects/${subjectId}`;
  try {
    const payload = {
      ...subject,
      id: subjectId,
      updatedAt: new Date().toISOString(),
      createdAt: subject.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'subjects', subjectId), payload);
    return subjectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSubjectDoc(subjectId: string): Promise<void> {
  const path = `subjects/${subjectId}`;
  try {
    await deleteDoc(doc(db, 'subjects', subjectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Chapter Operations
export async function fetchChapters(subjectId?: string, publishedOnly = false): Promise<Chapter[]> {
  const path = 'chapters';
  try {
    let q = query(collection(db, 'chapters'));
    if (subjectId && publishedOnly) {
      q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId), where('isPublished', '==', true));
    } else if (subjectId) {
      q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId));
    } else if (publishedOnly) {
      q = query(collection(db, 'chapters'), where('isPublished', '==', true));
    }
    const snap = await getDocs(q);
    const chapters = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chapter, 'id'>) }));
    return chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveChapter(chapter: Omit<Chapter, 'id'> & { id?: string }): Promise<string> {
  const chapterId = chapter.id || `chap_${Date.now()}`;
  const path = `chapters/${chapterId}`;
  try {
    const payload = {
      ...chapter,
      id: chapterId,
      updatedAt: new Date().toISOString(),
      createdAt: chapter.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'chapters', chapterId), payload);
    return chapterId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteChapterDoc(chapterId: string): Promise<void> {
  const path = `chapters/${chapterId}`;
  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Lesson Operations
export async function fetchLessonsForCourse(courseId: string): Promise<Lesson[]> {
  const path = 'lessons';
  try {
    const q = query(
      collection(db, 'lessons'),
      where('courseId', '==', courseId),
      where('isPublished', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Lesson, 'id'>) }))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchLessonById(lessonId: string): Promise<Lesson | null> {
  const path = `lessons/${lessonId}`;
  try {
    const snap = await getDoc(doc(db, 'lessons', lessonId));
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Lesson, 'id'>) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveLesson(lesson: Omit<Lesson, 'id'> & { id?: string }): Promise<string> {
  const lessonId = lesson.id || `lesson_${Date.now()}`;
  const path = `lessons/${lessonId}`;
  try {
    const payload = {
      ...lesson,
      id: lessonId,
      createdAt: lesson.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'lessons', lessonId), payload);
    return lessonId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLessonDoc(lessonId: string): Promise<void> {
  const path = `lessons/${lessonId}`;
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Progress Operations
export async function saveLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean,
  lastWatchedSeconds = 0,
  subjectId?: string,
  chapterId?: string
): Promise<void> {
  const path = `users/${userId}/progress/${lessonId}`;
  try {
    const payload: LessonProgress = {
      userId,
      courseId,
      lessonId,
      completed,
      lastWatchedSeconds,
      ...(subjectId ? { subjectId } : {}),
      ...(chapterId ? { chapterId } : {}),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'progress', lessonId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProgress(userId: string): Promise<LessonProgress[]> {
  const path = `users/${userId}/progress`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'progress'));
    return snap.docs.map((d) => d.data() as LessonProgress);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Announcements & Site Settings
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const path = 'announcements';
  try {
    const q = query(collection(db, 'announcements'), where('isActive', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveAnnouncementDoc(announcement: Omit<Announcement, 'id'> & { id?: string }): Promise<string> {
  const id = announcement.id || `announcement_${Date.now()}`;
  const path = `announcements/${id}`;
  try {
    await setDoc(doc(db, 'announcements', id), { ...announcement, id });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const path = 'siteSettings/portal';
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'portal'));
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = 'siteSettings/portal';
  try {
    await setDoc(doc(db, 'siteSettings', 'portal'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Payment Requests Operations
export async function submitPaymentRequest(
  request: Omit<PaymentRequest, 'id'>
): Promise<string> {
  const reqId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `paymentRequests/${reqId}`;
  try {
    const payload: PaymentRequest = {
      ...request,
      id: reqId,
      status: 'pending',
      submittedAt: request.submittedAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'paymentRequests', reqId), payload);
    return reqId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchStudentPaymentRequests(studentUid: string): Promise<PaymentRequest[]> {
  const path = 'paymentRequests';
  try {
    const q = query(collection(db, 'paymentRequests'), where('studentUid', '==', studentUid));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRequest, 'id'>) }));
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllPaymentRequestsAdmin(): Promise<PaymentRequest[]> {
  const path = 'paymentRequests';
  try {
    const snap = await getDocs(collection(db, 'paymentRequests'));
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRequest, 'id'>) }));
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function approvePaymentRequest(
  requestId: string,
  studentUid: string,
  reviewerEmail: string,
  durationDays = 365
): Promise<void> {
  const payPath = `paymentRequests/${requestId}`;
  const userPath = `users/${studentUid}`;
  try {
    const now = new Date().toISOString();
    let currentExpiresAt: string | null = null;
    const userDoc = await getDoc(doc(db, 'users', studentUid));
    if (userDoc.exists()) {
      const uData = userDoc.data() as UserProfile;
      currentExpiresAt = uData.membershipExpiresAt || null;
    }

    let baseTime = Date.now();
    if (currentExpiresAt) {
      const existingTime = new Date(currentExpiresAt).getTime();
      if (!isNaN(existingTime) && existingTime > baseTime) {
        baseTime = existingTime;
      }
    }
    const newExpiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await updateDoc(doc(db, 'paymentRequests', requestId), {
      status: 'approved',
      reviewedAt: now,
      reviewedBy: reviewerEmail,
    });

    await updateDoc(doc(db, 'users', studentUid), {
      membershipStatus: 'active',
      membershipExpiresAt: newExpiresAt,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${payPath} & ${userPath}`);
  }
}

export async function rejectPaymentRequest(
  requestId: string,
  studentUid: string,
  rejectionReason: string,
  reviewerEmail: string
): Promise<void> {
  const payPath = `paymentRequests/${requestId}`;
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'paymentRequests', requestId), {
      status: 'rejected',
      rejectionReason,
      reviewedAt: now,
      reviewedBy: reviewerEmail,
    });

    try {
      await updateDoc(doc(db, 'users', studentUid), {
        membershipStatus: 'unpaid',
        updatedAt: now,
      });
    } catch {
      // Ignored if user doc not directly updatable
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, payPath);
  }
}

export async function manuallySetStudentMembership(
  studentUid: string,
  status: MembershipStatus,
  expiresAt: string | null
): Promise<void> {
  const userPath = `users/${studentUid}`;
  try {
    await updateDoc(doc(db, 'users', studentUid), {
      membershipStatus: status,
      membershipExpiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
};
