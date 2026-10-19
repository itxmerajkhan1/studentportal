import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  auth,
  fetchUserProfile,
  createUserRecord,
  bootstrapAdminDocument,
  DESIGNATED_ADMIN_EMAIL,
} from '../firebase/config';
import { UserProfile, ApprovalStatus, MembershipStatus } from '../types';
import { isMembershipActive } from '../utils/portalLogic';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isSuspended: boolean;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
  hasActiveMembership: boolean;
  membershipDaysRemaining: number;
  registerStudent: (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    academicLevel: string;
    studentId?: string;
  }) => Promise<void>;
  loginStudent: (email: string, pass: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async (currentUser: User) => {
    try {
      // If designated admin, ensure admin bootstrap
      if (currentUser.email === DESIGNATED_ADMIN_EMAIL) {
        await bootstrapAdminDocument(currentUser);
      }

      const p = await fetchUserProfile(currentUser.uid);
      if (p) {
        setProfile(p);
      } else {
        // If profile doesn't exist yet (e.g. Google Sign-In first time)
        const isDesignatedAdmin = currentUser.email === DESIGNATED_ADMIN_EMAIL;
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          fullName: currentUser.displayName || (isDesignatedAdmin ? 'Meraj Khan (Administrator)' : 'Registered Student'),
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '0300-0000000',
          academicLevel: isDesignatedAdmin ? 'Super Administrator' : 'FSc Part 2 (Pre-Engineering)',
          role: isDesignatedAdmin ? 'admin' : 'student',
          status: isDesignatedAdmin ? 'approved' : 'pending',
          registeredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await createUserRecord(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      // Fallback if designated admin
      if (currentUser.email === DESIGNATED_ADMIN_EMAIL) {
        setProfile({
          uid: currentUser.uid,
          fullName: 'Meraj Khan (Administrator)',
          email: currentUser.email,
          phoneNumber: '+92 300 1234567',
          academicLevel: 'Super Administrator',
          role: 'admin',
          status: 'approved',
        });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await loadProfile(auth.currentUser);
    }
  };

  const registerStudent = async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    academicLevel: string;
    studentId?: string;
  }) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Student registration always assigns role: "student" and status: "pending"
      // Admin privileges cannot be acquired through public registration form
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        academicLevel: data.academicLevel,
        studentId: data.studentId || '',
        role: 'student',
        status: 'pending',
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createUserRecord(newProfile);
      setProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await loadProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await loadProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.email === DESIGNATED_ADMIN_EMAIL) return true;
    return profile?.role === 'admin';
  }, [user, profile]);

  const isApproved = useMemo(() => {
    if (isAdmin) return true;
    return profile?.status === 'approved';
  }, [isAdmin, profile]);

  const isPending = useMemo(() => {
    if (isAdmin) return false;
    return profile?.status === 'pending';
  }, [isAdmin, profile]);

  const isRejected = useMemo(() => {
    return !isAdmin && profile?.status === 'rejected';
  }, [isAdmin, profile]);

  const isSuspended = useMemo(() => {
    return !isAdmin && profile?.status === 'suspended';
  }, [isAdmin, profile]);

  const membershipStatus = useMemo<MembershipStatus>(() => {
    if (isAdmin) return 'active';
    if (!profile) return 'unpaid';
    if (profile.membershipStatus === 'active') {
      const active = isMembershipActive(profile.membershipStatus, profile.membershipExpiresAt);
      return active ? 'active' : 'expired';
    }
    return profile.membershipStatus || 'unpaid';
  }, [isAdmin, profile]);

  const membershipExpiresAt = useMemo(() => {
    if (isAdmin) return null;
    return profile?.membershipExpiresAt || null;
  }, [isAdmin, profile]);

  const hasActiveMembership = useMemo(() => {
    if (isAdmin) return true;
    if (profile?.status !== 'approved') return false;
    return isMembershipActive(profile?.membershipStatus, profile?.membershipExpiresAt);
  }, [isAdmin, profile]);

  const membershipDaysRemaining = useMemo(() => {
    if (isAdmin) return 365;
    if (!profile?.membershipExpiresAt) return 0;
    const diff = new Date(profile.membershipExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [isAdmin, profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isApproved,
        isPending,
        isRejected,
        isSuspended,
        membershipStatus,
        membershipExpiresAt,
        hasActiveMembership,
        membershipDaysRemaining,
        registerStudent,
        loginStudent,
        loginGoogle,
        logoutUser,
        requestPasswordReset,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
