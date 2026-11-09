import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  startAfter, 
  QueryDocumentSnapshot, 
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/src/services/firebase/firebase';
import { PublicDonor, BloodGroup } from '@/src/types';

export interface DonorSearchParams {
  bloodGroup?: BloodGroup | '';
  district?: string;
  upazila?: string;
  areaKeyword?: string;
  availableOnly?: boolean;
  blueVerifiedOnly?: boolean;
  pageSize?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface DonorSearchResult {
  donors: PublicDonor[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  indexUrl?: string | null;
  error?: string | null;
}

/**
 * Searches real voluntary donors from the public `/donors` collection.
 * Strictly adheres to PII isolation: never reads `/donorPrivate`.
 */
export async function searchPublicDonors(params: DonorSearchParams): Promise<DonorSearchResult> {
  const pageSize = params.pageSize || 12;
  const donorsRef = collection(db, 'donors');

  try {
    const constraints: QueryConstraint[] = [];

    // 1. Mandatory public visibility & account health constraints
    constraints.push(where('status', '==', 'active'));
    constraints.push(where('searchVisibility', '==', true));

    // 2. Availability filter (defaults to true if checked)
    if (params.availableOnly) {
      constraints.push(where('isAvailable', '==', true));
    }

    // 3. Blood group filter
    if (params.bloodGroup) {
      constraints.push(where('bloodGroup', '==', params.bloodGroup));
    }

    // 4. District filter
    if (params.district) {
      constraints.push(where('district', '==', params.district));
    }

    // 5. Upazila filter
    if (params.upazila) {
      constraints.push(where('upazila', '==', params.upazila));
    }

    // 6. Pagination cursor
    if (params.lastVisible) {
      constraints.push(startAfter(params.lastVisible));
    }

    // 7. Request 1 more than page size to accurately determine hasMore
    constraints.push(limit(pageSize + 1));

    const q = query(donorsRef, ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const resultDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const newLastVisible = resultDocs.length > 0 ? resultDocs[resultDocs.length - 1] : null;

    let donors: PublicDonor[] = resultDocs.map((docSnap) => {
      const data = docSnap.data();
      return {
        donorId: docSnap.id,
        fullName: data.fullName || 'Voluntary Donor',
        bloodGroup: data.bloodGroup as BloodGroup,
        gender: data.gender || 'other',
        district: data.district || '',
        upazila: data.upazila || '',
        area: data.area || '',
        isAvailable: data.isAvailable ?? true,
        lastDonationDate: data.lastDonationDate || null,
        totalDonations: data.totalDonations || 0,
        photoURL: data.photoURL || null,
        status: data.status || 'active',
        searchVisibility: data.searchVisibility ?? true,
        blueVerified: !!data.blueVerified,
        verifiedDonationCount: data.verifiedDonationCount || (data.blueVerified ? 3 : 0),
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      };
    });

    // 8. Blue Verified Only filter
    if (params.blueVerifiedOnly) {
      donors = donors.filter(d => d.blueVerified);
    }

    // 9. Optional client-side area text refinement on the paginated batch
    if (params.areaKeyword && params.areaKeyword.trim().length > 0) {
      const keyword = params.areaKeyword.trim().toLowerCase();
      donors = donors.filter(d => 
        (d.area && d.area.toLowerCase().includes(keyword)) ||
        d.upazila.toLowerCase().includes(keyword)
      );
    }

    return {
      donors,
      lastVisible: newLastVisible,
      hasMore,
      indexUrl: null,
      error: null
    };

  } catch (err: any) {
    console.warn('Firestore donor query notice:', err);

    // Extract Firestore Composite Index URL if provided by SDK error
    let indexUrl: string | null = null;
    const msg: string = err.message || '';
    const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
    if (match) {
      indexUrl = match[0];
    }

    return {
      donors: [],
      lastVisible: null,
      hasMore: false,
      indexUrl,
      error: err.code === 'failed-precondition' 
        ? 'This query combination requires a Firestore index.' 
        : (err.message || 'Unable to execute donor search.')
    };
  }
}
