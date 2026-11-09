import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Calendar, 
  Hospital, 
  Droplet,
  ShieldCheck
} from 'lucide-react';
import { getAdminDonations, verifyDonationRecord } from '@/src/services/admin/adminService';
import { DonationRecord } from '@/src/types';

export const AdminDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const list = await getAdminDonations();
      setDonations(list);
    } catch (err: any) {
      console.error('Fetch donations error:', err);
      setFeedback(err.message || 'Failed to fetch donation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleVerifyDonation = async (donationId: string) => {
    setActionLoadingId(donationId);
    try {
      await verifyDonationRecord(donationId, 'verified', 'Admin verified completed blood bag');
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: 'verified' } : d));
      setFeedback('Donation record verified successfully.');
    } catch (err: any) {
      console.error('Verify donation error:', err);
      setFeedback(err.message || 'Failed to verify donation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredDonations = donations.filter(don => {
    if (statusFilter !== 'all' && (don.status || 'completed') !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        don.donorName?.toLowerCase().includes(q) ||
        don.hospitalName?.toLowerCase().includes(q) ||
        don.district?.toLowerCase().includes(q) ||
        don.donorId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" />
            <span>Donation Records Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical voluntary blood donation logs, verification states, and medical eligibility records.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDonations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by donor name, hospital, location, or donor ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Records</option>
            <option value="verified">Verified Only</option>
            <option value="completed">Completed (Pending Verification)</option>
            <option value="disputed">Disputed Records</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading donation records...</p>
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Donor Reference</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Donation Date</th>
                  <th className="py-3 px-4">Hospital & District</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredDonations.map((don) => {
                  const isVerified = don.status === 'verified';
                  return (
                    <tr key={don.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{don.donorName || 'Registered Donor'}</div>
                        <span className="text-[10px] font-mono text-slate-400">{don.donorId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-[#FCE8E8] text-[#C62828]">
                          {don.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {don.donationDate ? new Date(don.donationDate).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{don.hospitalName}</div>
                        <span className="text-[10px] text-slate-400">{don.district}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isVerified ? 'Admin Verified' : 'Logged by Donor'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => handleVerifyDonation(don.id)}
                            disabled={actionLoadingId === don.id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Record</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No donation records match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
};
