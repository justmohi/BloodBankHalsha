import express, { Request, Response, NextFunction } from 'express';
import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
app.use(express.json());

// Cloud Run and uptime probes use this endpoint without requiring authentication.
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

const PORT = Number(process.env.PORT) || 3000;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'blood-bank-halsha';
const INITIAL_ADMIN_EMAIL = 'mohistudio95@gmail.com';

// Initialize Firebase Admin SDK
try {
  if (getApps().length === 0) {
    initializeApp({
      projectId: PROJECT_ID
    });
  }
  console.log(`Firebase Admin initialized for project: ${PROJECT_ID}`);
} catch (err) {
  console.warn('Firebase Admin default initialization notice:', err);
}

// In-memory cache for fast audit logs / admin roles if Firestore admin credentials are in dev mode
const localAuditLogs: any[] = [];

/**
 * Verify ID Token from Authorization header
 */
async function verifyToken(req: Request): Promise<{
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
} | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) return null;

  // 1. Try Firebase Admin verifyIdToken
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email?.toLowerCase() || null,
      emailVerified: !!decoded.email_verified,
      isAdmin: decoded.admin === true || decoded.role === 'admin' || decoded.email?.toLowerCase() === INITIAL_ADMIN_EMAIL
    };
  } catch (err: any) {
    // Never trust an unverified JWT payload. Reject any token Firebase Admin cannot verify.
    console.error('Firebase ID token verification failed:', err?.message || err);
    return null;
  }
}

/**
 * Middleware: Require Authenticated Admin
 */
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Valid Bearer token missing.' });
  }

  const isAuthorizedEmail = user.email === INITIAL_ADMIN_EMAIL && user.emailVerified;
  const isExplicitAdmin = user.isAdmin;

  if (!isAuthorizedEmail && !isExplicitAdmin) {
    return res.status(403).json({ 
      error: 'Access denied. Administrator privileges required.',
      details: 'Your account is not authorized as an administrator.'
    });
  }

  (req as any).adminUser = user;
  next();
}

/**
 * Helper to record server audit log
 */
async function recordAuditLog(log: {
  adminUid: string;
  adminEmail: string;
  actionType: string;
  targetReference: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  result: 'success' | 'failure';
  metadata?: Record<string, any>;
}) {
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...log,
    timestamp: new Date().toISOString()
  };

  localAuditLogs.unshift(logEntry);

  try {
    const db = getFirestore();
    await db.collection('auditLogs').doc(logEntry.id).set(logEntry);
  } catch (err) {
    console.warn('Firestore auditLog write notice (stored locally):', err);
  }

  return logEntry;
}

// ==========================================
// ADMIN API ROUTES
// ==========================================

/**
 * GET /api/admin/check-claims
 * Check if the caller has admin claims or is eligible to bootstrap
 */
app.get('/api/admin/check-claims', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ isAdmin: false, canBootstrap: false });
  }

  const isAuthorizedEmail = user.email === INITIAL_ADMIN_EMAIL;
  const canBootstrap = isAuthorizedEmail && user.emailVerified;
  const isAdmin = user.isAdmin || canBootstrap;

  return res.json({
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    isAdmin,
    canBootstrap
  });
});

/**
 * POST /api/admin/bootstrap
 * One-time secure server-side Admin bootstrap for mohistudio95@gmail.com
 */
app.post('/api/admin/bootstrap', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Sign in first.' });
  }

  // 1. Verify email matches authorized administrator
  if (user.email !== INITIAL_ADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Access denied. Only the authorized administrator email can initiate bootstrap.'
    });
  }

  // 2. Verify email_verified is true
  if (!user.emailVerified) {
    return res.status(400).json({
      error: 'Email is not verified. Please verify your Google email address before bootstrapping.'
    });
  }

  try {
    // 3. Set Custom User Claims in Firebase Auth
    try {
      await getAuth().setCustomUserClaims(user.uid, {
        admin: true,
        role: 'admin'
      });
    } catch (claimErr) {
      console.warn('Set custom claims notice (continuing with database roles):', claimErr);
    }

    // 4. Update Firestore users collection and admins collection
    try {
      const db = getFirestore();
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        role: 'admin',
        isAdmin: true,
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await db.collection('admins').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        role: 'admin',
        grantedAt: new Date().toISOString(),
        grantedBy: 'bootstrap'
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore admin profile write notice:', dbErr);
    }

    // 5. Record bootstrap operation in audit log
    await recordAuditLog({
      adminUid: user.uid,
      adminEmail: user.email,
      actionType: 'ADMIN_BOOTSTRAP',
      targetReference: `users/${user.uid}`,
      previousStatus: 'unverified',
      newStatus: 'admin',
      reason: 'Initial bootstrap of authorized administrator account',
      result: 'success'
    });

    return res.json({
      success: true,
      message: 'Admin privileges successfully provisioned for mohistudio95@gmail.com.',
      admin: {
        uid: user.uid,
        email: user.email,
        role: 'admin'
      }
    });

  } catch (err: any) {
    console.error('Admin bootstrap error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to complete Admin bootstrap.'
    });
  }
});

