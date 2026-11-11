import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, Loader2, Save, UserRound } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getPrivateDonor } from '@/src/services/donors/donorService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/services/firebase/firebase';
import { updateAccountProfile } from '@/src/services/auth/authService';

export const AccountSettingsPage: React.FC = () => {
  const { user, userProfile, isDonor, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(isDonor);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    if (user) {
      const loadContact = isDonor
        ? getPrivateDonor(user.uid).then((profile) => profile?.mobileNumber || '')
        : getDoc(doc(db, 'userPrivate', user.uid)).then((snap) => snap.exists() ? snap.data().mobileNumber || '' : '');
      loadContact.then((number) => {
        if (active && number) setPhoneNumber(number);
      }).finally(() => { if (active) setLoadingPhone(false); });
    } else {
      setLoadingPhone(false);
    }
    return () => { active = false; };
  }, [isDonor, user]);

  const handlePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be 5 MB or smaller.'); return; }
    setPhotoFile(file);
    setPhotoURL(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await updateAccountProfile({ displayName, phoneNumber, photoFile });
      await refreshProfile();
      setSuccess('Your account profile has been updated.');
      setPhotoFile(null);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err: any) {
      setError(err.message || 'Could not update your account profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-[75vh] bg-stone-50/70 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#C62828] mb-5"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
        <section className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-rose-50 to-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-[#C62828] flex items-center justify-center"><UserRound className="w-6 h-6" /></div>
              <div><h1 className="text-2xl font-extrabold text-gray-900">Account Settings</h1><p className="text-sm text-gray-600 mt-1">Update your name, profile photo and contact number.</p></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {photoURL ? <img src={photoURL} alt="Profile preview" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" /> : <div className="w-28 h-28 rounded-full bg-rose-100 text-[#C62828] flex items-center justify-center text-3xl font-bold">{displayName.charAt(0) || 'U'}</div>}
                <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#C62828] text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#B71C1C]" title="Change profile photo">
                  <Camera className="w-4 h-4" /><input type="file" accept="image/*" className="sr-only" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                </label>
              </div>
              <p className="text-xs text-gray-500">Profile photo · JPG, PNG or WebP · Maximum 5 MB</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="account-name" className="block text-sm font-semibold text-gray-700">Full Name</label>
              <input id="account-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={80} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C62828] focus:ring-2 focus:ring-rose-100" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="account-email" className="block text-sm font-semibold text-gray-700">Google Email</label>
              <input id="account-email" value={user.email || ''} readOnly className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500" />
              <p className="text-xs text-gray-500">Email is managed by Google and cannot be changed here.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="account-phone" className="block text-sm font-semibold text-gray-700">Mobile Number</label>
              <input id="account-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} maxLength={20} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C62828] focus:ring-2 focus:ring-rose-100" placeholder="e.g. 01XXXXXXXXX" />
              <p className="text-xs text-gray-500">{isDonor ? 'Stored in your private donor profile and never shown in public donor search.' : 'Used for blood request coordination. Only share a number you are comfortable being contacted on.'}</p>
              {loadingPhone && <p className="text-xs text-gray-400">Loading saved donor contact...</p>}
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Link to="/dashboard" className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading || loadingPhone} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#C62828] px-5 py-3 text-sm font-bold text-white hover:bg-[#B71C1C] disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};
