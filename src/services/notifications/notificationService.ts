import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  writeBatch,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db, app, auth, handleFirestoreError, OperationType } from '@/src/services/firebase/firebase';
import { AppNotification, NotificationType } from '@/src/types';

export interface WebPushRegistrationResult {
  success: boolean;
  token?: string | null;
  error?: string | null;
  status: 'granted' | 'denied' | 'unsupported' | 'missing_vapid' | 'error';
}

/**
 * Real-time listener for current user's notifications.
 * Strictly scopes query to `where('recipientUserId', '==', userId)`.
 */
export function subscribeToMyNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('recipientUserId', '==', userId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const list: AppNotification[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Real-time notification listener notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required.');
  }

  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
      isRead: true,
      readAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

/**
 * Mark all unread notifications of the current user as read
 */
export async function markAllNotificationsAsRead(notifications: AppNotification[]): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Authentication required.');
  }

  const unreadList = notifications.filter(n => !n.isRead && n.recipientUserId === currentUid);
  if (unreadList.length === 0) return;

  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const notif of unreadList) {
      const ref = doc(db, 'notifications', notif.id);
      batch.update(ref, { isRead: true, readAt: now });
    }

    await batch.commit();
  } catch (err) {
    console.warn('Batch mark read notice, falling back to individual updates:', err);
    for (const notif of unreadList) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
      } catch (innerErr) {
        // Continue loop
      }
    }
  }
}

/**
 * Check if the current browser supports Web Push & Service Workers
 */
export function isWebPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request Web Push permission and register Web FCM token on explicit user action.
 * Does NOT prompt automatically on page load.
 */
export async function requestWebPushPermissionAndToken(userId: string): Promise<WebPushRegistrationResult> {
  if (!isWebPushSupported()) {
    return {
      success: false,
      status: 'unsupported',
      error: 'Web Push notifications are not supported by this browser.'
    };
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        status: 'denied',
        error: 'Notification permission was declined by the user.'
      };
    }

    // 2. Validate VAPID key
    if (!vapidKey || vapidKey.trim().length === 0 || vapidKey === 'MY_VAPID_KEY') {
      return {
        success: false,
        status: 'missing_vapid',
        error: 'Web Push VAPID key is not configured in VITE_FIREBASE_VAPID_KEY.'
      };
    }

    // 3. Dynamically import Firebase Messaging to ensure compatibility
    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported) {
      return {
        success: false,
        status: 'unsupported',
        error: 'Firebase Messaging is not supported in this environment.'
      };
    }

    // 4. Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;

    // 5. Obtain token
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      return {
        success: false,
        status: 'error',
        error: 'Could not generate Web Push token from Firebase.'
      };
    }

    // 6. Save token to Firestore with device metadata
    const tokenDocId = `${userId}_web_${btoa(token.slice(-16)).replace(/[/+=]/g, '')}`;
    const tokenRef = doc(db, 'userFcmTokens', tokenDocId);

    await setDoc(tokenRef, {
      userId,
      token,
      deviceType: 'web',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return {
      success: true,
      token,
      status: 'granted'
    };

  } catch (err: any) {
    console.error('Web Push registration error:', err);
    return {
      success: false,
      status: 'error',
      error: err.message || 'An unexpected error occurred during Web Push registration.'
    };
  }
}

/**
 * Helper to get user-friendly label for each notification type
 */
export function getNotificationTypeLabel(type: NotificationType): { label: string; color: string } {
  switch (type) {
    case 'blood_request':
      return { label: 'Urgent Request', color: 'bg-red-100 text-red-800 border-red-200' };
    case 'request_accepted':
      return { label: 'Donor Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'request_declined':
      return { label: 'Declined', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    case 'partially_fulfilled':
      return { label: 'Partially Reserved', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'fully_fulfilled':
      return { label: 'Fully Reserved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'already_booked':
      return { label: 'Already Booked', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'request_cancelled':
      return { label: 'Cancelled', color: 'bg-stone-100 text-stone-600 border-stone-200' };
    case 'request_expired':
      return { label: 'Expired', color: 'bg-stone-100 text-stone-500 border-stone-200' };
    case 'donation_completed':
      return { label: 'Donation Recorded', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    case 'donation_reminder':
      return { label: 'Donation Reminder', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'system':
    default:
      return { label: 'System Alert', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}