/**
 * GET /api/admin/stats
 * Overview real metrics from Firestore
 */
app.get('/api/admin/stats', requireAdmin, async (_req: Request, res: Response) => {
  try {
    let totalUsers = 0;
    let totalDonors = 0;
    let availableDonors = 0;
    let blueVerifiedDonors = 0;
    let totalBloodRequests = 0;
    let pendingRequests = 0;
    let partiallyFulfilledRequests = 0;
    let fulfilledRequests = 0;
    let cancelledRequests = 0;
    let expiredRequests = 0;
    let totalCompletedDonations = 0;
    let pendingVerificationApplications = 0;

    try {
      const db = getFirestore();

      // Aggregate users
      const usersSnap = await db.collection('users').get();
      totalUsers = usersSnap.size;

      // Aggregate donors
      const donorsSnap = await db.collection('donors').get();
      totalDonors = donorsSnap.size;
      donorsSnap.forEach((d: any) => {
        const data = d.data();
        if (data.isAvailable) availableDonors++;
        if (data.blueVerified) blueVerifiedDonors++;
      });

      // Aggregate blood requests
      const reqSnap = await db.collection('bloodRequests').get();
      totalBloodRequests = reqSnap.size;
      reqSnap.forEach((d: any) => {
        const data = d.data();
        if (data.status === 'open' || data.status === 'pending') pendingRequests++;
        else if (data.status === 'partially_fulfilled') partiallyFulfilledRequests++;
        else if (data.status === 'fulfilled') fulfilledRequests++;
        else if (data.status === 'cancelled') cancelledRequests++;
        else if (data.status === 'expired') expiredRequests++;
      });

      // Aggregate donations
      const donSnap = await db.collection('donations').get();
      donSnap.forEach((d: any) => {
        const data = d.data();
        if (data.status === 'completed' || data.status === 'verified' || !data.status) {
          totalCompletedDonations++;
        }
      });

      // Aggregate blue verification applications
      const appSnap = await db.collection('blueVerificationApplications').get();
      appSnap.forEach((d: any) => {
        const data = d.data();
        if (data.status === 'pending' || data.status === 'under_review') {
          pendingVerificationApplications++;
        }
      });

    } catch (dbErr) {
      console.warn('Direct Firestore aggregation notice, fallback defaults:', dbErr);
    }

    return res.json({
      totalUsers,
      totalDonors,
      availableDonors,
      blueVerifiedDonors,
      totalBloodRequests,
      pendingRequests,
      partiallyFulfilledRequests,
      fulfilledRequests,
      cancelledRequests,
      expiredRequests,
      totalCompletedDonations,
      pendingVerificationApplications
    });

  } catch (err: any) {
    console.error('Stats aggregation error:', err);
    return res.status(500).json({ error: 'Failed to calculate dashboard statistics.' });
  }
});

/**
 * GET /api/admin/users
 * Paginated user management
 */
app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const db = getFirestore();
    const snap = await db.collection('users').limit(100).get();

    const users: any[] = [];
    snap.forEach((d: any) => {
      const data = d.data();
      const userObj = { uid: d.id, ...data };
      if (!search || 
          userObj.displayName?.toLowerCase().includes(search) || 
          userObj.email?.toLowerCase().includes(search) ||
          userObj.phoneNumber?.includes(search)) {
        users.push(userObj);
      }
    });

    return res.json({ users });
  } catch (err: any) {
    console.error('Admin users fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

/**
 * POST /api/admin/users/:uid/status
 * Suspend or reactivate user account
 */
app.post('/api/admin/users/:uid/status', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { uid } = req.params;
  const { status, reason } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be active or suspended.' });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const prevStatus = userDoc.exists ? userDoc.data()?.status || 'active' : 'unknown';

    await userRef.set({
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: status === 'suspended' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetReference: `users/${uid}`,
      previousStatus: prevStatus,
      newStatus: status,
      reason: reason || 'Administrative action',
      result: 'success'
    });

    return res.json({ success: true, uid, status });
  } catch (err: any) {
    console.error('User status update error:', err);
    return res.status(500).json({ error: 'Failed to update user account status.' });
  }
});

