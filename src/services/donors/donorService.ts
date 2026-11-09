import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '@/src/services/firebase/firebase';
import { PublicDonor, DonorPrivate, BloodGroup } from '@/src/types';

export interface RegisterDonorParams {
  donorId: string;
  fullName: string;
  mobileNumber: string;
  bloodGroup: BloodGroup;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // YYYY-MM-DD
  district: string;
  upazila: string;
  area?: string;
  lastDonationDate?: string | null; // YYYY-MM-DD or ISO
  isAvailable: boolean;
  photoFile?: File | null;
  existingPhotoURL?: string | null;
}

export interface EligibilityResult {
  isEligible: boolean;
  daysRemaining: number;
  nextEligibleDate: Date | null;
  formattedNextDate: string | null;
  totalDaysInterval: number;
}

/**
 * Calculate medical donation eligibility based on gender and last whole blood donation date.
 * Standard interval in Bangladesh: 90 days (approx 3 months) for males, 120 days (approx 4 months) for females.
 */
export function calculateDonationEligibility(
  lastDonationDateStr?: string | null,
  gender: 'male' | 'female' | 'other' = 'male'
): EligibilityResult {
  if (!lastDonationDateStr) {
    return {
      isEligible: true,
      daysRemaining: 0,
      nextEligibleDate: null,
      formattedNextDate: null,
      totalDaysInterval: gender === 'female' ? 120 : 90
    };
  }

  const lastDonation = new Date(lastDonationDateStr);
  if (isNaN(lastDonation.getTime())) {
    return {
      isEligible: true,
      daysRemaining: 0,
      nextEligibleDate: null,
      formattedNextDate: null,
      totalDaysInterval: gender === 'female' ? 120 : 90
    };
  }

  const intervalDays = gender === 'female' ? 120 : 90;
  const nextEligibleTime = new Date(lastDonation.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();

  const diffTime = nextEligibleTime.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isEligible: daysRemaining <= 0,
    daysRemaining,
    nextEligibleDate: nextEligibleTime,
    formattedNextDate: nextEligibleTime.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    totalDaysInterval: intervalDays
  };
}

/**
 * Fetch Public Donor profile (/donors/{donorId})
 */
export async function getPublicDonor(donorId: string): Promise<PublicDonor | null> {
  try {
    const snap = await getDoc(doc(db, 'donors', donorId));
    if (snap.exists()) {
      return { donorId: snap.id, ...(snap.data() as any) };
    }
    return null;
  } catch (error) {
    console.warn('Error fetching public donor profile:', error);
    return null;
  }
}

/**
 * Fetch Private Donor Document (/donorPrivate/{donorId})
 * Only accessible by the owner or authorized roles
 */
export async function getPrivateDonor(donorId: string): Promise<DonorPrivate | null> {
  try {
    const snap = await getDoc(doc(db, 'donorPrivate', donorId));
    if (snap.exists()) {
      return { donorId: snap.id, ...(snap.data() as any) };
    }
    return null;
  } catch (error) {
    console.warn('Error fetching private donor info:', error);
    return null;
  }
}

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadDonorPhoto(donorId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `donor_photos/${donorId}_${Date.now()}.${fileExt}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error) {
    console.warn('Photo upload error to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Register or update donor with full PII isolation
 */
export async function registerOrUpdateDonor(params: RegisterDonorParams): Promise<{
  publicProfile: PublicDonor;
  privateProfile: DonorPrivate;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== params.donorId) {
    throw new Error('Unauthorized identity mismatch: Only current user can register/edit their donor profile.');
  }

  const now = new Date().toISOString();
  let photoURL: string | null = params.existingPhotoURL || currentUser.photoURL || null;

  // 1. Upload photo if a new file was provided
  if (params.photoFile) {
    try {
      photoURL = await uploadDonorPhoto(params.donorId, params.photoFile);
    } catch (uploadErr) {
      console.warn('Could not upload photo file, continuing with existing/fallback avatar:', uploadErr);
    }
  }

  // 2. Check if a public donor doc already exists to preserve totalDonations and createdAt
  const existingPublic = await getPublicDonor(params.donorId);
  const existingPrivate = await getPrivateDonor(params.donorId);

  const createdAt = existingPublic?.createdAt || now;
  let totalDonations = existingPublic?.totalDonations || 0;
  if (params.lastDonationDate && totalDonations === 0) {
    totalDonations = 1;
  }

  // 3. Construct Public Donor Payload (NO MOBILE NUMBER, NO DOB, NO EXACT STREET ADDRESS)
  const publicData: PublicDonor = {
    donorId: params.donorId,
    fullName: params.fullName.trim(),
    bloodGroup: params.bloodGroup,
    gender: params.gender,
    district: params.district.trim(),
    upazila: params.upazila.trim(),
    area: (params.area || '').trim(),
    isAvailable: params.isAvailable,
    lastDonationDate: params.lastDonationDate ? new Date(params.lastDonationDate).toISOString() : null,
    totalDonations,
    photoURL,
    status: 'active',
    searchVisibility: true,
    createdAt,
    updatedAt: now
  };

  // 4. Construct Private Donor Payload (Strictly Isolated PII)
  const privateData: DonorPrivate = {
    donorId: params.donorId,
    mobileNumber: params.mobileNumber.trim(),
    dateOfBirth: params.dateOfBirth,
    emergencyContact: existingPrivate?.emergencyContact || null,
    fullAddress: `${params.area ? params.area + ', ' : ''}${params.upazila}, ${params.district}`,
    email: currentUser.email || null,
    isPhoneVerified: existingPrivate?.isPhoneVerified || false,
    createdAt: existingPrivate?.createdAt || now,
    updatedAt: now
  };

  // 5. Persist to Firestore
  try {
    await setDoc(doc(db, 'donors', params.donorId), publicData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `donors/${params.donorId}`);
  }

  try {
    await setDoc(doc(db, 'donorPrivate', params.donorId), privateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `donorPrivate/${params.donorId}`);
  }

  // 6. Update user profile document role to donor and synchronize photo/displayName
  try {
    await setDoc(doc(db, 'users', params.donorId), {
      uid: params.donorId,
      displayName: params.fullName.trim(),
      email: currentUser.email,
      photoURL,
      isDonor: true,
      role: 'donor',
      updatedAt: now
    }, { merge: true });
  } catch (userErr) {
    console.warn('Could not sync user profile record:', userErr);
  }

  // 7. If last donation was specified and user has no prior recorded donation, log it
  if (params.lastDonationDate && !existingPublic) {
    try {
      await addDoc(collection(db, 'donations'), {
        donorId: params.donorId,
        donationDate: params.lastDonationDate,
        hospitalName: 'Previous voluntary donation',
        district: params.district,
        bloodGroup: params.bloodGroup,
        notes: 'Initial registered donation history',
        createdAt: now
      });
    } catch (logErr) {
      console.warn('Could not add initial donation log record:', logErr);
    }
  }

  return {
    publicProfile: publicData,
    privateProfile: privateData
  };
}

/**
 * Fast availability toggle for existing donors
 */
export async function updateDonorAvailability(donorId: string, isAvailable: boolean): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== donorId) {
    throw new Error('Unauthorized: You can only update your own donor availability.');
  }

  try {
    await updateDoc(doc(db, 'donors', donorId), {
      isAvailable,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `donors/${donorId}`);
  }
}
