import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/src/services/firebase/firebase';
import { BlueVerificationApplication, DonationRecord } from '@/src/types';

/**
 * Fetch the donor's current Blue Verification application if one exists
 */
export async function getDonorVerificationApplication(donorId: string): Promise<BlueVerificationApplication | null> {
  try {
    const docRef = doc(db, 'blueVerificationApplications', donorId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) };
  } catch (err) {
    console.warn('Get verification application warning:', err);
    return null;
  }
}

/**
 * Fetch donor's verified donation records
 */
export async function getDonorCompletedDonations(donorId: string): Promise<DonationRecord[]> {
  try {
    const q = query(
      collection(db, 'donations'),
      where('donorId', '==', donorId)
    );
    const snap = await getDocs(q);
    const list: DonationRecord[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...(d.data() as any) });
    });
    // Sort descending by date
    list.sort((a, b) => new Date(b.donationDate || 0).getTime() - new Date(a.donationDate || 0).getTime());
    return list;
  } catch (err) {
    console.warn('Fetch completed donations notice:', err);
    return [];
  }
}

/**
 * Submit Blue Verification application to server
 */
export async function submitBlueVerificationApplication(params: {
  notes?: string;
  evidenceUrl?: string;
}): Promise<{
  success: boolean;
  message: string;
  application: BlueVerificationApplication;
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required.');
  }

  const token = await currentUser.getIdToken();
  const res = await fetch('/api/donor/apply-blue-verification', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit Blue Verification application.');
  }

  return data;
}