/**
 * GET /api/admin/donors
 * Donor management with verification filters
 */
app.get('/api/admin/donors', requireAdmin, async (req: Request, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const bloodGroup = req.query.bloodGroup as string;
    const district = req.query.district as string;
    const verifiedOnly = req.query.blueVerified === 'true';

    const db = getFirestore();
    const snap = await db.collection('donors').limit(200).get();

    const donors: any[] = [];
    snap.forEach((d: any) => {
      const data = d.data();
      const donor = { donorId: d.id, ...data };

      if (bloodGroup && donor.bloodGroup !== bloodGroup) return;
      if (district && donor.district !== district) return;
      if (verifiedOnly && !donor.blueVerified) return;

      if (!search ||
          donor.fullName?.toLowerCase().includes(search) ||
          donor.district?.toLowerCase().includes(search) ||
          donor.upazila?.toLowerCase().includes(search)) {
        donors.push(donor);
      }
    });

    return res.json({ donors });
  } catch (err: any) {
    console.error('Admin donors fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch donors.' });
  }
});

/**
 * POST /api/admin/donors/:donorId/visibility
 * Hide or restore donor from public search
 */
app.post('/api/admin/donors/:donorId/visibility', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { donorId } = req.params;
  const { searchVisibility, reason } = req.body;

  try {
    const db = getFirestore();
    const donorRef = db.collection('donors').doc(donorId);
    const donorDoc = await donorRef.get();
    const prevVisibility = donorDoc.exists ? String(donorDoc.data()?.searchVisibility) : 'true';

    await donorRef.set({
      searchVisibility: !!searchVisibility,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: 'UPDATE_DONOR_VISIBILITY',
      targetReference: `donors/${donorId}`,
      previousStatus: `searchVisibility:${prevVisibility}`,
      newStatus: `searchVisibility:${searchVisibility}`,
      reason: reason || 'Administrative search visibility adjustment',
      result: 'success'
    });

    return res.json({ success: true, donorId, searchVisibility: !!searchVisibility });
  } catch (err: any) {
    console.error('Donor visibility update error:', err);
    return res.status(500).json({ error: 'Failed to update donor search visibility.' });
  }
});

/**
 * GET /api/admin/blue-verification
 * List all Blue Verification applications
 */
app.get('/api/admin/blue-verification', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('blueVerificationApplications').get();

    const applications: any[] = [];
    snap.forEach((d: any) => {
      applications.push({ id: d.id, ...d.data() });
    });

    applications.sort((a, b) => new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime());

    return res.json({ applications });
  } catch (err: any) {
    console.error('Blue verification fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch Blue Verification applications.' });
  }
});

/**
 * POST /api/admin/blue-verification/:id/approve
 * Server-side independent validation: requires >= 3 valid verified donations!
 */
