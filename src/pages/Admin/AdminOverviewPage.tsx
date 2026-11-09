import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  HeartHandshake, 
  Droplet, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Activity,
  ScrollText
} from 'lucide-react';
import { getAdminStats, getAdminAuditLogs } from '@/src/services/admin/adminService';
import { AdminOverviewStats, AuditLog } from '@/src/types';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, logsData] = await Promise.all([
        getAdminStats(),
        getAdminAuditLogs()
      ]);
      setStats(statsData);
      setRecentLogs(logsData.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Overview & Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time verified data stream from Blood Bank Halsha Cloud Firestore backend.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {loading ? <span className="text-slate-300">...</span> : stats?.totalUsers || 0}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-gray-100">
            <span>Registered Google Accounts</span>
            <Link to="/admin/users" className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Voluntary Donors */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Donors</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-[#C62828] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{loading ? '...' : stats?.totalDonors || 0}</span>
            <span className="text-xs font-bold text-emerald-600">
              ({stats?.availableDonors || 0} available)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-gray-100">
            <span>Lifesaver Directory</span>
            <Link to="/admin/donors" className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5">
              View <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Blue Verified Donors */}
        <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-2xl p-5 border border-blue-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Blue Verified</span>
              <BlueVerifiedBadge size="xs" />
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{loading ? '...' : stats?.blueVerifiedDonors || 0}</span>
            {stats && stats.pendingVerificationApplications > 0 && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                {stats.pendingVerificationApplications} pending
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-blue-100">
            <span>3+ verified donations badge</span>
            <Link to="/admin/blue-verification" className="text-blue-700 hover:underline font-bold flex items-center gap-0.5">
              Review Queue <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Blood Requests */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Requests</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-2">
            <span>{loading ? '...' : stats?.totalBloodRequests || 0}</span>
            <span className="text-xs font-bold text-red-600">
              ({stats?.pendingRequests || 0} open)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-gray-100">
            <span>Hospital Emergency Cases</span>
            <Link to="/admin/requests" className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5">
              Monitor <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* Request Fulfillment Breakdown & Verification Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Request Status Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C62828]" />
              <span>Blood Request Fulfillment Status</span>
            </h3>
            <Link to="/admin/requests" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Requests &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800">Open / Pending</span>
              <div className="text-xl font-black text-amber-900">{stats?.pendingRequests || 0}</div>
              <span className="text-[10px] text-amber-700 block">Awaiting donor match</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-800">Partially Fulfilled</span>
              <div className="text-xl font-black text-blue-900">{stats?.partiallyFulfilledRequests || 0}</div>
              <span className="text-[10px] text-blue-700 block">Partial units reserved</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-800">Fulfilled</span>
              <div className="text-xl font-black text-emerald-900">{stats?.fulfilledRequests || 0}</div>
              <span className="text-[10px] text-emerald-700 block">Complete units secured</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-600">Cancelled / Expired</span>
              <div className="text-xl font-black text-stone-800">
                {(stats?.cancelledRequests || 0) + (stats?.expiredRequests || 0)}
              </div>
              <span className="text-[10px] text-stone-500 block">Archived</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
            <span>Total Completed Blood Donations Recorded:</span>
            <strong className="text-slate-900 font-bold text-sm">{stats?.totalCompletedDonations || 0} Bags</strong>
          </div>
        </div>

        {/* Blue Verification Quick Action Callout */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Blue Verification System</span>
              <BlueVerifiedBadge size="sm" />
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Donors with at least <strong>3 verified completed blood donations</strong> are eligible for the official Blue Verified badge across search results.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Applications Pending:</span>
              <span className="font-extrabold text-blue-400 text-sm">
                {stats?.pendingVerificationApplications || 0}
              </span>
            </div>

            <Link
              to="/admin/blue-verification"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Open Verification Review</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Security & Administrative Audit Logs */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-slate-600" />
            <span>Recent Administrative Audit Trail</span>
          </h3>
          <Link to="/admin/audit-logs" className="text-xs font-semibold text-blue-600 hover:underline">
            View Complete Logs &rarr;
          </Link>
        </div>

        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Admin</th>
                  <th className="pb-3">Target Reference</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {log.actionType}
                    </td>
                    <td className="py-3 text-slate-600">{log.adminEmail}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-500">{log.targetReference}</td>
                    <td className="py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.result === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No administrative audit actions recorded yet.
          </div>
        )}
      </div>

    </div>
  );
};
