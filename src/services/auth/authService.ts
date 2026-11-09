import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  NextOrObserver
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '@/src/services/firebase/firebase';
import { UserProfile, PublicDonor } from '@/src/types';

export interface UserAuthSyncResult {
  profile: UserProfile;
  isDonor: boolean;
  donorProfile: PublicDonor | null;
}

/**
 * Sign in with Google using popup, with intelligent fallback for mobile/popup blockers
 */
export async function signInWithGoogleAuth(preferRedirect = false): Promise<FirebaseUser | null> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (preferRedirect || isMobile) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return null; // Will trigger page redirect
    } catch (redirectError) {
      console.warn('Redirect sign-in failed, trying popup:', redirectError);
    }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (popupError: any) {
    // If popup was blocked by browser, offer redirect fallback
    if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
      console.warn('Popup was blocked or closed, triggering redirect flow:', popupError);
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw popupError;
  }
}

/**
 * Check if the user returned from a signInWithRedirect flow
 */
export async function checkRedirectAuthResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (error) {
    console.error('Error handling redirect auth result:', error);
    throw error;
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Sync user profile without overwriting existing data or roles
 */
export async function syncUserProfile(user: FirebaseUser): Promise<UserAuthSyncResult> {
  const userRef = doc(db, 'users', user.uid);
  const donorRef = doc(db, 'donors', user.uid);
  const now = new Date().toISOString();

  let userProfile: UserProfile;
  let isDonor = false;
  let donorProfile: PublicDonor | null = null;

  try {
    // 1. Check existing donor registration
    const donorSnap = await getDoc(donorRef);
    if (donorSnap.exists()) {
      isDonor = true;
      donorProfile = donorSnap.data() as PublicDonor;
    }

    // 2. Check existing user profile
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const existingData = userSnap.data() as UserProfile;
      userProfile = existingData;

      // Update non-privileged fields only (displayName, photoURL, updatedAt)
      // Never overwrite user role or donor status from client
      try {
        await updateDoc(userRef, {
          displayName: user.displayName || existingData.displayName,
          photoURL: user.photoURL || existingData.photoURL,
          isDonor: isDonor, // sync with actual donor document existence
          updatedAt: now
        });
        userProfile = {
          ...existingData,
          displayName: user.displayName || existingData.displayName,
          photoURL: user.photoURL || existingData.photoURL,
          isDonor: isDonor,
          updatedAt: now
        };
      } catch (updateErr) {
        console.warn('Note: Could not update user document fields in Firestore:', updateErr);
      }
    } else {
      // 3. New user registration: Create base profile (Role: user, never self-assign admin)
      userProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Blood Bank Member',
        email: user.email,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber || null,
        isDonor: isDonor,
        role: 'user', // Default safe role
        createdAt: now,
        updatedAt: now
      };

      try {
        await setDoc(userRef, userProfile);
      } catch (createErr) {
        console.warn('Note: Could not create user document in Firestore:', createErr);
      }
    }

    return {
      profile: userProfile,
      isDonor,
      donorProfile
    };
  } catch (error) {
    console.warn('Error reading user/donor documents from Firestore:', error);
    
    // Provide safe in-memory profile so user can use the website even if offline
    return {
      profile: {
        uid: user.uid,
        displayName: user.displayName || 'Member',
        email: user.email,
        photoURL: user.photoURL,
        phoneNumber: null,
        isDonor: false,
        role: 'user',
        createdAt: now,
        updatedAt: now
      },
      isDonor: false,
      donorProfile: null
    };
  }
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuthState(callback: NextOrObserver<FirebaseUser | null>) {
  return onAuthStateChanged(auth, callback);
}
