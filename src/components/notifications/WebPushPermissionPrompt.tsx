import React, { useEffect, useState } from 'react';
import { BellRing, X, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getNotificationPermission,
  isWebPushSupported,
  requestWebPushPermissionAndToken
} from '@/src/services/notifications/notificationService';

export const WebPushPermissionPrompt: React.FC = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !isWebPushSupported()) {
      setVisible(false);
      return;
    }

    const permission = getNotificationPermission();
    if (permission === 'granted') {
      // Refresh/register this browser's FCM token after login without showing a prompt.
      requestWebPushPermissionAndToken(user.uid).catch((err) => console.warn('FCM token refresh notice:', err));
      setVisible(false);
      return;
    }
    if (permission === 'denied' || sessionStorage.getItem('bbh-push-prompt-dismissed') === '1') {
      setVisible(false);
      return;
    }

    // Let the Google sign-in redirect/popup and initial page render finish first.
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [user]);

  const enable = async () => {
    if (!user) return;
    setBusy(true);
    setMessage('');
    const result = await requestWebPushPermissionAndToken(user.uid);
    setBusy(false);
    if (result.success) {
      setVisible(false);
      sessionStorage.setItem('bbh-push-enabled', '1');
      return;
    }
    if (result.status === 'denied') {
      setMessage('Browser permission was blocked. Enable notifications from your browser site settings.');
    } else {
      setMessage(result.error || 'Could not enable notifications. Please try again.');
    }
  };

  const dismiss = () => {
    sessionStorage.setItem('bbh-push-prompt-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="push-prompt-title">
      <div className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 sm:p-7 shadow-2xl">
        <button type="button" onClick={dismiss} aria-label="Close notification prompt" className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100"><X className="w-5 h-5" /></button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#C62828]"><BellRing className="h-7 w-7" /></div>
        <h2 id="push-prompt-title" className="text-center text-xl font-extrabold text-gray-900">Enable Blood Request Alerts</h2>
        <p className="mt-2 text-center text-sm leading-6 text-gray-600">
          Get an instant phone or desktop notification when a matching blood request arrives, or when someone responds to your request.
        </p>
        <div className="mt-5 space-y-3 rounded-2xl bg-stone-50 p-4 text-sm text-gray-700">
          <div className="flex items-center gap-2"><DropletIcon /> Matching blood-group emergency alerts</div>
          <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-emerald-600" /> Alerts when the website is in the background</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> You can turn notifications off in browser settings</div>
        </div>
        {message && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{message}</p>}
        <button type="button" onClick={enable} disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C62828] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#B71C1C] disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
          {busy ? 'Enabling...' : 'Enable Notifications'}
        </button>
        <button type="button" onClick={dismiss} className="mt-3 w-full py-2 text-sm font-semibold text-gray-500 hover:text-gray-800">Not now</button>
      </div>
    </div>
  );
};

const DropletIcon = () => <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-[10px] text-[#C62828]">●</span>;
