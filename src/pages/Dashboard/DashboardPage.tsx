import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  HeartHandshake, 
  Plus, 
  LogOut,
  ShieldCheck, 
  Edit3, 
  Phone, 
  Lock, 
  Activity,
  Send,
  HelpCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/services/firebase/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  getPublicDonor, 
  getPrivateDonor, 
  updateDonorAvailability, 
  calculateDonationEligibility,
  EligibilityResult
} from '@/src/services/donors/donorService';
import { 
  getDonorVerificationApplication, 
  submitBlueVerificationApplication, 
  getDonorCompletedDonations 
} from '@/src/services/verification/verificationService';
import { 
  getIncomingDonorRequests, 
  acceptBloodRequest, 
  declineBloodRequest 
} from '@/src/services/requests/bloodRequestService';
import { BloodRequest, PublicDonor, DonorPrivate, BlueVerificationApplication, DonationRecord } from '@/src/types';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const DashboardPage: React.FC = () => {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [donorProfile, setDonorProfile] = useState<PublicDonor | null>(null);
  const [privateInfo, setPrivateInfo] = useState<DonorPrivate | null>(null);
  const [verificationApp, setVerificationApp] = useState<BlueVerificationApplication | null>(null);
  const [donorDonations, setDonorDonations] = useState<DonationRecord[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user's blood requests
        const reqQuery = query(collection(db, 'bloodRequests'), where('requesterId', '==', user.uid));
        const reqSnap = await getDocs(reqQuery);
        const reqs: BloodRequest[] = [];
        reqSnap.forEach((d) => reqs.push({ id: d.id, ...(d.data() as any) }));
        setMyRequests(reqs);

        // 2. Fetch public and private donor profiles
        const publicDoc = await getPublicDonor(user.uid);
        const privDoc = await getPrivateDonor(user.uid);
        setDonorProfile(publicDoc);
        setPrivateInfo(privDoc);

        // 3. Fetch Blue Verification status, donations, and incoming requests
        if (publicDoc) {
          const [appData, donList, incomingList] = await Promise.all([
            getDonorVerificationApplication(user.uid),
            getDonorCompletedDonations(user.uid),
            getIncomingDonorRequests().catch(() => [])
          ]);
          setVerificationApp(appData);
          setDonorDonations(donList);
          setIncomingRequests(incomingList);
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const refreshIncomingRequests = async () => {
    try {
      setLoadingIncoming(true);
      const incoming = await getIncomingDonorRequests();
      setIncomingRequests(incoming);
    } catch (err) {
      console.warn('Failed to refresh incoming requests:', err);
    } finally {
      setLoadingIncoming(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionInProgressId(requestId);
    setActionNotice(null);
    try {
      const res = await acceptBloodRequest(requestId);
      setActionNotice({ type: 'success', text: res.message || 'Donation confirmed! Units fulfilled updated.' });
      await refreshIncomingRequests();
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Failed to accept blood request.' });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setActionInProgressId(requestId);
    setActionNotice(null);
    try {
      await declineBloodRequest(requestId);
      setActionNotice({ type: 'success', text: 'Blood request declined. Other voluntary donors will be notified.' });
      await refreshIncomingRequests();
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Failed to decline blood request.' });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleToggleAvailability = async () => {
    if (!user || !donorProfile) return;
    setTogglingAvailability(true);
    try {
      const nextStatus = !donorProfile.isAvailable;
      await updateDonorAvailability(user.uid, nextStatus);
      setDonorProfile({ ...donorProfile, isAvailable: nextStatus });
      await refreshProfile();
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleApplyBlueVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingApp(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const result = await submitBlueVerificationApplication({
        notes: applyNotes.trim()
      });
      setApplySuccess(result.message);
      setVerificationApp(result.application);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Submit application error:', err);
      setApplyError(err.message || 'Failed to submit verification application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const eligibility: EligibilityResult = calculateDonationEligibility(
    donorProfile?.lastDonationDate,
    donorProfile?.gender || 'male'
  );

  const completedDonationCount = donorDonations.length > 0 
    ? donorDonations.length 
    : (donorProfile?.totalDonations || 0);

  const isEligibleForBlue = completedDonationCount >= 3;
  const remainingDonations = Math.max(0, 3 - completedDonationCount);

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 text-center space-y-4">
          <Droplet className="w-12 h-12 text-[#C62828] mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Sign in to Access Dashboard</h2>
          <p className="text-sm text-gray-600">Please sign in with Google to view and manage your blood requests.</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#C62828] text-white text-sm font-semibold hover:bg-[#B71C1C]"
          >
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-10 sm:py-14 text-[#252525]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {donorProfile?.photoURL || user.photoURL ? (
              <img
                src={donorProfile?.photoURL || user.photoURL || ''}
                alt={user.displayName || 'Member'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-100 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#C62828] text-white font-black text-2xl flex items-center justify-center shadow-md">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{donorProfile?.fullName || user.displayName || 'Member'}</h1>
                {donorProfile?.blueVerified && (
                  <BlueVerifiedBadge size="sm" showLabel />
                )}
                {donorProfile && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#C62828] text-xs font-bold">
                    Donor: {donorProfile.bloodGroup}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/account-settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-rose-50/50 hover:border-[#C62828]/30 text-gray-800 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#C62828]" />
              Edit Account Profile
            </Link>

            <Link
              to="/blood-request"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] text-white text-xs font-semibold hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              New Blood Request
            </Link>

            {donorProfile ? (
              <Link
                to="/donor-registration?edit=true"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-rose-50/50 hover:border-[#C62828]/30 text-gray-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C62828]" />
                Edit Donor Profile
              </Link>
            ) : (
              <Link
                to="/donor-registration"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-[#C62828] text-xs font-semibold border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <Droplet className="w-4 h-4" />
                Become a Donor
              </Link>
            )}

            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Full Donor Profile Card if registered */}
        {donorProfile ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FCE8E8] text-[#C62828] font-black text-xl flex items-center justify-center shadow-2xs">
                  {donorProfile.bloodGroup}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>Voluntary Donor Details</span>
                    {donorProfile.blueVerified && <BlueVerifiedBadge size="xs" />}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      donorProfile.isAvailable 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {donorProfile.isAvailable ? 'Available to Donate' : 'Currently Resting'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Location: {donorProfile.upazila}, {donorProfile.district} {donorProfile.area ? `(${donorProfile.area})` : ''}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingAvailability}
                  onClick={handleToggleAvailability}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    donorProfile.isAvailable
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {togglingAvailability 
                    ? 'Updating...' 
                    : donorProfile.isAvailable 
                      ? 'Switch to Resting' 
                      : 'Switch to Available'}
                </button>

                <Link
                  to="/donor-registration?edit=true"
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Donor Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block">
                  Eligibility Status
                </span>
                <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Activity className={`w-4 h-4 ${eligibility.isEligible ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span>{eligibility.isEligible ? 'Eligible today' : `Resting (${eligibility.daysRemaining}d left)`}</span>
                </div>
                {eligibility.formattedNextDate && !eligibility.isEligible && (
                  <span className="text-[10px] text-gray-500 block">
                    Next eligible: {eligibility.formattedNextDate}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block">
                  Last Donation
                </span>
                <div className="text-sm font-bold text-gray-900">
                  {donorProfile.lastDonationDate 
                    ? new Date(donorProfile.lastDonationDate).toLocaleDateString() 
                    : 'First-time Donor'}
                </div>
                <span className="text-[10px] text-gray-500 block">
                  Recorded in voluntary log
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block">
                  Total Completed Bags
                </span>
                <div className="text-sm font-bold text-[#C62828]">
                  {completedDonationCount} {completedDonationCount === 1 ? 'Bag' : 'Bags'}
                </div>
                <span className="text-[10px] text-gray-500 block">
                  Life-saving impact
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Protected Mobile
                </span>
                <div className="text-sm font-bold text-gray-800">
                  {privateInfo?.mobileNumber || 'Not recorded'}
                </div>
                <span className="text-[10px] text-emerald-700 block">
                  Shielded from public search
                </span>
              </div>
            </div>

            {/* BLUE VERIFICATION SYSTEM SECTION */}
            <div className="pt-4 border-t border-gray-100">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/30 p-5 sm:p-6 space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center shrink-0 shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          Official Blue Verification Status
                        </h4>
                        {donorProfile.blueVerified && <BlueVerifiedBadge size="sm" />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5 max-w-xl">
                        Awarded to voluntary donors with at least <strong>3 verified completed blood donations</strong>. Displays the official Blue Badge across public donor search and profile results.
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {donorProfile.blueVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#1D4ED8] text-white shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Blue Verified Lifesaver</span>
                      </span>
                    ) : verificationApp?.status === 'pending' || verificationApp?.status === 'under_review' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Application Pending Review</span>
                      </span>
                    ) : verificationApp?.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <span>Not Applied</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar towards 3 donations */}
                <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      Verified Completed Donations: <strong className="text-[#1D4ED8] text-sm">{completedDonationCount} / 3 Bags</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isEligibleForBlue ? (
                        <span className="text-emerald-700 font-bold">Eligibility Achieved!</span>
                      ) : (
                        <span>{remainingDonations} more required</span>
                      )}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (completedDonationCount / 3) * 100)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    * Health Policy: Donations must respect medically safe intervals (90 days for male donors, 120 days for female donors). Never donate more frequently than medically recommended.
                  </p>
                </div>

                {/* Apply Button / Pending confirmation */}
                {!donorProfile.blueVerified && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    {isEligibleForBlue ? (
                      verificationApp?.status === 'pending' || verificationApp?.status === 'under_review' ? (
                        <p className="text-xs text-amber-700 font-medium">
                          Your application was received on {new Date(verificationApp.submissionDate).toLocaleDateString()}. Halsha administrators are reviewing hospital verification records.
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-emerald-800 font-medium">
                            You have completed {completedDonationCount} verified blood donations! You are eligible to apply for your official Blue Verified badge.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsApplyModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Apply for Blue Verification</span>
                          </button>
                        </>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          Complete {remainingDonations} more life-saving blood donation{remainingDonations > 1 ? 's' : ''} to unlock the official Blue Verified badge.
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* Non-donor prompt banner */
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-3xl p-6 sm:p-8 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900">
                You are not yet registered as a voluntary blood donor
              </h3>
              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                Register your blood group and location to join the lifesaver network in Halsha, Kushtia, and across Bangladesh. Your phone number is kept strictly isolated.
              </p>
            </div>
            <Link
              to="/donor-registration"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C62828] text-white font-bold text-xs hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              <Droplet className="w-4 h-4 fill-white" />
              Become a Donor
            </Link>
          </div>
        )}

        {/* Incoming Emergency Requests for Registered Donor */}
        {donorProfile && (
          <div id="incoming-requests" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-[#C62828]" />
                  <span>Incoming Blood Requests For You</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Direct emergency requests targeted to you or matching your {donorProfile.bloodGroup} group in {donorProfile.district}.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshIncomingRequests}
                disabled={loadingIncoming}
                className="text-xs font-semibold text-gray-600 hover:text-[#C62828] cursor-pointer"
              >
                {loadingIncoming ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Action Notice Banner */}
            {actionNotice && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
                actionNotice.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{actionNotice.text}</span>
              </div>
            )}

            {incomingRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingRequests.map((req) => {
                  const isFulfilled = (req.unitsFulfilled || 0) >= (req.unitsRequired || 1);
                  const isProcessing = actionInProgressId === req.id;
                  return (
                    <div 
                      key={req.id} 
                      className="p-6 bg-white rounded-3xl border border-rose-200/80 shadow-xs space-y-4 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#C62828] text-white font-black text-xl flex items-center justify-center shadow-xs">
                            {req.bloodGroup}
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              req.emergencyLevel === 'critical' 
                                ? 'bg-red-600 text-white animate-pulse' 
                                : req.emergencyLevel === 'urgent' 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                  : 'bg-stone-100 text-stone-700'
                            }`}>
                              {req.emergencyLevel} Priority
                            </span>
                            <h3 className="font-bold text-gray-900 text-base mt-1">Patient: {req.patientName}</h3>
                          </div>
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                          {req.unitsFulfilled || 0} / {req.unitsRequired} Bags
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
                        <p className="flex items-center gap-1.5 text-gray-800 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                          <span>{req.hospitalName} ({req.upazila}, {req.district})</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>Required by: <strong>{req.requiredDate}</strong> at {req.requiredTime}</span>
                        </p>
                        {req.requesterPhone && (
                          <p className="flex items-center gap-1.5 text-emerald-800 font-bold pt-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Contact Requester: {req.requesterPhone}</span>
                          </p>
                        )}
                        {req.notes && (
                          <p className="text-[11px] text-gray-500 italic pt-0.5">
                            &ldquo;{req.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Atomic Booking Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing || isFulfilled}
                          onClick={() => handleAcceptRequest(req.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-98"
                        >
                          <Droplet className="w-3.5 h-3.5 fill-white" />
                          <span>{isProcessing ? 'Confirming...' : isFulfilled ? 'Fulfilled' : 'Accept & Reserve 1 Bag'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-gray-200 text-center space-y-2">
                <HeartHandshake className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-gray-700">No Pending Direct Requests</p>
                <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                  When a nearby patient or hospital requests {donorProfile.bloodGroup} blood, the request will appear here for one-click reservation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Blood Requests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Emergency Blood Requests</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{myRequests.length} recorded</span>
              <Link
                to="/my-requests"
                className="text-xs font-bold text-[#C62828] hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 bg-white rounded-3xl border border-gray-200 animate-pulse text-center">
              <p className="text-sm text-gray-500">Loading your blood requests...</p>
            </div>
          ) : myRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div key={req.id} className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {req.bloodGroup} Needed
                      </span>
                      <h3 className="font-bold text-gray-900 mt-1">{req.patientName}</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase">
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p>Hospital: <strong>{req.hospitalName}</strong></p>
                    <p>Location: {req.upazila}, {req.district}</p>
                    <p>Units: {req.unitsFulfilled} / {req.unitsRequired} fulfilled</p>
                    <p>Required By: {req.requiredDate} at {req.requiredTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
              <Droplet className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-700">No Blood Requests Created Yet</p>
              <p className="text-xs text-gray-500">
                When you post an emergency blood request, you can monitor donor acceptances and hospital coordination here.
              </p>
              <Link
                to="/blood-request"
                className="inline-block mt-2 px-5 py-2 rounded-xl bg-[#C62828] text-white text-xs font-semibold hover:bg-[#B71C1C]"
              >
                Create Request
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Blue Verification Application Modal */}
      {isApplyModalOpen && donorProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1D4ED8] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Apply for Blue Verification Badge
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Verification for Voluntary Donors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Donor Name:</span>
                <span>{donorProfile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Blood Group:</span>
                <strong className="text-[#C62828]">{donorProfile.bloodGroup}</strong>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span>{donorProfile.upazila}, {donorProfile.district}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-blue-100 font-bold text-blue-900">
                <span>Verified Completed Bags:</span>
                <span>{completedDonationCount} Bags (Eligible)</span>
              </div>
            </div>

            <form onSubmit={handleApplyBlueVerification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Donation Experience / Hospital References (Optional)
                </label>
                <textarea
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="e.g. Regular voluntary blood donor at Kushtia General Hospital and Halsha health camps..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {applyError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {applySuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{applySuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingApp ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
