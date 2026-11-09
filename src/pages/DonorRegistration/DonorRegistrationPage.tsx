import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Droplet, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Lock,
  ArrowRight,
  Camera,
  X,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { 
  registerOrUpdateDonor, 
  getPublicDonor, 
  getPrivateDonor, 
  calculateDonationEligibility,
  EligibilityResult
} from '@/src/services/donors/donorService';
import { BANGLADESH_DISTRICTS, BLOOD_GROUPS, getUpazilasForDistrict } from '@/src/data/bangladeshLocations';
import { BloodGroup, PublicDonor, DonorPrivate } from '@/src/types';

interface DonorFormData {
  fullName: string;
  mobileNumber: string;
  bloodGroup: BloodGroup;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  district: string;
  upazila: string;
  area?: string;
  lastDonationDate?: string;
  isAvailable: boolean;
  agreedToTerms: boolean;
}

const todayStr = new Date().toISOString().split('T')[0];

const donorSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters / পুরো নাম কমপক্ষে ৩ অক্ষর হতে হবে').max(100),
  mobileNumber: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Enter valid Bangladesh mobile number (e.g. 017xxxxxxxx) / সঠিক বাংলাদেশী মোবাইল নম্বর দিন'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    message: 'Please select blood group / রক্তের গ্রুপ নির্বাচন করুন'
  }),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().min(1, 'Date of birth is required / জন্ম তারিখ আবশ্যক').refine((val) => {
    if (!val) return false;
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18 && age <= 65;
  }, {
    message: 'Donor must be between 18 and 65 years old to donate blood safely / রক্তদাতার বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে'
  }),
  district: z.string().min(1, 'Please select your district / জেলা নির্বাচন করুন'),
  upazila: z.string().min(1, 'Please select your upazila / উপজেলা নির্বাচন করুন'),
  area: z.string().max(100).optional(),
  lastDonationDate: z.string().optional().refine((val) => {
    if (!val) return true;
    return val <= todayStr;
  }, {
    message: 'Last donation date cannot be in the future / পূর্ববর্তী রক্তদানের তারিখ ভবিষ্যতের হতে পারে না'
  }),
  isAvailable: z.boolean(),
  agreedToTerms: z.literal(true, { 
    message: 'You must agree to the voluntary donor pledge / আপনাকে রক্তদান নীতিমালায় সম্মতি জানাতে হবে' 
  })
});

