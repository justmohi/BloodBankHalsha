import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ShieldAlert, 
  Heart, 
  Droplet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Info, 
  ArrowRight,
  ExternalLink,
  Volume2,
  BellRing,
  Smartphone,
  Laptop
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppNotification, NotificationType } from '@/src/types';
import { 
  subscribeToMyNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationTypeLabel,
  isWebPushSupported,
  getNotificationPermission,
  requestWebPushPermissionAndToken,
  WebPushRegistrationResult
} from '@/src/services/notifications/notificationService';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'requests'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Web Push State
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check browser notification permission
    if (!isWebPushSupported()) {
      setPushStatus('unsupported');
    } else {
      setPushStatus(getNotificationPermission() as any);
    }

    setLoading(true);
    const unsubscribe = subscribeToMyNotifications(
      user.uid,
      (list) => {
        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time notification subscription warning:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (notif.isRead) return;
    try {
      setProcessingId(notif.id);
      await markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Mark as read error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsRead(notifications);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleEnableWebPush = async () => {
    if (!user) return;
    setIsRegisteringPush(true);
    setPushFeedback(null);

    const result: WebPushRegistrationResult = await requestWebPushPermissionAndToken(user.uid);
    setIsRegisteringPush(false);

    if (result.success) {
      setPushStatus('granted');
      setPushFeedback('Web Push notifications successfully enabled! You will now receive instant emergency blood alerts.');
    } else if (result.status === 'missing_vapid') {
      setPushFeedback('Web Push requires VITE_FIREBASE_VAPID_KEY in your environment. Notifications will still appear live on this page.');
    } else if (result.status === 'denied') {
      setPushStatus('denied');
      setPushFeedback('Notification permission was blocked. Please enable notifications in your browser settings.');
    } else {
      setPushFeedback(result.error || 'Failed to register Web Push.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'requests') {
      return ['blood_request', 'request_accepted', 'request_declined', 'partially_fulfilled', 'fully_fulfilled'].includes(notif.type);
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'blood_request':
        return <Droplet className="w-5 h-5 text-red-600 fill-red-100" />;
      case 'request_accepted':
      case 'fully_fulfilled':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />;
      case 'partially_fulfilled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'request_declined':
      case 'already_booked':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'request_cancelled':
      case 'request_expired':
        return <XCircle className="w-5 h-5 text-stone-500" />;
      case 'donation_completed':
      case 'donation_reminder':
        return <Heart className="w-5 h-5 text-rose-600 fill-rose-100" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-stone-50/60 min-h-screen py-8 sm:py-12 text-[#252525]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C62828] text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live updates regarding your blood requests, donor responses, and Halsha community emergency alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50/50 hover:border-rose-200 text-xs font-semibold text-gray-700 hover:text-[#C62828] transition-all shadow-2xs disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                {isMarkingAll ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>
        </div>

        {/* Web Push Banner Card */}
        {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
          <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C62828] text-white flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Enable Instant Web Notifications
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-[#C62828]">
                    Emergency Alerts
                  </span>
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                  Get immediate desktop & mobile browser alerts when a donor accepts your blood request or when an urgent donation is needed in Kushtia / Halsha.
                </p>
                {pushFeedback && (
                  <p className="text-xs font-medium text-[#C62828] pt-1">
                    {pushFeedback}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnableWebPush}
              disabled={isRegisteringPush}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm disabled:opacity-50 active:scale-98"
            >
              <Volume2 className="w-4 h-4" />
              {isRegisteringPush ? 'Enabling...' : 'Enable Notifications'}
            </button>
          </div>
        )}

        {/* Android & Web Device Sync Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-gray-700">Firestore Real-time Stream Active</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Laptop className="w-3.5 h-3.5" /> Web Portal
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <Smartphone className="w-3.5 h-3.5" /> Android App Sync
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'unread'
                ? 'bg-[#C62828] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('requests')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'requests'
                ? 'bg-rose-100 text-red-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Blood Requests & Bookings
          </button>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 animate-pulse flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-md w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const typeMeta = getNotificationTypeLabel(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? 'bg-white border-gray-200/80 hover:border-gray-300'
                      : 'bg-rose-50/30 border-rose-200 hover:border-rose-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeMeta.color}`}>
                            {typeMeta.label}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#C62828]" />
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-gray-400">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold text-gray-900 group-hover:text-[#C62828] transition-colors ${!notif.isRead ? 'font-extrabold' : ''}`}>
                        {notif.title}
                      </h4>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Action Links */}
                      {(notif.requestId || notif.relatedRequestId) && (
                        <div className="pt-2 flex items-center gap-3">
                          <Link
                            to="/my-requests"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#C62828] hover:underline"
                          >
                            View Request Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 sm:p-16 bg-white rounded-3xl border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-stone-400 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-stone-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">
                {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {filter === 'unread'
                  ? 'You have read all your notifications. New urgent requests and donor responses will appear here.'
                  : 'You do not have any notifications right now. When donors respond to your requests or emergency cases arise, you will be notified.'}
              </p>
            </div>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                View All Notifications
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
