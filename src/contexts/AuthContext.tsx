import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithGoogleAuth,
  signUpWithEmailAuth,
  signInWithEmailAuth,
  sendPasswordReset, 
  checkRedirectAuthResult, 
  signOutAuth, 
  syncUserProfile, 
  subscribeToAuthState,
  UserAuthSyncResult
} from '@/src/services/auth/authService';
import { UserProfile, PublicDonor } from '@/src/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isDonor: boolean;
  donorProfile: PublicDonor | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: (preferRedirect?: boolean) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDonor, setIsDonor] = useState<boolean>(false);
  const [donorProfile, setDonorProfile] = useState<PublicDonor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleSyncUser = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const syncResult: UserAuthSyncResult = await syncUserProfile(firebaseUser);
      setUserProfile(syncResult.profile);
      setIsDonor(syncResult.isDonor);
      setDonorProfile(syncResult.donorProfile);
    } catch (syncErr: any) {
      console.warn('Sync warning:', syncErr);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Check if user just redirected back from Google OAuth
    const checkRedirect = async () => {
      try {
        const redirectUser = await checkRedirectAuthResult();
        if (redirectUser && isMounted) {
          setUser(redirectUser);
          await handleSyncUser(redirectUser);
        }
      } catch (err: any) {
        console.error('Redirect auth result error:', err);
        if (isMounted) {
          setError(err.message || 'Authentication failed on redirect.');
        }
      }
    };

    checkRedirect();

    // 2. Subscribe to auth state changes with session persistence
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        await handleSyncUser(currentUser);
      } else {
        setUserProfile(null);
        setIsDonor(false);
        setDonorProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [handleSyncUser]);

  const signInWithGoogle = async (preferRedirect = false) => {
    setLoading(true);
    setError(null);
    try {
      const authenticatedUser = await signInWithGoogleAuth(preferRedirect);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        await handleSyncUser(authenticatedUser);
      }
    } catch (authError: any) {
      console.error('Authentication Error:', authError);
      let friendlyMsg = 'Failed to sign in with Google. Please try again.';

      if (authError.code === 'auth/popup-blocked') {
        friendlyMsg = 'Browser popup was blocked. Please enable popups or try mobile sign-in.';
      } else if (authError.code === 'auth/popup-closed-by-user') {
        friendlyMsg = 'Sign-in window was closed before completing.';
      } else if (authError.code === 'auth/network-request-failed') {
        friendlyMsg = 'Network connectivity issue. Please check your internet connection.';
      } else if (authError.code === 'auth/unauthorized-domain') {
        friendlyMsg = 'This web domain is not yet authorized in Firebase Authentication Console.';
      } else if (authError.message) {
        friendlyMsg = authError.message;
      }

      setError(friendlyMsg);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const newUser = await signUpWithEmailAuth(name, email, password);
      setUser(newUser);
      await handleSyncUser(newUser);
    } catch (authError: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase yet.'
      };
      const message = messages[authError.code] || authError.message || 'Could not create your account.';
      setError(message); throw new Error(message);
    } finally { setLoading(false); }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const signedInUser = await signInWithEmailAuth(email, password);
      setUser(signedInUser);
      await handleSyncUser(signedInUser);
    } catch (authError: any) {
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Email or password is incorrect.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase yet.'
      };
      const message = messages[authError.code] || authError.message || 'Could not sign in.';
      setError(message); throw new Error(message);
    } finally { setLoading(false); }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try { await sendPasswordReset(email); }
    catch (err: any) { const message = err.message || 'Could not send password reset email.'; setError(message); throw new Error(message); }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOutAuth();
      setUser(null);
      setUserProfile(null);
      setIsDonor(false);
      setDonorProfile(null);
    } catch (logoutError: any) {
      console.error('Logout error:', logoutError);
      setError('Failed to sign out. Please try again.');
      throw logoutError;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await handleSyncUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isDonor,
        donorProfile,
        loading,
        error,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        logout,
        refreshProfile,
        clearError
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