export const DonorRegistrationPage: React.FC = () => {
  const { user, donorProfile: existingAuthDonor, refreshProfile, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isExistingDonor, setIsExistingDonor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<PublicDonor | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema) as any,
    defaultValues: {
      fullName: user?.displayName || '',
      isAvailable: true,
      district: 'Kushtia',
      upazila: 'Mirpur (Halsha)',
      gender: 'male',
      agreedToTerms: true
    }
  });

  const selectedDistrict = watch('district');
  const watchedLastDonation = watch('lastDonationDate');
  const watchedGender = watch('gender');
  const upazilaOptions = selectedDistrict ? getUpazilasForDistrict(selectedDistrict) : [];

  // Calculate live eligibility
  const eligibility: EligibilityResult = calculateDonationEligibility(
    watchedLastDonation,
    watchedGender || 'male'
  );

  // Load existing profile if registered
  useEffect(() => {
    let isMounted = true;

    const checkExistingProfile = async () => {
      if (!user) {
        setInitialLoading(false);
        return;
      }

      try {
        const publicDoc = await getPublicDonor(user.uid);
        const privateDoc = await getPrivateDonor(user.uid);

        if (publicDoc && isMounted) {
          setIsExistingDonor(true);
          setPhotoPreview(publicDoc.photoURL || user.photoURL || null);

          // Populate form fields
          reset({
            fullName: publicDoc.fullName || user.displayName || '',
            mobileNumber: privateDoc?.mobileNumber || '',
            bloodGroup: publicDoc.bloodGroup,
            gender: publicDoc.gender || 'male',
            dateOfBirth: privateDoc?.dateOfBirth || '',
            district: publicDoc.district || 'Kushtia',
            upazila: publicDoc.upazila || 'Mirpur (Halsha)',
            area: publicDoc.area || '',
            lastDonationDate: publicDoc.lastDonationDate ? publicDoc.lastDonationDate.split('T')[0] : '',
            isAvailable: publicDoc.isAvailable,
            agreedToTerms: true
          });
        } else if (isMounted) {
          setPhotoPreview(user.photoURL || null);
          setValue('fullName', user.displayName || '');
        }
      } catch (err) {
        console.warn('Error reading existing donor profile:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    checkExistingProfile();

    return () => {
      isMounted = false;
    };
  }, [user, reset, setValue]);

  // Handle photo file selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('Profile photo must be smaller than 3MB / ছবির সাইজ ৩ মেগাবাইটের কম হতে হবে');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const removeSelectedPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(user?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: DonorFormData) => {
    if (!user) {
      setErrorMessage('Please sign in with Google to complete registration.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await registerOrUpdateDonor({
        donorId: user.uid,
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        bloodGroup: data.bloodGroup,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        district: data.district,
        upazila: data.upazila,
        area: data.area,
        lastDonationDate: data.lastDonationDate || null,
        isAvailable: data.isAvailable,
        photoFile,
        existingPhotoURL: photoPreview
      });

      await refreshProfile();
      setRegisteredResult(result.publicProfile);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setErrorMessage(
        err.message || 'Failed to save donor profile. Please verify your connection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center animate-pulse">
          <Droplet className="w-6 h-6 fill-[#C62828]" />
        </div>
        <p className="text-sm font-semibold text-gray-600">
          Checking donor registry status...
        </p>
      </div>
    );
  }

  // Success view with actual registered details
  if (submitSuccess && registeredResult) {
    const nextEligible = calculateDonationEligibility(
      registeredResult.lastDonationDate,
      registeredResult.gender
    );

    return (
      <div className="min-h-screen bg-stone-50/50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isExistingDonor ? 'Donor Profile Updated!' : 'Donor Registration Complete!'}
            </h2>
            <p className="text-sm text-gray-600">
              {isExistingDonor
                ? 'Your voluntary donor profile information has been saved successfully.'
                : 'Thank you for joining Blood Bank Halsha. You are now registered as an active lifesaver.'}
            </p>
          </div>

          {/* Actual Registered Information Card */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 text-left space-y-3">
            <div className="flex items-center gap-3">
              {registeredResult.photoURL ? (
                <img
                  src={registeredResult.photoURL}
                  alt={registeredResult.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-rose-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#C62828] text-white font-bold flex items-center justify-center">
                  {registeredResult.bloodGroup}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900">{registeredResult.fullName}</h4>
                <p className="text-xs text-gray-500">
                  {registeredResult.upazila}, {registeredResult.district}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/80">
              <div>
                <span className="text-gray-500">Blood Group:</span>
                <span className="ml-1 font-bold text-[#C62828]">{registeredResult.bloodGroup}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-1 font-bold text-emerald-700">
                  {registeredResult.isAvailable ? 'Available' : 'Resting'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Donation:</span>
                <span className="ml-1 font-medium text-gray-800">
                  {registeredResult.lastDonationDate
                    ? new Date(registeredResult.lastDonationDate).toLocaleDateString()
                    : 'None recorded'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Eligibility:</span>
                <span className="ml-1 font-medium text-gray-800">
                  {nextEligible.isEligible ? 'Eligible today' : `Resting (${nextEligible.daysRemaining}d)`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[#C62828] text-white font-semibold text-sm hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              Go to Donor Dashboard
            </Link>
            <Link
              to="/find-blood"
              className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              View Donor Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 py-10 sm:py-16 text-[#252525]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCE8E8] text-[#C62828] text-xs font-semibold">
            <Droplet className="w-3.5 h-3.5 fill-[#C62828]" />
            <span>Voluntary Life Saver Registration &bull; Halsha Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            {isExistingDonor ? 'Update Donor Profile' : 'Become a Voluntary Blood Donor'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            {isExistingDonor 
              ? 'Review and keep your blood donation availability, location, and contact details up to date.'
              : 'Join the voluntary lifesaver network in Halsha, Kushtia, and nationwide. Your mobile number remains strictly shielded from public search.'}
          </p>
        </div>

        {/* Existing Profile Info Notice */}
        {isExistingDonor && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Existing Profile Detected:</span> Your registered details have been loaded. Any changes you make will update your existing profile without creating duplicates.
            </div>
          </div>
        )}

        {/* Auth Required Barrier */}
        {!user && (
          <div className="mb-8 p-6 bg-rose-50/80 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C62828] shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Google Sign-in Required</p>
                <p className="text-xs text-gray-600">Sign in to bind your voluntary donor registration with your secure account.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#C62828] text-white font-semibold text-xs hover:bg-[#B71C1C] transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-10">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Profile Photo Picker */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-rose-100/60 text-[#C62828] flex items-center justify-center font-bold">
                    <User className="w-10 h-10" />
                  </div>
                )}
                {photoFile && (
                  <button
                    type="button"
                    onClick={removeSelectedPhoto}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                    title="Remove custom photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Donor Profile Photo (Optional / ঐচ্ছিক)
                </label>
                <p className="text-xs text-gray-500">
                  Upload a clear portrait or use your default Google profile picture. Max 3MB (JPEG/PNG/WebP).
                </p>
                <div className="pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="donor-photo-input"
                  />
                  <label
                    htmlFor="donor-photo-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#C62828]" />
                    <span>{photoFile ? 'Change Photo' : 'Upload Custom Photo'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Full Name & Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Full Name &bull; পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mohammad Rahim"
                  {...register('fullName')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Mobile Number &bull; মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 017xxxxxxxx"
                  {...register('mobileNumber')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Protected in /donorPrivate; never exposed in public searches.
                </span>
                {errors.mobileNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.mobileNumber.message}</p>
                )}
              </div>
            </div>

            {/* Blood Group, Gender, DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Blood Group &bull; রক্তের গ্রুপ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('bloodGroup')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-red-700 bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-600 text-xs mt-1">{errors.bloodGroup.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Gender &bull; লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="male">Male / পুরুষ</option>
                  <option value="female">Female / মহিলা</option>
                  <option value="other">Other / অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Date of Birth &bull; জন্ম তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={todayStr}
                  {...register('dateOfBirth')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Must be between 18 and 65 years.
                </span>
                {errors.dateOfBirth && (
                  <p className="text-red-600 text-xs mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            {/* Location (District & Upazila & Area) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  District &bull; জেলা <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('district')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select District</option>
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.division})
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-600 text-xs mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Upazila &bull; উপজেলা <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('upazila')}
                  disabled={!selectedDistrict || upazilaOptions.length === 0}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white disabled:bg-gray-50 focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select Upazila</option>
                  {upazilaOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {errors.upazila && (
                  <p className="text-red-600 text-xs mt-1">{errors.upazila.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Area / Village &bull; এলাকা
                </label>
                <input
                  type="text"
                  placeholder="e.g. Halsha Bazar / Union"
                  {...register('area')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Last Donation Date & Live Eligibility Calculation */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                    Last Whole Blood Donation Date &bull; পূর্ববর্তী রক্তদানের তারিখ
                  </label>
                  <p className="text-xs text-gray-500">
                    Leave empty if you have not donated blood before / প্রথমবার রক্তদানকারী হলে ফাঁকা রাখুন।
                  </p>
                </div>
                <input
                  type="date"
                  max={todayStr}
                  {...register('lastDonationDate')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
              </div>
              {errors.lastDonationDate && (
                <p className="text-red-600 text-xs">{errors.lastDonationDate.message}</p>
              )}

              {/* Dynamic Medical Eligibility Badge */}
              <div className="pt-2 border-t border-stone-200 flex items-start gap-2 text-xs">
                {eligibility.isEligible ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Eligible to donate now (সরাসরি রক্তদানে উপযুক্ত)</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-amber-800 font-medium leading-relaxed">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Mandatory recovery interval active ({eligibility.daysRemaining} days remaining). Next eligible to donate on <strong>{eligibility.formattedNextDate}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Donation Availability Toggle */}
            <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isAvailable')}
                  className="w-5 h-5 mt-0.5 text-[#C62828] rounded-md border-gray-300 focus:ring-[#C62828]"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-900 block">
                    Available for Donation &bull; রক্তদানে প্রস্তুত
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed block">
                    Your profile will be shown as active in voluntary search. You can toggle this off anytime from your dashboard during illness or travel.
                  </span>
                </div>
              </label>
            </div>

            {/* Terms and Privacy Pledge */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('agreedToTerms')}
                  className="w-5 h-5 mt-0.5 text-[#C62828] rounded-md border-gray-300 focus:ring-[#C62828]"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-800 block">
                    Voluntary Lifesaver Pledge &bull; স্বেচ্ছাসেবী অঙ্গীকার
                  </span>
                  <span className="text-xs text-gray-500 leading-relaxed block">
                    I pledge to participate in voluntary, non-commercial blood donation for patients in need. I confirm that all submitted details are authentic and that my contact number is protected according to Blood Bank Halsha privacy protocols.
                  </span>
                </div>
              </label>
              {errors.agreedToTerms && (
                <p className="text-red-600 text-xs mt-1">{errors.agreedToTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !user}
                className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-base shadow-md shadow-red-700/15 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Donor Information...</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-5 h-5 fill-white" />
                    <span>
                      {isExistingDonor ? 'Update Donor Profile' : 'Complete Voluntary Donor Registration'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
