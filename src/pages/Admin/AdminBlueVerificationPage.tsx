import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Filter, 
  FileText, 
  Calendar, 
  MapPin, 
  Droplet, 
  AlertTriangle,
  History,
  ShieldX
} from 'lucide-react';
import { 
  getAdminVerificationApplications, 
  approveBlueVerification, 
  rejectBlueVerification, 
  revokeBlueBadge 
} from '@/src/services/admin/adminService';
import { getDonorCompletedDonations } from '@/src/services/verification/verificationService';
import { BlueVerificationApplication, DonationRecord } from '@/src/types';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const AdminBlueVerificationPage: React.FC = () => {
  const [applications, setApplications] = useState<BlueVerificationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // Selected application for detail review modal
  const [activeApp, setActiveApp] = useState<BlueVerificationApplication | null>(null);
  const [donorDonations, setDonorDonations] = useState<DonationRecord[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Revocation modal
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const list = await getAdminVerificationApplications();
      setApplications(list);
    } catch (err: any) {
      console.error('Fetch applications error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch verification queue.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenReview = async (app: BlueVerificationApplication) => {
    setActiveApp(app);
    setFeedback(null);
    setLoadingDonations(true);
    try {
      const list = await getDonorCompletedDonations(app.donorId);
      setDonorDonations(list);
    } catch (err) {
      console.warn('Error fetching donor donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleApprove = async (appId: string) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const result = await approveBlueVerification(appId);
      setFeedback({ type: 'success', message: result.message });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
      if (activeApp && activeApp.id === appId) {
        setActiveApp({ ...activeApp, status: 'approved' });
      }
    } catch (err: any) {
      console.error('Approve error:', err);
      setFeedback({ type: 'error', message: err.message || 'Approval rejected by eligibility engine.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteReject = async () => {
    if (!activeApp || !rejectReason.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const result = await rejectBlueVerification(activeApp.id, rejectReason.trim());
      setFeedback({ type: 'success', message: result.message });
      setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, status: 'rejected', rejectionReason: rejectReason } : a));
      setActiveApp({ ...activeApp, status: 'rejected', rejectionReason: rejectReason });
      setIsRejectModalOpen(false);
      setRejectReason('');
    } catch (err: any) {
      console.error('Reject error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to reject application.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteRevoke = async () => {
    if (!activeApp || !revokeReason.trim()) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const result = await revokeBlueBadge(activeApp.donorId, revokeReason.trim());
      setFeedback({ type: 'success', message: result.message });
      setApplications(prev => prev.map(a => a.id === activeApp.id ? { ...a, status: 'rejected', rejectionReason: `Revoked: ${revokeReason}` } : a));
      setActiveApp({ ...activeApp, status: 'rejected', rejectionReason: `Revoked: ${revokeReason}` });
      setIsRevokeModalOpen(false);
      setRevokeReason('');
    } catch (err: any) {
      console.error('Revoke error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to revoke badge.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        app.donorName?.toLowerCase().includes(q) ||
        app.district?.toLowerCase().includes(q) ||
        app.upazila?.toLowerCase().includes(q) ||
        app.donorId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#1D4ED8]" />
            <span>Blue Verification Review Center</span>
            <BlueVerifiedBadge size="sm" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative approval workflow. A strict minimum of <strong>3 verified completed blood donations</strong> is enforced server-side.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Review</span>
          <div className="text-2xl font-black text-amber-600">{pendingCount} Applications</div>
          <span className="text-[10px] text-slate-500 block">Pending administrative verification</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Badges</span>
          <div className="text-2xl font-black text-[#1D4ED8] flex items-center gap-2">
            <span>{approvedCount} Donors</span>
            <BlueVerifiedBadge size="xs" />
          </div>
          <span className="text-[10px] text-slate-500 block">Active Blue Verified voluntary donors</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Rule</span>
          <div className="text-sm font-extrabold text-slate-900 pt-1">3+ Verified Completed Bags</div>
          <span className="text-[10px] text-slate-500 block">Server-enforced policy</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name, location, or donor ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'approved' ? 'bg-[#1D4ED8] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'rejected' ? 'bg-stone-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading verification queue...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Applicant Donor</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verified Donations</th>
                  <th className="py-3 px-4">Application Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredApplications.map((app) => {
                  const isApproved = app.status === 'approved';
                  const isPending = app.status === 'pending' || app.status === 'under_review';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{app.donorName}</span>
                          {isApproved && <BlueVerifiedBadge size="xs" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{app.donorId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-[#FCE8E8] text-[#C62828]">
                          {app.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {app.upazila}, {app.district}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-sm ${
                            app.verifiedDonationCount >= 3 ? 'text-[#1D4ED8]' : 'text-amber-600'
                          }`}>
                            {app.verifiedDonationCount} Bags
                          </span>
                          {app.verifiedDonationCount >= 3 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {app.verifiedDonationCount >= 3 ? 'Meets requirement' : 'Below 3 threshold'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isApproved 
                            ? 'bg-blue-100 text-[#1D4ED8] border border-blue-200'
                            : isPending 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                        }`}>
                          {isApproved && <BlueVerifiedBadge size="xs" />}
                          <span className="capitalize">{app.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(app)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
                        >
                          Review Application &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No Blue Verification applications found matching criteria.
          </div>
        )}
      </div>

      {/* Detailed Review Modal */}
      {activeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center border border-blue-100 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{activeApp.donorName}</h3>
                    {activeApp.status === 'approved' && <BlueVerifiedBadge size="sm" />}
                  </div>
                  <p className="text-xs text-slate-500">
                    Location: {activeApp.upazila}, {activeApp.district} &bull; Blood Group: <strong>{activeApp.bloodGroup}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Application Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Status</span>
                <div className="text-xs font-bold text-slate-900 capitalize">{activeApp.status.replace('_', ' ')}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Verified Bags</span>
                <div className="text-xs font-extrabold text-[#1D4ED8]">{activeApp.verifiedDonationCount} Bags</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Required Threshold</span>
                <div className="text-xs font-bold text-slate-900">3 Bags Min</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Policy Status</span>
                <div className={`text-xs font-bold ${
                  activeApp.verifiedDonationCount >= 3 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {activeApp.verifiedDonationCount >= 3 ? 'Eligible' : 'Ineligible'}
                </div>
              </div>
            </div>

            {/* Applicant Statement & Evidence */}
            {activeApp.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Donor Notes / Hospital References</span>
                <p className="text-xs text-slate-700 leading-relaxed">{activeApp.notes}</p>
              </div>
            )}

            {/* Donation History Records */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Completed Donation Records ({donorDonations.length})</span>
                {loadingDonations && <span className="text-[10px] text-blue-600">Verifying records...</span>}
              </h4>

              {donorDonations.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {donorDonations.map((don, idx) => (
                    <div key={don.id || idx} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Droplet className="w-3.5 h-3.5 text-[#C62828] fill-red-100" />
                          <span>{don.hospitalName || 'Verified Blood Donation'}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {don.district} &bull; Date: {don.donationDate || 'Recorded'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {don.status || 'Verified Completed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-xs text-slate-400">
                  {loadingDonations ? 'Retrieving historical donation logs...' : 'No historical donation logs found in the donations collection.'}
                </div>
              )}
            </div>

            {/* Previous Rejection or Revocation Reason */}
            {activeApp.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-0.5">
                <span className="font-bold">Administrative Note / Reason:</span>
                <p>{activeApp.rejectionReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {activeApp.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={() => setIsRevokeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>Revoke Blue Badge</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-red-50 text-red-600 hover:border-red-200 text-xs font-bold transition-all shadow-2xs"
                    >
                      Reject with Reason
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(activeApp.id)}
                      disabled={actionLoading || activeApp.verifiedDonationCount < 3}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 active:scale-98"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{actionLoading ? 'Validating...' : 'Approve & Grant Blue Badge'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {isRejectModalOpen && activeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Reject Blue Verification Application</span>
            </h3>
            <p className="text-xs text-slate-600">
              Enter the specific reason for rejection. This explanation will be delivered directly to the donor and recorded in the immutable audit log.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Donation records could not be verified by hospital, or donation intervals were invalid..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-red-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Badge Dialog */}
      {isRevokeModalOpen && activeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-red-700 flex items-center gap-2">
              <ShieldX className="w-5 h-5 text-red-600" />
              <span>Revoke Blue Verified Badge</span>
            </h3>
            <p className="text-xs text-slate-600">
              Revoking removes the Blue Verified badge from public search and the donor's profile. A legitimate reason is mandatory (e.g. duplicate or disputed donation records).
            </p>

            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Enter mandatory revocation reason for audit trail..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-red-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRevokeModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRevoke}
                disabled={actionLoading || !revokeReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