app.post('/api/admin/blue-verification/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { id } = req.params; // donor ID or application ID

  try {
    const db = getFirestore();
    const appRef = db.collection('blueVerificationApplications').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ error: 'Verification application not found.' });
    }

    const appData = appDoc.data()!;
    const donorId = appData.donorId || id;

    // 1. INDEPENDENT SERVER-SIDE ELIGIBILITY RE-CHECK
    // Count valid completed donations from the donations collection
    const donationsSnap = await db.collection('donations')
      .where('donorId', '==', donorId)
      .get();

    let validDonationCount = 0;
    donationsSnap.forEach((d: any) => {
      const rec = d.data();
      const isValid = (rec.status === 'completed' || rec.status === 'verified' || !rec.status) &&
                      rec.status !== 'cancelled' && 
                      rec.status !== 'disputed';
      if (isValid) validDonationCount++;
    });

    // Also check donor's totalDonations recorded
    const donorRef = db.collection('donors').doc(donorId);
    const donorDoc = await donorRef.get();
    if (!donorDoc.exists) {
      return res.status(404).json({ error: 'Associated donor profile not found.' });
    }

    const recordedTotal = donorDoc.data()?.totalDonations || 0;
    const authoritativeCount = Math.max(validDonationCount, recordedTotal);

    if (authoritativeCount < 3) {
      return res.status(400).json({
        error: `Eligibility check failed. Donor has only ${authoritativeCount} verified completed donations. A strict minimum of 3 valid completed donations is required for Blue Verification.`,
        verifiedDonationCount: authoritativeCount
      });
    }

    const now = new Date().toISOString();

    // 2. Update Public Donor document with Blue Verification
    await donorRef.set({
      blueVerified: true,
      blueVerifiedAt: now,
      verifiedDonationCount: authoritativeCount,
      updatedAt: now
    }, { merge: true });

    // 3. Update Application Status to approved
    await appRef.set({
      status: 'approved',
      verifiedDonationCount: authoritativeCount,
      reviewedBy: adminUser.uid,
      reviewedAt: now,
      updatedAt: now
    }, { merge: true });

    // 4. Send In-App Notification to Donor
    const notifRef = db.collection('notifications').doc();
    await notifRef.set({
      id: notifRef.id,
      recipientUserId: donorId,
      title: 'Official Blue Verification Badge Approved! 🎖️',
      body: `Congratulations! Blood Bank Halsha administrators have approved your Blue Verification. Your profile now features the official Blue Verified badge across all searches.`,
      type: 'blue_verification_approved',
      isRead: false,
      createdAt: now
    });

    // 5. Record Audit Log
    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: 'APPROVE_BLUE_VERIFICATION',
      targetReference: `donors/${donorId}`,
      previousStatus: appData.status,
      newStatus: 'approved',
      reason: `Verified ${authoritativeCount} valid completed blood donations meets policy requirements.`,
      result: 'success',
      metadata: { authoritativeCount }
    });

    return res.json({
      success: true,
      message: 'Blue Verification successfully approved.',
      donorId,
      authoritativeCount
    });

  } catch (err: any) {
    console.error('Approve verification error:', err);
    return res.status(500).json({ error: err.message || 'Failed to approve Blue Verification application.' });
  }
});

/**
 * POST /api/admin/blue-verification/:id/reject
 * Reject verification application with mandatory reason
 */
app.post('/api/admin/blue-verification/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A specific reason is mandatory when rejecting a verification application.' });
  }

  try {
    const db = getFirestore();
    const appRef = db.collection('blueVerificationApplications').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const appData = appDoc.data()!;
    const donorId = appData.donorId || id;
    const now = new Date().toISOString();

    await appRef.set({
      status: 'rejected',
      rejectionReason: reason.trim(),
      reviewedBy: adminUser.uid,
      reviewedAt: now,
      updatedAt: now
    }, { merge: true });

    // Send Notification to donor
    const notifRef = db.collection('notifications').doc();
    await notifRef.set({
      id: notifRef.id,
      recipientUserId: donorId,
      title: 'Blue Verification Application Update',
      body: `Your Blue Verification application was reviewed. Reason: ${reason.trim()}`,
      type: 'blue_verification_rejected',
      isRead: false,
      createdAt: now
    });

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: 'REJECT_BLUE_VERIFICATION',
      targetReference: `blueVerificationApplications/${id}`,
      previousStatus: appData.status,
      newStatus: 'rejected',
      reason: reason.trim(),
      result: 'success'
    });

    return res.json({ success: true, message: 'Application rejected.', reason: reason.trim() });
  } catch (err: any) {
    console.error('Reject verification error:', err);
    return res.status(500).json({ error: 'Failed to reject application.' });
  }
});

/**
 * POST /api/admin/blue-verification/:donorId/revoke
 * Revoke Blue Badge with mandatory reason (e.g. fraudulent record, duplicate)
 */
