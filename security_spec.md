# Security Specification: Meraj Learning Portal

## 1. Data Invariants
1. **User Identity & Role Immutability**: A user cannot assign themselves the 'admin' role or change their 'status' from 'pending' to 'approved'.
2. **Approval Gate for Protected Curriculum**: Unapproved (pending, rejected, or suspended) users must be blocked by Firestore security rules from accessing full lesson content and video playback data.
3. **Owner-Scoped Progress**: A student can only view and update their own lesson progress documents under `/users/{userId}/progress/{lessonId}`.
4. **Admin Privileges**: Only authorized administrators (verified against `/admins/{uid}` or the bootstrapped verified admin `itxmerajkhan3109@gmail.com`) can approve/reject students, create or edit courses, publish lessons, and modify portal settings.
5. **No Orphaned Submissions**: Lesson documents must reference valid courses, and progress records must tie directly to the authenticated user ID.

## 2. The "Dirty Dozen" Payloads (Adversarial Test Cases)
1. **Self-Approval Attack**: Student attempts to register with `status: "approved"` directly in `/users/{uid}`. -> REJECTED.
2. **Privilege Escalation**: Student attempts to set `role: "admin"` during registration or update. -> REJECTED.
3. **Status Hijack**: Pending student sends an update with `status: "approved"` to bypass admin moderation. -> REJECTED.
4. **PII Snooping**: Unauthenticated or unauthorized user attempts to read another student's profile at `/users/{otherId}`. -> REJECTED.
5. **Progress Spoofing**: User A attempts to write progress data under `/users/{userB}/progress/{lesson1}`. -> REJECTED.
6. **Unpublished Course Leak**: Non-admin student attempts to read an unpublished draft course (`isPublished: false`). -> REJECTED.
7. **Unapproved Lesson Access**: A student with status "pending" attempts to fetch lesson details with video URLs. -> REJECTED.
8. **Unauthorized Course Deletion**: Authenticated non-admin user attempts to delete a course. -> REJECTED.
9. **Announcement Defacement**: Student attempts to create or edit announcements in `/announcements`. -> REJECTED.
10. **Portal Settings Tampering**: Non-admin attempts to overwrite `/siteSettings/portal`. -> REJECTED.
11. **Malicious ID Length Attack**: Sending a 2KB string as document ID to cause denial of wallet. -> REJECTED by `isValidId()`.
12. **Ghost Field Injection**: Attempting to inject unexpected fields (e.g. `isSuperAdmin: true`) into user doc. -> REJECTED by key constraints.
