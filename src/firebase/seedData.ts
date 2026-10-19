import { db } from './config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Course, Lesson, SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  portalName: 'Meraj Learning Portal',
  supportPhone: '+92 300 1234567',
  supportEmail: 'support@merajlearning.pk',
  announcementBanner: '📢 Mid-Term Exam Series & MDCAT Mock Tests commencing from next Monday. Ensure all pending chapters are completed!',
  allowPublicRegistration: true,
  annualMembershipFee: 1000,
  membershipDurationDays: 365,
  easypaisaTitle: 'Meraj Educational Portal',
  easypaisaNumber: '0300-1234567',
  jazzcashTitle: 'Meraj Educational Portal',
  jazzcashNumber: '0301-7654321',
  bankName: 'Meezan Bank Limited',
  bankTitle: 'Meraj Learning Academy',
  bankIban: 'PK36MEZN0001234567890123',
  paymentInstructions: 'Send Rs. 1,000 via Easypaisa, JazzCash, or online bank transfer. After sending, upload a clear screenshot of the payment receipt and enter the Transaction ID / TRX ID below. Our administration verifies payments and activates your 365-day membership.',
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-phy-12',
    title: 'Physics Class 12: Electromagnetism & Alternating Current',
    subject: 'Physics',
    academicLevel: 'FSc Part 2 (Class 12)',
    instructor: 'Prof. Tariq Mehmood (M.Phil Physics, 18+ Yrs Exp)',
    description: 'Comprehensive lecture series covering Electromagnetism, Magnetic Induction, Alternating Currents, and Modern Physics according to Punjab, Federal & Sindh Board curricula.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    totalLessons: 4,
    duration: '18 Hours',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-math-12',
    title: 'Mathematics Class 12: Calculus & Analytical Geometry',
    subject: 'Mathematics',
    academicLevel: 'FSc Part 2 (Class 12)',
    instructor: 'Dr. Salman Rashid (Gold Medalist, PU)',
    description: 'Deep conceptual breakdown of Function Limits, Differentiation, Integration techniques, and Conic Sections with past-paper board problem solving.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    totalLessons: 3,
    duration: '22 Hours',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-chem-12',
    title: 'Chemistry Class 12: Advanced Organic Chemistry',
    subject: 'Chemistry',
    academicLevel: 'FSc Part 2 (Class 12)',
    instructor: 'Madam Ayesha Qureshi (Senior Faculty)',
    description: 'Master reaction mechanisms, hydrocarbons, alkyl halides, aromatic compounds, and biomolecules with step-by-step structural formulas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    totalLessons: 3,
    duration: '16 Hours',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-phy-11',
    title: 'Physics Class 11: Mechanics, Vectors & Work Energy',
    subject: 'Physics',
    academicLevel: 'FSc Part 1 (Class 11)',
    instructor: 'Sir Meraj Alam (Senior Educator)',
    description: 'Clear intuitive explanations of physical quantities, vectors, projectile motion, work energy theorem, and circular dynamics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    isPublished: true,
    totalLessons: 2,
    duration: '14 Hours',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-phy-12-1',
    courseId: 'course-phy-12',
    chapterTitle: 'Chapter 14: Magnetic Induction',
    title: 'Lecture 1: Magnetic Flux & Faraday’s Laws of Electromagnetic Induction',
    description: 'Introduction to magnetic flux definition, dot product interpretation, and experimental verification of Faraday’s Law of induced electromotive force (EMF).',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 28,
    order: 1,
    pdfNotesUrl: 'https://portal.physikomatics.com/demo-notes-ch14.pdf',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-phy-12-2',
    courseId: 'course-phy-12',
    chapterTitle: 'Chapter 14: Magnetic Induction',
    title: 'Lecture 2: Lenz’s Law and Direction of Induced Current',
    description: 'Physical understanding of Lenz’s law as conservation of energy, right-hand grip rule, and problem walkthrough for board exams.',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 34,
    order: 2,
    pdfNotesUrl: 'https://portal.physikomatics.com/demo-notes-ch14-part2.pdf',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-phy-12-3',
    courseId: 'course-phy-12',
    chapterTitle: 'Chapter 14: Magnetic Induction',
    title: 'Lecture 3: Mutual Induction & Self-Induction Mechanisms',
    description: 'Detailed analysis of transformer action, coefficient of mutual induction, Henry unit definition, and back-emf in motors.',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 38,
    order: 3,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-phy-12-4',
    courseId: 'course-phy-12',
    chapterTitle: 'Chapter 15: Alternating Current',
    title: 'Lecture 4: AC Circuits, Peak vs RMS Values, and Phase Lag',
    description: 'Sinusoidal alternating voltage generation, phase lead and lag in resistive, capacitive and inductive circuits.',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 42,
    order: 4,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-math-12-1',
    courseId: 'course-math-12',
    chapterTitle: 'Chapter 1: Functions and Limits',
    title: 'Lecture 1: Evaluation of Algebraic Limits & The Squeeze Theorem',
    description: 'Standard limits proofs including limit as theta approaches 0 of sin(theta)/theta = 1 and algebraic factorization techniques.',
    videoUrl: 'https://www.youtube.com/embed/7K1g52u0Wio',
    videoProvider: 'youtube',
    durationMinutes: 36,
    order: 1,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-math-12-2',
    courseId: 'course-math-12',
    chapterTitle: 'Chapter 2: Differentiation',
    title: 'Lecture 2: Derivatives from First Principle (ab-initio method)',
    description: 'Step-by-step 4-step algorithm for finding derivatives of polynomials, trigonometric and exponential functions from scratch.',
    videoUrl: 'https://www.youtube.com/embed/7K1g52u0Wio',
    videoProvider: 'youtube',
    durationMinutes: 44,
    order: 2,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-chem-12-1',
    courseId: 'course-chem-12',
    chapterTitle: 'Chapter 7: Fundamental Principles of Organic Chemistry',
    title: 'Lecture 1: Hybridization of Carbon (sp3, sp2, sp) & Bond Angles',
    description: 'Tetrahedral geometry in methane, planar shape of ethene, and triple-bond overlap in ethyne with orbital diagrams.',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 30,
    order: 1,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-phy-11-1',
    courseId: 'course-phy-11',
    chapterTitle: 'Chapter 2: Vectors & Equilibrium',
    title: 'Lecture 1: Addition of Vectors by Rectangular Components',
    description: 'Resolving vectors into orthogonal components (Ax, Ay) and determining magnitude and direction of resultant vector in all four quadrants.',
    videoUrl: 'https://www.youtube.com/embed/gQyqM2wW-gU',
    videoProvider: 'youtube',
    durationMinutes: 35,
    order: 1,
    pdfNotesUrl: '',
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
];

export async function seedInitialPortalDataIfEmpty(): Promise<void> {
  try {
    const coursesSnap = await getDocs(collection(db, 'courses'));
    if (coursesSnap.empty) {
      console.log('Seeding initial curriculum courses & lessons...');
      for (const course of INITIAL_COURSES) {
        await setDoc(doc(db, 'courses', course.id), course);
      }
      for (const lesson of INITIAL_LESSONS) {
        await setDoc(doc(db, 'lessons', lesson.id), lesson);
      }
      await setDoc(doc(db, 'siteSettings', 'portal'), INITIAL_SETTINGS);
      console.log('Curriculum seeded successfully.');
    }
  } catch (error) {
    console.warn('Initial seeding skipped (permission or already populated):', error);
  }
}
