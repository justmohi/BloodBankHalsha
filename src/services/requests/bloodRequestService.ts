import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth, handleFirestoreError, OperationType } from '@/src/services/firebase/firebase';
import { BloodRequest, BloodGroup, EmergencyLevel, RequestStatus } from '@/src/types';

export interface CreateBloodRequestParams {
  patientName: string;
  patientAge?: number | null;
  patientGender: 'male' | 'female' | 'child';
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  district: string;
  upazila: string;
  area?: string;
  requiredDate: string; // YYYY-MM-DD
  requiredTime: string; // HH:mm
  requesterPhone: string;
  emergencyLevel: EmergencyLevel;
  notes?: string;
  targetDonorId?: string | null;
}

export interface SubmissionResponse {
  requestId: string;
  status: RequestStatus;
  message: string;
}

/**
 * Validates that requiredDate is not in the past.
 */
export function validateRequestDate(dateStr: string): boolean {
  const reqDate = new Date(dateStr);
  if (isNaN(reqDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reqDate.setHours(0, 0, 0, 0);
  
  return reqDate.getTime() >= today.getTime();
}

/**
 * Submit Blood Request using backend callable function if deployed,
 * or direct authorized Firestore write following the exact Android schema.
 */
export async function submitBloodRequest(params: CreateBloodRequestParams): Promise<SubmissionResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: Please sign in with Google to post a blood request.');
  }

  if (!validateRequestDate(params.requiredDate)) {
    throw new Error('Required date cannot be in the past. Please select today or a future date.');
  }

  if (params.unitsRequired < 1 || params.unitsRequired > 10) {
    throw new Error('Units required must be between 1 and 10.');
  }

  const now = new Date().toISOString();

  // 1. Attempt callable Cloud Function first (e.g. 'createBloodRequest')
  try {
    const callableCreate = httpsCallable<any, { requestId: string; status?: RequestStatus }>(
      functions, 
      'createBloodRequest'
    );
    const result = await callableCreate({
      ...params,
      requesterId: currentUser.uid,
      requesterName: currentUser.displayName || 'Emergency Requester',
      requesterEmail: currentUser.email
    });

    if (result.data?.requestId) {
      return {
        requestId: result.data.requestId,
        status: result.data.status || 'pending',
        message: 'Blood request registered successfully through backend booking service.'
      };
    }
  } catch (fnError: any) {
    // If Cloud Function is not yet deployed or throws functions/not-found, fall back to Firestore
    if (fnError.code !== 'functions/not-found' && fnError.code !== 'not-found') {
      console.warn('Backend Cloud Function call note:', fnError.message);
    }
  }

  // 2. Direct Authorized Firestore Submission adhering to the Android schema
  const newRequestPayload = {
    requesterId: currentUser.uid,
    requesterName: currentUser.displayName || 'Emergency Requester',
    requesterPhone: params.requesterPhone.trim(),
    patientName: params.patientName.trim(),
    patientAge: params.patientAge ?? null,
    patientGender: params.patientGender,
    bloodGroup: params.bloodGroup,
    unitsRequired: params.unitsRequired,
    unitsFulfilled: 0, // Never privileged from client; modified only by atomic server booking
    hospitalName: params.hospitalName.trim(),
    district: params.district.trim(),
    upazila: params.upazila.trim(),
    area: (params.area || '').trim(),
    requiredDate: params.requiredDate,
    requiredTime: params.requiredTime,
    emergencyLevel: params.emergencyLevel,
    notes: (params.notes || '').trim(),
    status: 'pending' as RequestStatus, // Pending donor response
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = await addDoc(collection(db, 'bloodRequests'), newRequestPayload);
    const requestId = docRef.id;

    // If targeted to a specific donor from search, record in requestRecipients and alert donor
    if (params.targetDonorId) {
      try {
        await addDoc(collection(db, 'requestRecipients'), {
          requestId,
          donorId: params.targetDonorId,
          status: 'pending',
          respondedAt: null,
          createdAt: now,
          updatedAt: now
        });

        await addDoc(collection(db, 'notifications'), {
          recipientUserId: params.targetDonorId,
          title: `Emergency ${params.bloodGroup} Blood Request`,
          body: `Patient at ${params.hospitalName} (${params.upazila}, ${params.district}) needs ${params.unitsRequired} unit(s) of ${params.bloodGroup} blood.`,
          type: 'blood_request',
          requestId,
          isRead: false,
          createdAt: now
        });
      } catch (recipErr) {
        console.warn('Recipient dispatch warning:', recipErr);
      }
    }

    return {
      requestId,
      status: 'pending',
      message: 'Blood request registered successfully and broadcasted to voluntary donors.'
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bloodRequests');
  }
}

/**
 * Fetch all blood requests created by the authenticated user
 */
export async function getMyBloodRequests(userId: string): Promise<BloodRequest[]> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) {
    throw new Error('Unauthorized: You can only query your own blood requests.');
  }

  try {
    const q = query(
      collection(db, 'bloodRequests'),
      where('requesterId', '==', userId)
    );
    const snap = await getDocs(q);
    const requests: BloodRequest[] = [];
    
    snap.forEach((d) => {
      requests.push({ id: d.id, ...(d.data() as any) });
    });

    // Sort client-side by createdAt desc to avoid composite index requirements
    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'bloodRequests');
  }
}

