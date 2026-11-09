import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  RefreshCw, 
  Droplet, 
  HeartHandshake, 
  ShieldCheck, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { getAdminStats } from '@/src/services/admin/adminService';
import { AdminOverviewStats } from '@/src/types';
import { BLOOD_GROUPS } from '@/src/data/bangladeshLocations';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalReqs = stats?.totalBloodRequests || 1;
  const fulfilledReqs = stats?.fulfilledRequests || 0;
  const partialReqs = stats?.partiallyFulfilledRequests || 0;
  const pendingReqs = stats?.pendingRequests || 0;
  const fulfillmentRate = Math.round(((fulfilledReqs + partialReqs) / (totalReqs || 1)) * 100);

  const totalDonors = stats?.totalDonors || 1;
  const blueVerifiedCount = stats?.blueVerifiedDonors || 0;
  const verifiedRate = Math.round((blueVerifiedCount / (totalDonors || 1)) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative performance reports, fulfillment ratios, and Blue Verification adoption metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* High-level performance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Request Fulfillment Efficiency */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Request Fulfillment Ratio</h3>
            <span className="text-xs font-extrabold text-emerald-600">{fulfillmentRate}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div 
              style={{ width: `${(fulfilledReqs / totalReqs) * 100}%` }} 
              className="bg-emerald-500 h-full" 
              title="Fulfilled"
            />
            <div 
              style={{ width: `${(partialReqs / totalReqs) * 100}%` }} 
              className="bg-blue-500 h-full" 
              title="Partially Fulfilled"
            />
            <div 
              style={{ width: `${(pendingReqs / totalReqs) * 100}%` }} 
              className="bg-amber-400 h-full" 
              title="Pending"
            />
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fulfilled
              </span>
              <strong>{fulfilledReqs}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Partially Reserved
              </span>
              <strong>{partialReqs}</strong>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending Donor
              </span>
              <strong>{pendingReqs}</strong>
            </div>
          </div>
        </div>

        {/* Blue Verification Conversion */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Blue Verified Donor Adoption</h3>
            <span className="text-xs font-extrabold text-blue-600">{verifiedRate}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div 
              style={{ width: `${verifiedRate}%` }} 
              className="bg-[#1D4ED8] h-full" 
            />
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Blue Verified Badges Granted:</span>
              <strong className="text-blue-700">{blueVerifiedCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Applications in Review:</span>
              <strong>{stats?.pendingVerificationApplications || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Voluntary Donors:</span>
              <strong>{stats?.totalDonors || 0}</strong>
            </div>
          </div>
        </div>

        {/* Total Life-Saving Donations */}
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 rounded-2xl p-6 border border-rose-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C62828]">Total Impact</span>
            <div className="text-3xl font-black text-slate-900">
              {stats?.totalCompletedDonations || 0} Bags
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Voluntary blood donations recorded in Halsha, Kushtia, and partner hospital networks.
            </p>
          </div>

          <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-slate-500">
            <span>Network Active Donors</span>
            <strong className="text-emerald-700">{stats?.availableDonors || 0} Ready Today</strong>
          </div>
        </div>

      </div>

      {/* System Integrity & Policy Audit Notice */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm">Real Aggregation & Zero Telemetry Leakage</h4>
          <p>
            All metric values shown are compiled strictly from authenticated Cloud Firestore collections (`users`, `donors`, `bloodRequests`, `donations`, and `blueVerificationApplications`). Private contact numbers and medical PII are never queried or transmitted for report generation.
          </p>
        </div>
      </div>

    </div>
  );
};
