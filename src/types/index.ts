export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'user' | 'donor' | 'admin' | 'moderator';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  isDonor: boolean;
  role: UserRole;
  isAdmin?: boolean;
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export type DonorStatus = 'active' | 'inactive' | 'suspended';

export interface PublicDonor {
  donorId: string; // matches User uid
  fullName: string;
  bloodGroup: BloodGroup;
  gender: 'male' | 'female' | 'other';
  district: string;
  upazila: string;
  area: string;
  isAvailable: boolean;
  lastDonationDate: string | null; // ISO string
  totalDonations: number;
  verifiedDonationCount?: number;
  blueVerified?: boolean;
  blueVerifiedAt?: string | null;
  photoURL: string | null;
  status: DonorStatus;
  searchVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonorPrivate {
  donorId: string;
  mobileNumber: string;
  dateOfBirth: string; // YYYY-MM-DD
  emergencyContact?: string | null;
  fullAddress: string;
  email: string | null;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmergencyLevel = 'immediate' | 'within_24_hours' | 'scheduled';
export type RequestStatus = 'pending' | 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | 'expired';

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  patientName: string;
  patientAge?: number;
  patientGender: 'male' | 'female' | 'child';
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  district: string;
  upazila: string;
  area?: string;
  requiredDate: string; // YYYY-MM-DD
  requiredTime: string; // HH:mm
  emergencyLevel: EmergencyLevel;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type RecipientStatus = 'pending' | 'accepted' | 'declined' | 'already_booked' | 'expired';

export interface RequestRecipient {
  id: string;
  requestId: string;
  donorId: string;
  status: RecipientStatus;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'blood_request' 
  | 'request_accepted' 
  | 'request_declined' 
  | 'partially_fulfilled' 
  | 'fully_fulfilled' 
  | 'already_booked' 
  | 'request_cancelled' 
  | 'request_expired' 
  | 'donation_completed' 
  | 'donation_reminder' 
  | 'blue_verification_submitted'
  | 'blue_verification_approved'
  | 'blue_verification_rejected'
  | 'blue_badge_revoked'
  | 'blue_verification_info_needed'
  | 'system';

export interface AppNotification {
  id: string;
  recipientUserId: string;
  title: string;
  body: string;
  type: NotificationType;
  requestId?: string | null;
  relatedRequestId?: string | null;
  readAt?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type DonationStatus = 'completed' | 'verified' | 'pending' | 'disputed' | 'cancelled';

export interface DonationRecord {
  id: string;
  donorId: string;
  donorName?: string;
  requestId?: string | null;
  donationDate: string;
  hospitalName: string;
  district: string;
  bloodGroup: BloodGroup;
  status?: DonationStatus;
  verifiedByAdminId?: string;
  verifiedAt?: string;
  disputeReason?: string;
  notes?: string;
  createdAt: string;
}

export type BlueVerificationStatus = 
  | 'not_applied' 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'more_information_required';

export interface BlueVerificationApplication {
  id: string; // donor UID
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  district: string;
  upazila: string;
  verifiedDonationCount: number;
  status: BlueVerificationStatus;
  submissionDate: string;
  notes?: string;
  evidenceUrl?: string;
  reviewedBy?: string; // Admin UID
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditLogAction = 
  | 'ADMIN_BOOTSTRAP' 
  | 'APPROVE_BLUE_VERIFICATION' 
  | 'REJECT_BLUE_VERIFICATION' 
  | 'REVOKE_BLUE_BADGE' 
  | 'SUSPEND_USER' 
  | 'REACTIVATE_USER' 
  | 'UPDATE_DONOR_VISIBILITY' 
  | 'VERIFY_DONATION_RECORD';

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  actionType: AuditLogAction | string;
  targetReference: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  result: 'success' | 'failure';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalDonors: number;
  availableDonors: number;
  blueVerifiedDonors: number;
  totalBloodRequests: number;
  pendingRequests: number;
  partiallyFulfilledRequests: number;
  fulfilledRequests: number;
  cancelledRequests: number;
  expiredRequests: number;
  totalCompletedDonations: number;
  pendingVerificationApplications: number;
}

export interface DonorSearchFilter {
  bloodGroup?: BloodGroup | '';
  district?: string;
  upazila?: string;
  area?: string;
  availableOnly?: boolean;
  blueVerifiedOnly?: boolean;
}
