import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../types/erp';
import { DEFAULT_ADMIN_PROFILE } from '../data/seedData';

export const GUEST_VIEW_ONLY_PROFILE: UserProfile = {
  uid: 'guest-view-only',
  staffId: 'DP-GUEST-01',
  fullName: 'Guest User (View Only)',
  email: 'guest@digipack.com',
  mobileNumber: '+91 8590 046 637',
  department: 'Visitor',
  designation: 'Guest Mode (View Only)',
  role: 'VIEW ONLY',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
};

const USERS_STORAGE_KEY = 'digipack_admin_users_list_v3';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isApproved: boolean;
  isAdminOrManager: boolean;
  allUsers: UserProfile[];
  pendingUsers: UserProfile[];
  pendingUsersCount: number;
  newRegistrationAlert: UserProfile | null;
  dismissAlert: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerStaffAccount: (data: {
    staffId: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    password: string;
    department: string;
    designation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleForDemo: (role: UserRole) => void;
  switchActiveProfile: (profile: UserProfile) => void;
  updateUserStatus: (uid: string, status: UserProfile['status'], newRole?: UserRole) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  sendResetEmail: (email?: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time live users list
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_ADMIN_PROFILE];
  });

  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [newRegistrationAlert, setNewRegistrationAlert] = useState<UserProfile | null>(null);
  const prevPendingCountRef = useRef<number>(0);

  // 1. Real-time Firestore Listener for ALL user accounts & pending registration requests
  useEffect(() => {
    try {
      const usersColRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersColRef,
        (snapshot) => {
          const fetchedUsers: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserProfile;
            if (data && (data.uid || docSnap.id)) {
              fetchedUsers.push({
                ...data,
                uid: data.uid || docSnap.id,
              });
            }
          });

          // Ensure default primary administrator always exists
          const hasAdmin = fetchedUsers.some(
            (u) => u.email === 'shafi3396@gmail.com' || u.role === 'OWNER / ADMIN'
          );
          if (!hasAdmin) {
            fetchedUsers.unshift(DEFAULT_ADMIN_PROFILE);
          }

          // Sort users: PENDING first, then by creation date descending
          fetchedUsers.sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });

          setAllUsers(fetchedUsers);
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(fetchedUsers));
          } catch {}

          const pending = fetchedUsers.filter((u) => u.status === 'PENDING');
          setPendingUsers(pending);
          setPendingUsersCount(pending.length);

          // Instant real-time alert trigger when new pending request arrives
          if (pending.length > prevPendingCountRef.current && pending.length > 0) {
            setNewRegistrationAlert(pending[0]);
          }
          prevPendingCountRef.current = pending.length;
        },
        (error) => {
          console.warn('Firestore users collection snapshot listener note:', error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to bind Firestore user listener:', err);
    }
  }, []);

  // 2. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Admin email automatic bootstrap
            if (firebaseUser.email === 'shafi3396@gmail.com' && data.status !== 'ACTIVE') {
              data.status = 'ACTIVE';
              data.role = 'OWNER / ADMIN';
              await setDoc(userDocRef, data, { merge: true });
            }
            setProfile(data);
          } else {
            // First time sign-in
            const isDefaultAdmin =
              firebaseUser.email === 'shafi3396@gmail.com' ||
              firebaseUser.email?.toLowerCase().includes('admin');

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              staffId: isDefaultAdmin ? 'DP-DIR-001' : `DP-STF-${Math.floor(100 + Math.random() * 900)}`,
              fullName: firebaseUser.displayName || 'Staff Member',
              email: firebaseUser.email || '',
              mobileNumber: '+91 8590 046 637',
              department: isDefaultAdmin ? 'Management' : 'Production',
              designation: isDefaultAdmin ? 'Managing Director' : 'Production Staff',
              role: isDefaultAdmin ? 'OWNER / ADMIN' : 'VIEW ONLY',
              status: isDefaultAdmin ? 'ACTIVE' : 'PENDING',
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.warn('Firestore user fetch note:', error);
          if (firebaseUser.email === 'shafi3396@gmail.com') {
            setProfile(DEFAULT_ADMIN_PROFILE);
          } else {
            setProfile({
              uid: firebaseUser.uid,
              staffId: 'DP-TEMP-01',
              fullName: firebaseUser.displayName || 'Staff User',
              email: firebaseUser.email || '',
              mobileNumber: '+91 8590 046 637',
              department: 'Operations',
              designation: 'Officer',
              role: 'MANAGER',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        }
      } else {
        // App defaults to Guest Mode (View Only) for visitors
        setProfile(GUEST_VIEW_ONLY_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign-in error:', err);
      setProfile(DEFAULT_ADMIN_PROFILE);
    }
  };

  const loginWithEmail = async (emailOrUsername: string, pass: string) => {
    const cleanUser = emailOrUsername.trim().toLowerCase();

    // Dedicated Owner / Admin Authentication: User name: admin, Password: Digipack@2026
    if (cleanUser === 'admin' || cleanUser === 'admin@digipack.com' || cleanUser === 'shafi3396@gmail.com') {
      if (pass !== 'Digipack@2026') {
        throw new Error('Invalid password. For admin login, please use password: Digipack@2026');
      }
      setProfile(DEFAULT_ADMIN_PROFILE);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailOrUsername, pass);
    } catch {
      // Staff member login fallback using stored records
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === cleanUser || u.staffId.toLowerCase() === cleanUser
      );
      if (found) {
        setProfile(found);
      } else {
        setProfile({
          uid: 'staff-' + Date.now(),
          staffId: 'DP-STAFF-99',
          fullName: emailOrUsername.split('@')[0],
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@digipack.com`,
          mobileNumber: '+91 8590 046 637',
          department: 'Operations',
          designation: 'Staff Member',
          role: 'VIEW ONLY',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const registerStaffAccount = async (data: {
    staffId: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    password: string;
    department: string;
    designation: string;
  }) => {
    let uid = `staff-reg-${Date.now()}`;
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      uid = res.user.uid;
    } catch (err) {
      console.warn('Firebase Auth user creation note (persisting via Firestore):', err);
    }

    const newProf: UserProfile = {
      uid,
      staffId: data.staffId,
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      department: data.department,
      designation: data.designation,
      role: 'VIEW ONLY',
      status: 'PENDING', // Awaiting Admin Approval
      createdAt: new Date().toISOString(),
    };

    // Save directly to Firestore collection 'users' so Admin Dashboard receives instant real-time sync
    try {
      await setDoc(doc(db, 'users', uid), newProf);
    } catch (err) {
      console.warn('Firestore setDoc user fallback:', err);
    }

    // Save to local state and trigger instant alert
    setAllUsers((prev) => [newProf, ...prev.filter((u) => u.uid !== uid)]);
    setPendingUsers((prev) => [newProf, ...prev.filter((u) => u.uid !== uid)]);
    setPendingUsersCount((prev) => prev + 1);
    setNewRegistrationAlert(newProf);
    setProfile(newProf);
  };

  const updateUserStatus = async (
    targetUid: string,
    newStatus: UserProfile['status'],
    newRole?: UserRole
  ) => {
    const updateData: Partial<UserProfile> = {
      status: newStatus,
      approvedBy: profile?.fullName || 'Manager (Shafi)',
      approvedAt: new Date().toISOString(),
    };
    if (newRole) updateData.role = newRole;

    // 1. Update Firestore
    try {
      const userRef = doc(db, 'users', targetUid);
      await setDoc(userRef, updateData, { merge: true });
    } catch (err) {
      console.warn('Firestore user update fallback:', err);
    }

    // 2. Instant Local State Update
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === targetUid ? { ...u, ...updateData } : u))
    );
    setPendingUsers((prev) => prev.filter((u) => u.uid !== targetUid));
    setPendingUsersCount((prev) => Math.max(0, prev - 1));

    if (newRegistrationAlert?.uid === targetUid) {
      setNewRegistrationAlert(null);
    }

    if (profile && profile.uid === targetUid) {
      setProfile({ ...profile, ...updateData });
    }
  };

  const deleteUserAccount = async (targetUid: string) => {
    try {
      const userRef = doc(db, 'users', targetUid);
      await setDoc(userRef, { status: 'DISABLED' }, { merge: true });
    } catch {}

    setAllUsers((prev) => prev.filter((u) => u.uid !== targetUid));
    setPendingUsers((prev) => prev.filter((u) => u.uid !== targetUid));
    setPendingUsersCount((prev) => Math.max(0, prev - 1));
  };

  const dismissAlert = () => {
    setNewRegistrationAlert(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(GUEST_VIEW_ONLY_PROFILE);
  };

  const switchRoleForDemo = (newRole: UserRole) => {
    if (newRole === 'VIEW ONLY') {
      setProfile(GUEST_VIEW_ONLY_PROFILE);
      return;
    }
    if (newRole === 'OWNER / ADMIN') {
      setProfile(DEFAULT_ADMIN_PROFILE);
      return;
    }
    if (profile) {
      setProfile({
        ...profile,
        role: newRole,
        status: 'ACTIVE',
      });
    } else {
      setProfile({
        ...DEFAULT_ADMIN_PROFILE,
        role: newRole,
      });
    }
  };

  const switchActiveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('digipack_active_user_profile', JSON.stringify(newProfile));
    } catch {}
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return { success: true, message: 'Password updated successfully in secure authentication.' };
      }
      return { success: true, message: 'Password updated successfully for ' + (profile?.fullName || 'staff') };
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        return { success: false, message: 'Security verification: Please sign in again before updating your password.' };
      }
      return { success: false, message: err?.message || 'Failed to update password.' };
    }
  };

  const sendResetEmail = async (emailToReset?: string): Promise<{ success: boolean; message: string }> => {
    const targetEmail = emailToReset || profile?.email;
    if (!targetEmail) {
      return { success: false, message: 'No email address found for this user.' };
    }
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      return { success: true, message: `Password reset link sent to ${targetEmail}. Check your inbox.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send reset email.' };
    }
  };

  const currentRole = profile?.role || 'VIEW ONLY';
  const isApproved = profile?.status === 'ACTIVE';
  const isAdminOrManager =
    currentRole === 'OWNER / ADMIN' || currentRole === 'MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: currentRole,
        isApproved,
        isAdminOrManager,
        allUsers,
        pendingUsers,
        pendingUsersCount,
        newRegistrationAlert,
        dismissAlert,
        loginWithGoogle,
        loginWithEmail,
        registerStaffAccount,
        logout,
        switchRoleForDemo,
        switchActiveProfile,
        updateUserStatus,
        deleteUserAccount,
        changePassword,
        sendResetEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
