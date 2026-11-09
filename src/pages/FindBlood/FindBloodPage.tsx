import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Droplet, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Lock, 
  ArrowRight, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  Heart,
  Filter
} from 'lucide-react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { searchPublicDonors } from '@/src/services/donors/donorSearchService';
import { calculateDonationEligibility } from '@/src/services/donors/donorService';
import { BANGLADESH_DISTRICTS, BLOOD_GROUPS, getUpazilasForDistrict } from '@/src/data/bangladeshLocations';
import { BloodGroup, PublicDonor } from '@/src/types';
import { useAuth } from '@/src/contexts/AuthContext';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const FindBloodPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Search parameters from URL or defaults
  const initialGroup = (searchParams.get('group') as BloodGroup) || '';
  const initialDistrict = searchParams.get('district') || 'Kushtia';
  const initialUpazila = searchParams.get('upazila') || '';

  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedUpazila, setSelectedUpazila] = useState<string>(initialUpazila);
  const [areaKeyword, setAreaKeyword] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [blueVerifiedOnly, setBlueVerifiedOnly] = useState<boolean>(false);

  // Results state
  const [donors, setDonors] = useState<PublicDonor[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [indexUrl, setIndexUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasExecutedSearch, setHasExecutedSearch] = useState<boolean>(false);

  // Sync with URL query parameter changes
  useEffect(() => {
    const groupParam = searchParams.get('group');
    if (groupParam && groupParam !== selectedGroup) {
      setSelectedGroup(groupParam);
    }
  }, [searchParams]);

  const upazilaOptions = selectedDistrict ? getUpazilasForDistrict(selectedDistrict) : [];

  // Handle District change: reset Upazila if not in new district
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedUpazila('');
  };

  // Perform search (fresh query)
  const executeSearch = useCallback(async (isFresh = true) => {
    if (isFresh) {
      setLoading(true);
      setDonors([]);
      setLastVisible(null);
    } else {
      setLoadingMore(true);
    }

    setErrorMessage(null);
    setIndexUrl(null);

    try {
      const result = await searchPublicDonors({
        bloodGroup: (selectedGroup as BloodGroup) || '',
        district: selectedDistrict,
        upazila: selectedUpazila,
        areaKeyword,
        availableOnly,
        blueVerifiedOnly,
        pageSize: 12,
        lastVisible: isFresh ? null : lastVisible
      });

      if (result.error) {
        setErrorMessage(result.error);
        if (result.indexUrl) {
          setIndexUrl(result.indexUrl);
        }
      } else {
        if (isFresh) {
          setDonors(result.donors);
        } else {
          setDonors(prev => [...prev, ...result.donors]);
        }
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
      }
    } catch (err: any) {
      console.warn('Search execution warning:', err);
      setErrorMessage('Could not execute donor search. Please check your connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setHasExecutedSearch(true);
    }
  }, [selectedGroup, selectedDistrict, selectedUpazila, areaKeyword, availableOnly, lastVisible]);

  // Initial search on mount or when blood group pre-fill from home changes
  useEffect(() => {
    executeSearch(true);
  }, [selectedGroup]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(true);
  };

  const handleResetFilters = () => {
    setSelectedGroup('');
    setSelectedDistrict('Kushtia');
    setSelectedUpazila('');
    setAreaKeyword('');
    setAvailableOnly(true);
    setSearchParams({});
    setErrorMessage(null);
    setIndexUrl(null);
  };

  return (
    <div className="bg-stone-50/50 min-h-screen py-10 sm:py-16 text-[#252525]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE8E8] text-[#C62828] text-xs font-semibold">
            <Droplet className="w-3.5 h-3.5 fill-[#C62828]" />
            <span>Voluntary Donor Search &bull; Privacy Protected</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            Find Blood Donors
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Search verified voluntary donors across Halsha, Kushtia, and all 64 districts in Bangladesh. Donor contact numbers remain shielded until an authorized request is submitted.
          </p>
        </div>

        {/* Search & Filter Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Blood Group Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Blood Group &bull; রক্তের গ্রুপ
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#C62828] focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">All Blood Groups (সবগুলো গ্রুপ)</option>
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  District &bull; জেলা
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">All Districts (সমগ্র বাংলাদেশ)</option>
                  {BANGLADESH_DISTRICTS.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {dist.name} ({dist.division})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Upazila &bull; উপজেলা
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  disabled={!selectedDistrict || upazilaOptions.length === 0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">All Upazilas (সব উপজেলা)</option>
                  {upazilaOptions.map((upz) => (
                    <option key={upz} value={upz}>
                      {upz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Keyword Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Area / Union &bull; এলাকা (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Halsha Bazar"
                  value={areaKeyword}
                  onChange={(e) => setAreaKeyword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
              </div>

            </div>

            {/* Availability & Blue Verification Checkboxes */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-[#C62828] rounded-sm border-gray-300 focus:ring-[#C62828]"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Only show donors available today (রক্তদানে প্রস্তুত)
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blueVerifiedOnly}
                    onChange={(e) => setBlueVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <BlueVerifiedBadge size="xs" />
                    <span>Blue Verified Only (৩+ বার রক্তদানকারী)</span>
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {(selectedGroup || selectedDistrict || selectedUpazila || areaKeyword || !availableOnly) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-[#C62828] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-sm shadow-md shadow-red-700/10 transition-all disabled:opacity-60 cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Searching...' : 'Apply Search'}</span>
                </button>
              </div>

            </div>

          </form>
        </div>

        {/* Index Diagnostic Alert if Firestore requires composite index */}
        {indexUrl && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Firestore Composite Index Required</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              This specific combination of Firestore filters requires a composite index to be created in your Firebase project. You can provision it in one click:
            </p>
            <a
              href={indexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Create Firestore Index in Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              Registered Voluntary Donors
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#C62828] text-xs font-bold">
              {donors.length} {donors.length === 1 ? 'Donor' : 'Donors'}
            </span>
          </div>

          <span className="text-xs text-gray-500 hidden sm:inline">
            Direct coordination enabled upon request submission
          </span>
        </div>

        {/* Results Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-gray-200 animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-md w-full" />
                <div className="h-10 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : errorMessage && !indexUrl ? (
          <div className="p-8 bg-rose-50 rounded-3xl border border-rose-200 text-center max-w-xl mx-auto space-y-3">
            <AlertCircle className="w-10 h-10 text-[#C62828] mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">Database Search Note</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{errorMessage}</p>
          </div>
        ) : donors.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map((donor) => {
                const eligibility = calculateDonationEligibility(
                  donor.lastDonationDate,
                  donor.gender
                );

                return (
                  <div 
                    key={donor.donorId}
                    className="bg-white rounded-3xl border border-gray-200/80 hover:border-rose-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Blood Group & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {donor.photoURL ? (
                            <img
                              src={donor.photoURL}
                              alt={donor.fullName}
                              className="w-12 h-12 rounded-2xl object-cover border border-rose-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#FCE8E8] text-[#C62828] font-black text-xl flex items-center justify-center shadow-2xs">
                              {donor.bloodGroup}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight flex items-center gap-1.5 flex-wrap">
                              <span>{donor.fullName}</span>
                              {donor.blueVerified && <BlueVerifiedBadge size="xs" />}
                            </h3>
                            <span className="text-xs text-gray-500 capitalize">
                              {donor.gender === 'male' ? 'Male / পুরুষ' : donor.gender === 'female' ? 'Female / মহিলা' : 'Donor'}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                          donor.isAvailable 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {donor.isAvailable ? 'Available' : 'Resting'}
                        </span>
                      </div>

                      {/* Location & Medical Details */}
                      <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                          <span className="font-medium text-gray-800">
                            {donor.upazila}, {donor.district}
                          </span>
                        </div>

                        {donor.area && (
                          <div className="flex items-center gap-2 pl-5 text-gray-500">
                            <span>Area: <strong>{donor.area}</strong></span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            Last Donation: {donor.lastDonationDate 
                              ? new Date(donor.lastDonationDate).toLocaleDateString() 
                              : 'First time donor'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Activity className={`w-3.5 h-3.5 shrink-0 ${eligibility.isEligible ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span className={eligibility.isEligible ? 'text-emerald-700 font-medium' : 'text-amber-800 font-medium'}>
                            {eligibility.isEligible 
                              ? 'Fit to donate today' 
                              : `Rest period (${eligibility.daysRemaining}d left)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Authorized Blood Request Flow */}
                    <div className="pt-3 border-t border-gray-100">
                      {user ? (
                        <Link
                          to={`/blood-request?donorId=${donor.donorId}&bloodGroup=${encodeURIComponent(donor.bloodGroup)}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          <Droplet className="w-3.5 h-3.5 fill-white" />
                          <span>Request This Donor</span>
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          state={{ from: { pathname: '/blood-request', search: `?donorId=${donor.donorId}&bloodGroup=${encodeURIComponent(donor.bloodGroup)}` } }}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-800 hover:text-[#C62828] font-semibold text-xs transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Sign in to Request</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => executeSearch(false)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm shadow-xs transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
                      <span>Loading more donors...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Donors</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Genuine live empty state */
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center mx-auto">
              <Droplet className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">
              No Registered Donors Matching Criteria
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              We found no voluntary donors matching {selectedGroup ? `Group ${selectedGroup}` : 'the criteria'} in {selectedUpazila ? `${selectedUpazila}, ` : ''}{selectedDistrict || 'this location'}.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/donor-registration"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs shadow-xs"
              >
                Be the First Donor Here
              </Link>
              <Link
                to="/blood-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs"
              >
                Post Emergency Blood Request
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
