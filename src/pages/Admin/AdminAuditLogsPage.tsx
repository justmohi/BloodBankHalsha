import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  RefreshCw, 
  Filter, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { getAdminAuditLogs } from '@/src/services/admin/adminService';
import { AuditLog } from '@/src/types';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const list = await getAdminAuditLogs();
      setLogs(list);
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && log.actionType !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.adminEmail?.toLowerCase().includes(q) ||
        log.actionType?.toLowerCase().includes(q) ||
        log.targetReference?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActionTypes = Array.from(new Set(logs.map(l => l.actionType)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ScrollText className="w-7 h-7 text-slate-700" />
            <span>Administrative Audit Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable, server-authored security audit trail of privileged administrative actions. Read-only.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3.5 shadow-xs">
        <Lock className="w-5 h-5 text-blue-400 shrink-0" />
        <p className="text-xs text-slate-300 leading-relaxed">
          Audit entries are generated strictly by backend authorization routines. Neither clients nor administrators can alter or delete logged records.
        </p>
      </div>

      {/* Search & Action Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by admin email, action type, target reference, or reason..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Action Types</option>
            {uniqueActionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading audit trail...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Target Reference</th>
                  <th className="py-3 px-4">Status Transition</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 font-mono text-[11px] block">
                        {log.actionType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.id}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.adminEmail}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.adminUid}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {log.targetReference}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {log.previousStatus || log.newStatus ? (
                        <div className="space-y-0.5 text-[11px]">
                          {log.previousStatus && <div className="text-slate-400">From: {log.previousStatus}</div>}
                          {log.newStatus && <div className="font-bold text-slate-900">To: {log.newStatus}</div>}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                      {log.reason || '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.result === 'success' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.result === 'success' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                        <span>{log.result}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No audit log entries match the search or filter query.
          </div>
        )}
      </div>

    </div>
  );
};