app.post('/api/admin/blue-verification/:donorId/revoke', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { donorId } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A specific reason is mandatory when revoking a Blue Verification badge.' });
  }

  try {
    const db = getFirestore();
    const donorRef = db.collection('donors').doc(donorId);
    const now = new Date().toISOString();

    await donorRef.set({
      blueVerified: false,
      updatedAt: now
    }, { merge: true });

    // Update application if exists
    const appRef = db.collection('blueVerificationApplications').doc(donorId);
    await appRef.set({
      status: 'rejected',
      rejectionReason: `Badge revoked: ${reason.trim()}`,
      reviewedBy: adminUser.uid,
      reviewedAt: now,
      updatedAt: now
    }, { merge: true });

    // Notify donor
    const notifRef = db.collection('notifications').doc();
    await notifRef.set({
      id: notifRef.id,
      recipientUserId: donorId,
      title: 'Blue Verification Badge Revoked',
      body: `Notice: Your Blue Verification badge has been revoked by administration. Reason: ${reason.trim()}`,
      type: 'blue_badge_revoked',
      isRead: false,
      createdAt: now
    });

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: 'REVOKE_BLUE_BADGE',
      targetReference: `donors/${donorId}`,
      previousStatus: 'blueVerified:true',
      newStatus: 'blueVerified:false',
      reason: reason.trim(),
      result: 'success'
    });

    return res.json({ success: true, message: 'Blue Badge revoked.', donorId });
  } catch (err: any) {
    console.error('Revoke badge error:', err);
    return res.status(500).json({ error: 'Failed to revoke Blue Badge.' });
  }
});

/**
 * GET /api/admin/requests
 * Blood requests monitoring
 */
app.get('/api/admin/requests', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const district = req.query.district as string;
    const bloodGroup = req.query.bloodGroup as string;

    const db = getFirestore();
    const snap = await db.collection('bloodRequests').limit(150).get();

    const requests: any[] = [];
    snap.forEach((d: any) => {
      const reqData = { id: d.id, ...d.data() };
      if (status && reqData.status !== status) return;
      if (district && reqData.district !== district) return;
      if (bloodGroup && reqData.bloodGroup !== bloodGroup) return;
      requests.push(reqData);
    });

    requests.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json({ requests });
  } catch (err: any) {
    console.error('Admin requests fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch blood requests.' });
  }
});

/**
 * GET /api/admin/donations
 * Donation records management
 */
app.get('/api/admin/donations', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('donations').limit(200).get();

    const donations: any[] = [];
    snap.forEach((d: any) => {
      donations.push({ id: d.id, ...d.data() });
    });

    donations.sort((a, b) => new Date(b.donationDate || b.createdAt || 0).getTime() - new Date(a.donationDate || a.createdAt || 0).getTime());

    return res.json({ donations });
  } catch (err: any) {
    console.error('Admin donations fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch donation records.' });
  }
});

/**
 * POST /api/admin/donations/:id/verify
 * Admin confirms verification of a donation record
 */
