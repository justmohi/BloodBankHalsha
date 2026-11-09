import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Hospital, 
  Plus, 
  Ban, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  User,
  Phone
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  subscribeToMyBloodRequests, 
  cancelBloodRequest 
} from '@/src/services/requests/bloodRequestService';
import { BloodRequest, RequestStatus } from '@/src/types';

export const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelModalReq, setCancelModalReq] = useState<BloodRequest | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToMyBloodRequests(
      user.uid,
      (fetched) => {
        setRequests(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time listener warning:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleOpenCancelModal = (req: BloodRequest) => {
    setCancelModalReq(req);
    setCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalReq) return;

    setCancelling(true);
    setCancelError(null);

    try {
      await cancelBloodRequest(cancelModalReq.id, cancelReason);
      setCancelModalReq(null);
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setCancelError(err.message || 'Failed to cancel blood request.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: RequestStatus, fulfilled: number, required: number) => {
    switch (status) {
      case 'pending':
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Donors</span>
          </span>
        );
      case 'partially_fulfilled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Partially Reserved ({fulfilled}/{required})</span>
          </span>
        );
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fully Reserved</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            <XCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Expired</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-50/50 min-h-screen py-10 sm:py-16 text-[#252525]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE8E8] text-[#C62828] text-xs font-semibold">
              <Droplet className="w-3.5 h-3.5 fill-[#C62828]" />
              <span>Real-time Request Tracking</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#252525] tracking-tight">
              My Blood Requests
            </h1>
            <p className="text-xs text-gray-500">
              Track donor reservations, hospital logistics, and request statuses in real time.
            </p>
          </div>

          <Link
            to="/blood-request"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs shadow-md shadow-red-700/10 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Request</span>
          </Link>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-gray-200 animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 rounded-md w-1/4" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-5">
            {requests.map((req) => {
              const canCancel = req.status === 'pending' || req.status === 'open';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-7 space-y-5 hover:border-rose-100 transition-all"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FCE8E8] text-[#C62828] font-black text-xl flex items-center justify-center shadow-2xs">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {req.patientName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {req.patientGender} &bull; Age: {req.patientAge || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(req.status, req.unitsFulfilled, req.unitsRequired)}

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        req.emergencyLevel === 'immediate'
                          ? 'bg-red-100 text-red-700'
                          : req.emergencyLevel === 'within_24_hours'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                      }`}>
                        {req.emergencyLevel === 'immediate' 
                          ? 'Immediate' 
                          : req.emergencyLevel === 'within_24_hours' 
                            ? 'Within 24h' 
                            : 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-700">
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-medium">Hospital & Ward:</span>
                      <span className="font-semibold text-gray-900 block truncate">{req.hospitalName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block font-medium">Location:</span>
                      <span className="font-semibold text-gray-900 block">{req.upazila}, {req.district}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block font-medium">Required Units:</span>
                      <span className="font-bold text-[#C62828] block">
                        {req.unitsFulfilled} of {req.unitsRequired} {req.unitsRequired === 1 ? 'Unit' : 'Units'} Fulfilled
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block font-medium">Required Date & Time:</span>
                      <span className="font-semibold text-gray-900 block">
                        {req.requiredDate} at {req.requiredTime}
                      </span>
                    </div>
                  </div>

                  {/* Multi-unit Progress Bar if partially fulfilled */}
                  {req.unitsRequired > 1 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Fulfillment Progress</span>
                        <span>{Math.round((req.unitsFulfilled / req.unitsRequired) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div 
                          className="h-full bg-[#C62828] transition-all duration-300"
                          style={{ width: `${Math.min(100, (req.unitsFulfilled / req.unitsRequired) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Row / Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                    <div className="text-gray-400">
                      Created on {new Date(req.createdAt).toLocaleDateString()} &bull; ID: <span className="font-mono">{req.id.slice(0, 8)}...</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/find-blood?group=${encodeURIComponent(req.bloodGroup)}`}
                        className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-stone-50 hover:bg-stone-100 text-gray-700 font-semibold transition-colors"
                      >
                        Search More Donors
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(req)}
                          className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition-colors cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 bg-white rounded-3xl border border-gray-200/80 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center mx-auto">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No Blood Requests Yet</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You haven&apos;t posted any emergency blood requests. When you or a family member needs blood, create a request here to notify voluntary donors.
            </p>
            <div className="pt-2">
              <Link
                to="/blood-request"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Blood Request</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-gray-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Cancel Blood Request?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to cancel the request for <strong>{cancelModalReq.patientName}</strong> ({cancelModalReq.bloodGroup})? Voluntary donors will no longer be notified.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {cancelError}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Reason for Cancellation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Blood arranged from family donor"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelModalReq(null)}
                className="w-1/2 py-3 rounded-xl border border-gray-200 font-semibold text-xs text-gray-700 hover:bg-gray-50"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
