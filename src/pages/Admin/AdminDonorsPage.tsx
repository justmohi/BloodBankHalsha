import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Filter, 
  MapPin, 
  Droplet, 
  ShieldCheck, 
  Activity, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { getAdminDonors, updateDonorSearchVisibility } from '@/src/services/admin/adminService';
import { PublicDonor, BloodGroup } from '@/src/types';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';
import { BANGLADESH_DISTRICTS, BLOOD_GROUPS } from '@/src/data/bangladeshLocations';

export const AdminDonorsPage: React.FC = () => {
  const [donors, setDonors] = useState<PublicDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDonors = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await getAdminDonors({
        search,
        bloodGroup: selectedGroup || undefined,
        district: selectedDistrict || undefined,
        blueVerified: verifiedOnly || undefined
      });
      setDonors(list);
    } catch (err: any) {
      console.error('Fetch donors error:', err);
      setErrorMsg(err.message || 'Failed to fetch donors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedDistrict, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleToggleVisibility = async (donor: PublicDonor) => {
    setActionLoadingId(donor.donorId);
    setErrorMsg(null);
    const nextVisibility = !donor.searchVisibility;

    try {
      await updateDonorSearchVisibility(
        donor.donorId, 
        nextVisibility, 
        `Admin adjusted search visibility to ${nextVisibility}`
      );
      setDonors(prev => prev.map(d => d.donorId === donor.donorId ? { ...d, searchVisibility: nextVisibility } : d));
    } catch (err: any) {
      console.error('Visibility update error:', err);
      setErrorMsg(err.message || 'Failed to update visibility.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="w-7 h-7 text-[#C62828]" />
            <span>Donor Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered voluntary blood donors, Blue Verification statuses, and public search visibility controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDonors}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donors by name, area, or location..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Districts</option>
            {BANGLADESH_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <BlueVerifiedBadge size="xs" />
              <span>Blue Verified Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading voluntary donors...</p>
          </div>
        ) : donors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Donor Name & Status</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Donation Records</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Search Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {donors.map((donor) => {
                  const isVisible = donor.searchVisibility !== false;
                  return (
                    <tr key={donor.donorId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {donor.photoURL ? (
                            <img src={donor.photoURL} alt={donor.fullName} className="w-9 h-9 rounded-full object-cover border border-rose-100 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#C62828] text-white font-bold flex items-center justify-center shrink-0">
                              {donor.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{donor.fullName}</span>
                              {donor.blueVerified && <BlueVerifiedBadge size="xs" />}
                            </div>
                            <span className={`text-[10px] font-bold ${
                              donor.isAvailable ? 'text-emerald-700' : 'text-stone-500'
                            }`}>
                              {donor.isAvailable ? 'Available' : 'Resting'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-[#FCE8E8] text-[#C62828]">
                          {donor.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {donor.upazila}, {donor.district}
                        </div>
                        {donor.area && <span className="text-[10px] text-slate-400">Area: {donor.area}</span>}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{donor.totalDonations || 0} Bags</span>
                        <div className="text-[10px] text-slate-400">
                          Verified: {donor.verifiedDonationCount || (donor.blueVerified ? 3 : 0)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {donor.blueVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-[#1D4ED8] border border-blue-200">
                            <BlueVerifiedBadge size="xs" />
                            <span>Blue Verified</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unverified</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVisible 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isVisible ? 'Public in Search' : 'Hidden from Search'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(donor)}
                          disabled={actionLoadingId === donor.donorId}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            isVisible 
                              ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isVisible ? 'Hide' : 'Restore'}</span>
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
            No donors found matching the selected filters.
          </div>
        )}
      </div>

    </div>
  );
};