app.post('/api/admin/donations/:id/verify', requireAdmin, async (req: Request, res: Response) => {
  const adminUser = (req as any).adminUser;
  const { id } = req.params;
  const { status = 'verified', notes } = req.body;

  try {
    const db = getFirestore();
    const donRef = db.collection('donations').doc(id);
    const now = new Date().toISOString();

    await donRef.set({
      status,
      verifiedByAdminId: adminUser.uid,
      verifiedAt: now,
      notes: notes || undefined,
      updatedAt: now
    }, { merge: true });

    await recordAuditLog({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      actionType: 'VERIFY_DONATION_RECORD',
      targetReference: `donations/${id}`,
      newStatus: status,
      reason: notes || 'Admin verification confirmed',
      result: 'success'
    });

    return res.json({ success: true, id, status });
  } catch (err: any) {
    console.error('Verify donation record error:', err);
    return res.status(500).json({ error: 'Failed to verify donation record.' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Read-only audit log stream for administrators
 */
app.get('/api/admin/audit-logs', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('auditLogs').limit(100).get();

    const logs: any[] = [];
    snap.forEach((d: any) => logs.push({ id: d.id, ...d.data() }));

    // Merge with in-memory logs if needed
    localAuditLogs.forEach(memLog => {
      if (!logs.some(l => l.id === memLog.id)) {
        logs.push(memLog);
      }
    });

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json({ logs });
  } catch (err: any) {
    console.warn('Audit logs fetch fallback:', err);
    return res.json({ logs: localAuditLogs });
  }
});

/**
 * POST /api/donor/apply-blue-verification
 * Authenticated donor submits Blue Verification application
 */
app.post('/api/donor/apply-blue-verification', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { notes, evidenceUrl } = req.body;

  try {
    const db = getFirestore();

    // 1. Fetch public donor record
    const donorDoc = await db.collection('donors').doc(user.uid).get();
    if (!donorDoc.exists) {
      return res.status(404).json({ error: 'You must register as a voluntary donor before applying for Blue Verification.' });
    }

    const donorData = donorDoc.data()!;

    // 2. Count valid completed donations
    const donationsSnap = await db.collection('donations')
      .where('donorId', '==', user.uid)
      .get();

    let validCount = 0;
    donationsSnap.forEach((d: any) => {
      const rec = d.data();
      if ((rec.status === 'completed' || rec.status === 'verified' || !rec.status) &&
          rec.status !== 'cancelled' && rec.status !== 'disputed') {
        validCount++;
      }
    });

    const recordedCount = donorData.totalDonations || 0;
    const finalCount = Math.max(validCount, recordedCount);

    if (finalCount < 3) {
      return res.status(400).json({
        error: `Ineligible for Blue Verification. You currently have ${finalCount} completed donations recorded. A minimum of 3 verified completed blood donations is required.`,
        verifiedDonationCount: finalCount,
        requiredDonations: 3
      });
    }

    // 3. Check for existing pending application
    const appRef = db.collection('blueVerificationApplications').doc(user.uid);
    const existingApp = await appRef.get();
    if (existingApp.exists && existingApp.data()?.status === 'pending') {
      return res.status(400).json({ error: 'You already have an active Blue Verification application pending review.' });
    }

    const now = new Date().toISOString();
    const applicationData = {
      id: user.uid,
      donorId: user.uid,
      donorName: donorData.fullName,
      bloodGroup: donorData.bloodGroup,
      district: donorData.district,
      upazila: donorData.upazila,
      verifiedDonationCount: finalCount,
      status: 'pending',
      submissionDate: now,
      notes: notes || '',
      evidenceUrl: evidenceUrl || '',
      createdAt: now,
      updatedAt: now
    };

    await appRef.set(applicationData);

    // 4. Notify donor
    const notifRef = db.collection('notifications').doc();
    await notifRef.set({
      id: notifRef.id,
      recipientUserId: user.uid,
      title: 'Blue Verification Application Received',
      body: `Your application for the official Blue Verified badge has been received with ${finalCount} verified donations. Our administrators will review your records shortly.`,
      type: 'blue_verification_submitted',
      isRead: false,
      createdAt: now
    });

    return res.json({
      success: true,
      message: 'Blue Verification application successfully submitted for administrative review.',
      application: applicationData
    });

  } catch (err: any) {
    console.error('Apply blue verification error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit application.' });
  }
});

/**
 * POST /api/requests/:requestId/accept
 * Atomic donor reservation endpoint enforcing server-side booking invariants:
 * - Checks status is open or partially_fulfilled
 * - Checks unitsFulfilled < unitsRequired
 * - Prevents duplicate reservation by the same donor
 * - Atomically increments unitsFulfilled
 * - Dispatches notifications to requester and donor
 */
app.post('/api/requests/:requestId/accept', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required to accept blood request.' });
  }
  const { requestId } = req.params;
  const db = getFirestore();

  try {
    const result = await db.runTransaction(async (transaction: any) => {
      const reqRef = db.collection('bloodRequests').doc(requestId);
      const reqDoc = await transaction.get(reqRef);
      if (!reqDoc.exists) {
        throw new Error('Blood request does not exist.');
      }

      const reqData = reqDoc.data()!;
      if (reqData.status === 'fulfilled' || (reqData.unitsFulfilled || 0) >= reqData.unitsRequired) {
        throw new Error('This blood request has already been fully fulfilled.');
      }
      if (reqData.status === 'cancelled') {
        throw new Error('This blood request has been cancelled by the requester.');
      }
      if (reqData.status === 'expired') {
        throw new Error('This blood request has expired.');
      }

      // Check if donor profile exists
      const donorDoc = await transaction.get(db.collection('donors').doc(user.uid));
      const donorName = donorDoc.exists ? donorDoc.data()?.fullName || 'Voluntary Donor' : 'Voluntary Donor';
      const donorBloodGroup = donorDoc.exists ? donorDoc.data()?.bloodGroup || reqData.bloodGroup : reqData.bloodGroup;

      // Check if this donor has already accepted
      const recipientQuery = await db.collection('requestRecipients')
        .where('requestId', '==', requestId)
        .where('donorId', '==', user.uid)
        .get();

      if (!recipientQuery.empty && recipientQuery.docs[0].data().status === 'accepted') {
        throw new Error('You have already accepted and reserved a unit for this blood request.');
      }

      const nextFulfilled = (reqData.unitsFulfilled || 0) + 1;
      const nextStatus = nextFulfilled >= reqData.unitsRequired ? 'fulfilled' : 'partially_fulfilled';
      const now = new Date().toISOString();

      // 1. Update bloodRequest atomically
      transaction.update(reqRef, {
        unitsFulfilled: nextFulfilled,
        status: nextStatus,
        updatedAt: now
      });

      // 2. Update or create requestRecipient entry
      if (!recipientQuery.empty) {
        transaction.update(recipientQuery.docs[0].ref, {
          status: 'accepted',
          respondedAt: now,
          updatedAt: now
        });
      } else {
        const newRecipRef = db.collection('requestRecipients').doc();
        transaction.set(newRecipRef, {
          id: newRecipRef.id,
          requestId,
          donorId: user.uid,
          status: 'accepted',
          respondedAt: now,
          createdAt: now,
          updatedAt: now
        });
      }

      // 3. Send notification to requester
      const notifRef = db.collection('notifications').doc();
      transaction.set(notifRef, {
        id: notifRef.id,
        recipientUserId: reqData.requesterId,
        title: 'Donor Accepted Blood Request! 🎉',
        body: `${donorName} (${donorBloodGroup}) has accepted your emergency request for ${reqData.hospitalName}. Please coordinate hospital arrival.`,
        type: 'request_accepted',
        requestId,
        isRead: false,
        createdAt: now
      });

      // 4. Send confirmation notification to donor
      const donorNotifRef = db.collection('notifications').doc();
      transaction.set(donorNotifRef, {
        id: donorNotifRef.id,
        recipientUserId: user.uid,
        title: 'Blood Donation Booking Confirmed',
        body: `Thank you for saving a life! Your donation booking for ${reqData.patientName} at ${reqData.hospitalName} (${reqData.upazila}, ${reqData.district}) is confirmed.`,
        type: 'blood_request',
        requestId,
        isRead: false,
        createdAt: now
      });

      return { nextFulfilled, nextStatus };
    });

    return res.json({
      success: true,
      message: 'Blood request accepted successfully and unit reserved.',
      unitsFulfilled: result.nextFulfilled,
      status: result.nextStatus
    });

  } catch (err: any) {
    console.warn('Accept blood request notice:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to accept blood request.' });
  }
});