/**
 * Real-time listener for user's blood requests
 */
export function subscribeToMyBloodRequests(
  userId: string,
  onUpdate: (requests: BloodRequest[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'bloodRequests'),
    where('requesterId', '==', userId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const requests: BloodRequest[] = [];
      snap.forEach((d) => {
        requests.push({ id: d.id, ...(d.data() as any) });
      });
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(requests);
    },
    (err) => {
      console.warn('Real-time blood requests snapshot notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Cancel a blood request with authorization checks
 */
export async function cancelBloodRequest(requestId: string, reason?: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to cancel request.');
  }

  // 1. Try backend callable Cloud Function first
  try {
    const callableCancel = httpsCallable<any, { success: boolean }>(functions, 'cancelBloodRequest');
    const res = await callableCancel({ requestId, reason });
    if (res.data?.success) return;
  } catch (fnErr: any) {
    if (fnErr.code !== 'functions/not-found' && fnErr.code !== 'not-found') {
      console.warn('Backend cancel function notice:', fnErr.message);
    }
  }

  // 2. Direct authorized Firestore update with strict state and identity checks
  const requestRef = doc(db, 'bloodRequests', requestId);
  const snap = await getDoc(requestRef);

  if (!snap.exists()) {
    throw new Error('Blood request not found.');
  }

  const data = snap.data();
  if (data.requesterId !== currentUser.uid) {
    throw new Error('Unauthorized: You can only cancel requests created by your account.');
  }

  if (data.status === 'fulfilled') {
    throw new Error('Cannot cancel: This blood request has already been fulfilled.');
  }

  if (data.status === 'cancelled') {
    throw new Error('This request has already been cancelled.');
  }

  try {
    await updateDoc(requestRef, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by requester',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bloodRequests/${requestId}`);
  }
}

/**
 * Accept a blood request atomically (Server-Authoritative)
 */
export async function acceptBloodRequest(requestId: string): Promise<{ success: boolean; unitsFulfilled: number; status: string; message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: Please sign in to accept this request.');
  }
  const token = await currentUser.getIdToken();
  const res = await fetch(`/api/requests/${requestId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to accept blood request.');
  }
  return data;
}

/**
 * Decline a blood request
 */
export async function declineBloodRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: Please sign in to decline this request.');
  }
  const token = await currentUser.getIdToken();
  const res = await fetch(`/api/requests/${requestId}/decline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to decline blood request.');
  }
  return data;
}

/**
 * Fetch incoming blood requests targeted to the authenticated donor
 */
export async function getIncomingDonorRequests(): Promise<any[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];
  const token = await currentUser.getIdToken();
  const res = await fetch('/api/donor/incoming-requests', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to load incoming requests.');
  }
  const data = await res.json();
  return data.requests || [];
}
