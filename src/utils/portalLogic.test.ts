import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStudentRegistration,
  canAccessCurriculum,
  isMembershipActive,
  canAccessPaidLessons,
  calculateMembershipExpiry,
  validatePaymentSubmission,
  findDuplicateTransaction,
  computeCourseProgress,
  getNextLesson,
  filterStudents,
  type StudentListItem,
} from './portalLogic.ts';

test('validateStudentRegistration flags invalid inputs', () => {
  const result = validateStudentRegistration({
    fullName: '',
    email: 'notanemail',
    phoneNumber: '123',
    academicLevel: '',
    password: '123',
    confirmPassword: '456',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phoneNumber);
  assert.ok(result.errors.academicLevel);
  assert.ok(result.errors.password);
  assert.ok(result.errors.confirmPassword);
});

test('validateStudentRegistration succeeds with valid Pakistani credentials', () => {
  const result = validateStudentRegistration({
    fullName: 'Hamza Tariq',
    email: 'hamza.tariq@gmail.com',
    phoneNumber: '0301-2345678',
    academicLevel: 'FSc Part 2 (Pre-Engineering)',
    password: 'SafePassword123',
    confirmPassword: 'SafePassword123',
  });

  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('isMembershipActive checks membership status and expiry date correctly', () => {
  const now = Date.now();
  const future = new Date(now + 86400000 * 30).toISOString();
  const past = new Date(now - 86400000 * 5).toISOString();

  assert.equal(isMembershipActive('active', future, now), true);
  assert.equal(isMembershipActive('active', past, now), false);
  assert.equal(isMembershipActive('unpaid', future, now), false);
  assert.equal(isMembershipActive('pending', future, now), false);
  assert.equal(isMembershipActive('expired', future, now), false);
  assert.equal(isMembershipActive('active', null, now), false);
});

test('canAccessPaidLessons enforces both account approval and active membership', () => {
  const now = Date.now();
  const future = new Date(now + 86400000 * 100).toISOString();
  const past = new Date(now - 86400000 * 10).toISOString();

  // Admin always has access
  assert.equal(canAccessPaidLessons('admin', 'pending', 'unpaid', null, now), true);

  // Approved student with active membership in future
  assert.equal(canAccessPaidLessons('student', 'approved', 'active', future, now), true);

  // Approved student with expired membership
  assert.equal(canAccessPaidLessons('student', 'approved', 'active', past, now), false);

  // Approved student with unpaid/pending membership
  assert.equal(canAccessPaidLessons('student', 'approved', 'unpaid', null, now), false);
  assert.equal(canAccessPaidLessons('student', 'approved', 'pending', null, now), false);

  // Pending student even if membership was active (e.g. account suspended)
  assert.equal(canAccessPaidLessons('student', 'pending', 'active', future, now), false);
  assert.equal(canAccessPaidLessons('student', 'suspended', 'active', future, now), false);
});

test('calculateMembershipExpiry handles new activations and seamless renewals', () => {
  const now = new Date('2026-01-01T00:00:00.000Z').getTime();

  // Fresh activation: now + 365 days -> 2027-01-01
  const freshExpiry = calculateMembershipExpiry(null, 365, now);
  assert.equal(freshExpiry, new Date('2027-01-01T00:00:00.000Z').toISOString());

  // Renewal while active: existing expiry is 2026-06-01 (151 days in future) -> extends to 2027-06-01
  const futureExpiry = new Date('2026-06-01T00:00:00.000Z').toISOString();
  const renewedExpiry = calculateMembershipExpiry(futureExpiry, 365, now);
  assert.equal(renewedExpiry, new Date('2027-06-01T00:00:00.000Z').toISOString());

  // Renewal after already expired: expired on 2025-12-01 -> starts from now (2026-01-01) -> 2027-01-01
  const pastExpiry = new Date('2025-12-01T00:00:00.000Z').toISOString();
  const expiredRenewed = calculateMembershipExpiry(pastExpiry, 365, now);
  assert.equal(expiredRenewed, new Date('2027-01-01T00:00:00.000Z').toISOString());
});

test('validatePaymentSubmission validates payment inputs', () => {
  const invalid = validatePaymentSubmission({
    paymentMethod: 'invalid_method',
    transactionReference: '',
    receiptUrl: '',
    amount: 0,
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.paymentMethod);
  assert.ok(invalid.errors.transactionReference);
  assert.ok(invalid.errors.receiptUrl);
  assert.ok(invalid.errors.amount);

  const valid = validatePaymentSubmission({
    paymentMethod: 'easypaisa',
    transactionReference: 'TRX-98234120',
    receiptUrl: 'data:image/png;base64,samplebase64string',
    amount: 1000,
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('findDuplicateTransaction detects duplicate transaction references', () => {
  const existing = ['TRX-12345', 'EP-998877', 'JC-554433'];
  assert.equal(findDuplicateTransaction(existing, 'trx-12345'), true);
  assert.equal(findDuplicateTransaction(existing, '  EP-998877  '), true);
  assert.equal(findDuplicateTransaction(existing, 'NEW-UNIQUE-TRX'), false);
});

test('computeCourseProgress computes percentage accurately', () => {
  const courseLessons = ['l1', 'l2', 'l3', 'l4'];
  const progressEmpty = computeCourseProgress(courseLessons, []);
  assert.equal(progressEmpty.percentage, 0);
  assert.equal(progressEmpty.isCompleted, false);

  const progressHalf = computeCourseProgress(courseLessons, ['l1', 'l3']);
  assert.equal(progressHalf.percentage, 50);
  assert.equal(progressHalf.completedCount, 2);
  assert.equal(progressHalf.isCompleted, false);

  const progressFull = computeCourseProgress(courseLessons, ['l1', 'l2', 'l3', 'l4']);
  assert.equal(progressFull.percentage, 100);
  assert.equal(progressFull.isCompleted, true);
});

test('getNextLesson returns the next uncompleted lesson', () => {
  const lessons = [
    { id: 'l1', order: 1, courseId: 'c1', title: 'Intro' },
    { id: 'l2', order: 2, courseId: 'c1', title: 'Chapter 1' },
    { id: 'l3', order: 3, courseId: 'c1', title: 'Chapter 2' },
  ];

  const next1 = getNextLesson(lessons, []);
  assert.equal(next1?.id, 'l1');

  const next2 = getNextLesson(lessons, ['l1']);
  assert.equal(next2?.id, 'l2');

  const nextAllDone = getNextLesson(lessons, ['l1', 'l2', 'l3']);
  assert.equal(nextAllDone?.id, 'l1');
});

test('filterStudents filters by search query and approval status', () => {
  const list: StudentListItem[] = [
    {
      uid: 'u1',
      fullName: 'Ahmed Ali',
      email: 'ahmed@gmail.com',
      phoneNumber: '03001112233',
      academicLevel: 'Class 11',
      status: 'pending',
      role: 'student',
    },
    {
      uid: 'u2',
      fullName: 'Sara Khan',
      email: 'sara@gmail.com',
      phoneNumber: '03215556677',
      academicLevel: 'Class 12',
      status: 'approved',
      role: 'student',
    },
    {
      uid: 'u3',
      fullName: 'Bilal Hassan',
      email: 'bilal@gmail.com',
      phoneNumber: '03459998877',
      academicLevel: 'Class 11',
      status: 'rejected',
      role: 'student',
    },
  ];

  const pending = filterStudents(list, '', 'pending', 'all');
  assert.equal(pending.length, 1);
  assert.equal(pending[0].fullName, 'Ahmed Ali');

  const searchSara = filterStudents(list, 'sara', 'all', 'all');
  assert.equal(searchSara.length, 1);
  assert.equal(searchSara[0].fullName, 'Sara Khan');

  const class11 = filterStudents(list, '', 'all', 'Class 11');
  assert.equal(class11.length, 2);
});