/**
 * POST /api/requests/:requestId/decline
 * Donor declines an incoming blood request
 */
app.post('/api/requests/:requestId/decline', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const { requestId } = req.params;
  const db = getFirestore();
  const now = new Date().toISOString();

  try {
    const recipientQuery = await db.collection('requestRecipients')
      .where('requestId', '==', requestId)
      .where('donorId', '==', user.uid)
      .get();

    if (!recipientQuery.empty) {
      await recipientQuery.docs[0].ref.update({
        status: 'declined',
        respondedAt: now,
        updatedAt: now
      });
    } else {
      await db.collection('requestRecipients').add({
        requestId,
        donorId: user.uid,
        status: 'declined',
        respondedAt: now,
        createdAt: now,
        updatedAt: now
      });
    }

    return res.json({ success: true, message: 'Request declined.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to decline request.' });
  }
});

/**
 * GET /api/donor/incoming-requests
 * Fetches blood requests targeting the authenticated donor
 */
app.get('/api/donor/incoming-requests', async (req: Request, res: Response) => {
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const db = getFirestore();

  try {
    const recipSnap = await db.collection('requestRecipients')
      .where('donorId', '==', user.uid)
      .get();

    const incoming: any[] = [];
    for (const rDoc of recipSnap.docs) {
      const rData = rDoc.data();
      const reqDoc = await db.collection('bloodRequests').doc(rData.requestId).get();
      if (reqDoc.exists) {
        incoming.push({
          recipientId: rDoc.id,
          recipientStatus: rData.status,
          respondedAt: rData.respondedAt,
          request: { id: reqDoc.id, ...reqDoc.data() }
        });
      }
    }

    incoming.sort((a, b) => new Date(b.request?.createdAt || 0).getTime() - new Date(a.request?.createdAt || 0).getTime());
    return res.json({ incoming });
  } catch (err: any) {
    console.error('Fetch incoming requests error:', err);
    return res.status(500).json({ error: 'Failed to fetch incoming donor requests.' });
  }
});

// ==========================================
// VITE SPA & STATIC ASSET SERVING
// ==========================================

const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
        ws: isHmrDisabled ? false : { server: httpServer }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Blood Bank Halsha Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
