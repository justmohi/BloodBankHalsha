import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Search, 
  RefreshCw, 
  Filter, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  Hospital,
  Calendar
} from 'lucide-react';
import { getAdminBloodRequests } from '@/src/services/admin/adminService';
import { BloodRequest, RequestStatus } from '@/src/types';
import { BANGLADESH_DISTRICTS, BLOOD_GROUPS } from '@/src/data/bangladeshLocations';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const list = await getAdminBloodRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        district: districtFilter || undefined,
        bloodGroup: bloodGroupFilter || undefined
      });
      setRequests(list);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, districtFilter, bloodGroupFilter]);

  const filteredRequests = requests.filter(req => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      req.patientName?.toLowerCase().includes(q) ||
      req.hospitalName?.toLowerCase().includes(q) ||
      req.requesterName?.toLowerCase().includes(q) ||
      req.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Droplet className="w-7 h-7 text-[#C62828] fill-red-100" />
            <span>Blood Request Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time monitoring of emergency hospital requests and atomic donor reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, hospital, requester, or request ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / Pending</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Districts</option>
            {BANGLADESH_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading blood requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient / Case</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Hospital & Location</th>
                  <th className="py-3 px-4">Fulfillment Progress</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Required By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.patientName}</div>
                      <span className="text-[10px] text-slate-400">Requester: {req.requesterName}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-[#FCE8E8] text-[#C62828]">
                        {req.bloodGroup}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{req.hospitalName}</div>
                      <span className="text-[10px] text-slate-400">{req.upazila}, {req.district}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#C62828] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((req.unitsFulfilled || 0) / (req.unitsRequired || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900">{req.unitsFulfilled || 0} / {req.unitsRequired}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.emergencyLevel === 'immediate'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : req.emergencyLevel === 'within_24_hours'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                      }`}>
                        {req.emergencyLevel?.replace(/_/g, ' ') || 'scheduled'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div>{req.requiredDate}</div>
                      <div className="text-[10px] text-slate-400">{req.requiredTime}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No blood requests matched criteria.
          </div>
        )}
      </div>

    </div>
  );
};
