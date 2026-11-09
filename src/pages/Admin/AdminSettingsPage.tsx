import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  Server, 
  Smartphone, 
  Globe, 
  Key 
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { auth } from '@/src/services/firebase/firebase';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const handleForceTokenRefresh = async () => {
    if (!auth.currentUser) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await auth.currentUser.getIdToken(true);
      setRefreshMsg('Firebase Authentication token refreshed with current Custom Claims.');
    } catch (err: any) {
      setRefreshMsg('Error refreshing token: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-slate-700" />
          <span>System & Administrator Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Firebase project configurations, security architectures, and token management.
        </p>
      </div>

      {/* Authorized Administrator Account Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1D4ED8] flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
              Primary Administrator
            </span>
            <h2 className="text-lg font-bold text-slate-900">mohistudio95@gmail.com</h2>
            <p className="text-xs text-slate-500">
              Authorized via Firebase Custom Claims (`{'{'} admin: true, role: 'admin' {'}'}`)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Signed In As:</span>
            <strong className="font-mono text-slate-900">{user?.email}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Account UID:</span>
            <strong className="font-mono text-slate-900">{user?.uid}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Email Verification Status:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleForceTokenRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Force Refresh Auth Token</span>
          </button>
          {refreshMsg && (
            <span className="text-xs font-medium text-emerald-700 animate-in fade-in">
              {refreshMsg}
            </span>
          )}
        </div>
      </div>

      {/* Unified Architecture Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Shared Firebase Backend</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Firebase Project ID:</span>
              <strong className="font-mono text-slate-900">blood-bank-halsha</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Project Number:</span>
              <strong className="font-mono text-slate-900">432602905565</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Android Package:</span>
              <strong className="font-mono text-slate-900">com.bloodbankhalsha.app</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BlueVerifiedBadge size="xs" />
            <span>Blue Verification Engine</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Minimum Verified Bags:</span>
              <strong className="text-slate-900">3 Completed Bags</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Eligibility Evaluation:</span>
              <strong className="text-emerald-700">Server-Authoritative</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
              <span>Audit Logging:</span>
              <strong className="text-blue-700">Immutable Firestore Stream</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
