import { auth } from '@/src/services/firebase/firebase';
import { 
  AdminOverviewStats, 
  UserProfile, 
  PublicDonor, 
  BloodRequest, 
  DonationRecord, 
  BlueVerificationApplication, 
  AuditLog 
} from '@/src/types';

/**
 * Helper to get active user ID token for authenticated API requests
 */
async function getAuthHeader(): Promise<{ Authorization: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required.');
  }
  const token = await currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Check admin claims and bootstrap eligibility
 */
export async function checkAdminClaims(): Promise<{
  uid: string;
  email: string | null;
  isAdmin: boolean;
  canBootstrap: boolean;
}> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/check-claims', { headers });
  if (!res.ok) {
    throw new Error('Failed to verify admin status.');
  }
  return res.json();
}

/**
 * Execute one-time secure admin bootstrap for mohistudio95@gmail.com
 */
export async function bootstrapAdmin(): Promise<{
  success: boolean;
  message: string;
  admin: any;
}> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/bootstrap', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to complete administrator bootstrap.');
  }

  // Force token refresh so custom claims take effect immediately
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }

  return data;
}

/**
 * Get aggregated dashboard metrics
 */
export async function getAdminStats(): Promise<AdminOverviewStats> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/stats', { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard metrics.');
  }
  return res.json();
}

/**
 * Fetch all users with optional search
 */
export async function getAdminUsers(search?: string): Promise<UserProfile[]> {
  const headers = await getAuthHeader();
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`/api/admin/users${query}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch users list.');
  }
  const data = await res.json();
  return data.users || [];
}

/**
 * Update user account status (suspend / reactivate)
 */
export async function updateUserStatus(
  uid: string, 
  status: 'active' | 'suspended', 
  reason?: string
): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/users/${uid}/status`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, reason })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update user status.');
  }
}

/**
 * Fetch donors with admin controls
 */
export async function getAdminDonors(filters?: {
  search?: string;
  bloodGroup?: string;
  district?: string;
  blueVerified?: boolean;
}): Promise<PublicDonor[]> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.bloodGroup) params.set('bloodGroup', filters.bloodGroup);
  if (filters?.district) params.set('district', filters.district);
  if (filters?.blueVerified) params.set('blueVerified', 'true');

  const res = await fetch(`/api/admin/donors?${params.toString()}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch donors list.');
  }
  const data = await res.json();
  return data.donors || [];
}

/**
 * Update donor search visibility
 */
export async function updateDonorSearchVisibility(
  donorId: string, 
  searchVisibility: boolean, 
  reason?: string
): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/donors/${donorId}/visibility`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ searchVisibility, reason })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update search visibility.');
  }
}

/**
 * Fetch Blue Verification applications
 */
export async function getAdminVerificationApplications(): Promise<BlueVerificationApplication[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/blue-verification', { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch verification applications.');
  }
  const data = await res.json();
  return data.applications || [];
}

/**
 * Approve Blue Verification application (Server re-validates 3 donations)
 */
export async function approveBlueVerification(id: string): Promise<{
  success: boolean;
  message: string;
  authoritativeCount: number;
}> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/blue-verification/${id}/approve`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to approve Blue Verification.');
  }
  return data;
}

/**
 * Reject Blue Verification application with reason
 */
export async function rejectBlueVerification(
  id: string, 
  reason: string
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/blue-verification/${id}/reject`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reject application.');
  }
  return data;
}

/**
 * Revoke Blue Badge with mandatory reason
 */
export async function revokeBlueBadge(
  donorId: string, 
  reason: string
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/blue-verification/${donorId}/revoke`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to revoke Blue Badge.');
  }
  return data;
}

/**
 * Fetch blood requests for administration
 */
export async function getAdminBloodRequests(filters?: {
  status?: string;
  district?: string;
  bloodGroup?: string;
}): Promise<BloodRequest[]> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.district) params.set('district', filters.district);
  if (filters?.bloodGroup) params.set('bloodGroup', filters.bloodGroup);

  const res = await fetch(`/api/admin/requests?${params.toString()}`, { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch blood requests.');
  }
  const data = await res.json();
  return data.requests || [];
}

/**
 * Fetch donation records
 */
export async function getAdminDonations(): Promise<DonationRecord[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/donations', { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch donation records.');
  }
  const data = await res.json();
  return data.donations || [];
}

/**
 * Verify a donation record
 */
export async function verifyDonationRecord(
  id: string, 
  status: string = 'verified', 
  notes?: string
): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/donations/${id}/verify`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, notes })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to verify donation record.');
  }
}

/**
 * Fetch immutable audit logs
 */
export async function getAdminAuditLogs(): Promise<AuditLog[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/audit-logs', { headers });
  if (!res.ok) {
    throw new Error('Failed to fetch audit logs.');
  }
  const data = await res.json();
  return data.logs || [];
}
