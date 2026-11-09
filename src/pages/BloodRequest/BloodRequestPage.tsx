import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ShieldAlert, 
  Droplet, 
  Hospital, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ArrowRight,
  Flame,
  Info
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { submitBloodRequest, validateRequestDate } from '@/src/services/requests/bloodRequestService';
import { BANGLADESH_DISTRICTS, BLOOD_GROUPS, getUpazilasForDistrict } from '@/src/data/bangladeshLocations';
import { BloodGroup, EmergencyLevel } from '@/src/types';

interface RequestFormData {
  patientName: string;
  patientAge?: number;
  patientGender: 'male' | 'female' | 'child';
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalName: string;
  district: string;
  upazila: string;
  area?: string;
  requiredDate: string;
  requiredTime: string;
  requesterPhone: string;
  emergencyLevel: EmergencyLevel;
  notes?: string;
}

const todayStr = new Date().toISOString().split('T')[0];

const requestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required / রোগীর নাম আবশ্যক').max(100),
  patientAge: z.coerce.number().min(0).max(120).optional(),
  patientGender: z.enum(['male', 'female', 'child']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    message: 'Please select blood group / রক্তের গ্রুপ নির্বাচন করুন'
  }),
  unitsRequired: z.coerce.number().min(1, 'At least 1 unit is required').max(10, 'Maximum 10 units per request'),
  hospitalName: z.string().min(3, 'Hospital name is required / হাসপাতালের নাম আবশ্যক').max(150),
  district: z.string().min(1, 'Please select district / জেলা নির্বাচন করুন'),
  upazila: z.string().min(1, 'Please select upazila / উপজেলা নির্বাচন করুন'),
  area: z.string().optional(),
  requiredDate: z.string().min(1, 'Required date is required / রক্তের প্রয়োজনীয় তারিখ আবশ্যক').refine(
    (val) => validateRequestDate(val),
    { message: 'Required date cannot be in the past / প্রয়োজনীয় তারিখ অতীত হতে পারে না' }
  ),
  requiredTime: z.string().min(1, 'Time is required / সময় আবশ্যক'),
  requesterPhone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Enter valid Bangladesh mobile number / সঠিক বাংলাদেশী মোবাইল নম্বর দিন'),
  emergencyLevel: z.enum(['immediate', 'within_24_hours', 'scheduled']),
  notes: z.string().max(500).optional(),
});

export const BloodRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<RequestFormData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetDonorId = searchParams.get('donorId');
  const initialGroup = (searchParams.get('bloodGroup') as BloodGroup) || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      bloodGroup: initialGroup || undefined,
      unitsRequired: 1,
      district: 'Kushtia',
      upazila: 'Mirpur (Halsha)',
      emergencyLevel: 'within_24_hours',
      patientGender: 'male',
      requiredDate: todayStr,
      requiredTime: '12:00'
    }
  });

  const selectedDistrict = watch('district');
  const selectedUrgency = watch('emergencyLevel');
  const upazilaOptions = selectedDistrict ? getUpazilasForDistrict(selectedDistrict) : [];

  const onSubmit = async (data: RequestFormData) => {
    if (!user) {
      setErrorMsg('Please sign in with Google to post an emergency blood request.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await submitBloodRequest({
        ...data,
        targetDonorId
      });

      setSubmittedRequestId(response.requestId);
      setSubmittedDetails(data);
    } catch (err: any) {
      console.error('Request creation error:', err);
      setErrorMsg(err.message || 'Failed to submit blood request. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequestId && submittedDetails) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Blood Request Submitted!
            </h2>
            <p className="text-sm text-gray-600">
              Your request has been broadcasted to the voluntary donor network.
            </p>
          </div>

          {/* Reference Info Card */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-gray-100 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 text-xs">
              <span className="text-gray-500 font-semibold">Reference ID:</span>
              <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                {submittedRequestId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Patient Name:</span>
                <span className="font-bold text-gray-900">{submittedDetails.patientName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Blood Group:</span>
                <span className="font-bold text-[#C62828] text-sm">{submittedDetails.bloodGroup}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Hospital:</span>
                <span className="font-semibold text-gray-800">{submittedDetails.hospitalName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Location:</span>
                <span className="font-medium text-gray-800">{submittedDetails.upazila}, {submittedDetails.district}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Required Units:</span>
                <span className="font-bold text-gray-900">{submittedDetails.unitsRequired} {submittedDetails.unitsRequired === 1 ? 'Unit' : 'Units'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Required Date:</span>
                <span className="font-medium text-gray-800">{submittedDetails.requiredDate} at {submittedDetails.requiredTime}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/my-requests"
              className="px-6 py-3.5 rounded-xl bg-[#C62828] text-white font-semibold text-sm hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              Go to My Requests Dashboard
            </Link>
            <Link
              to={`/find-blood?group=${encodeURIComponent(submittedDetails.bloodGroup)}`}
              className="px-6 py-3.5 rounded-xl bg-gray-100 text-gray-800 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Search Voluntary Donors
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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Emergency Patient Request &bull; জরুরি রক্তের আবেদন</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            Create Blood Request
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Post an urgent patient requirement to the voluntary donor network. Please ensure all medical hospital details and contact numbers are accurate.
          </p>
        </div>

        {/* Auth Barrier */}
        {!user && (
          <div className="mb-8 p-6 bg-rose-50/80 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#C62828] shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Sign in Required</p>
                <p className="text-xs text-gray-600">Signing in prevents fraudulent requests and enables direct donor response coordination.</p>
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

        {/* Target Donor Notice if coming from Find Blood */}
        {targetDonorId && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-[#C62828] fill-[#C62828] shrink-0" />
              <span>
                <strong>Direct Donor Request:</strong> Targeting voluntary donor for <strong>{initialGroup || 'blood donation'}</strong>. Upon submission, an instant notification will be dispatched to their donor inbox.
              </span>
            </div>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-200/60 text-[#C62828] px-2 py-0.5 rounded-md shrink-0">
              Direct Target
            </span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Patient Name & Gender & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Patient Full Name &bull; রোগীর নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abdul Karim"
                  {...register('patientName')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                {errors.patientName && (
                  <p className="text-red-600 text-xs mt-1">{errors.patientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Patient Gender &bull; রোগীর লিঙ্গ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('patientGender')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="male">Male / পুরুষ</option>
                  <option value="female">Female / মহিলা</option>
                  <option value="child">Child / শিশু</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Patient Age &bull; বয়স (Years)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  min="0"
                  max="120"
                  {...register('patientAge')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Blood Group, Units & Emergency Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Blood Group &bull; রক্তের গ্রুপ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('bloodGroup')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-red-700 bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select Group</option>
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
                  Units Required (Bags) &bull; ব্যাগ সংখ্যা <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  {...register('unitsRequired')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Between 1 and 10 units.
                </span>
                {errors.unitsRequired && (
                  <p className="text-red-600 text-xs mt-1">{errors.unitsRequired.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Emergency Priority &bull; অগ্রাধিকার <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('emergencyLevel')}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100 ${
                    selectedUrgency === 'immediate' 
                      ? 'text-red-700 bg-red-50/40' 
                      : selectedUrgency === 'within_24_hours' 
                        ? 'text-amber-800' 
                        : 'text-gray-800'
                  }`}
                >
                  <option value="immediate">Immediate / অতি জরুরি</option>
                  <option value="within_24_hours">Within 24 Hours / ২৪ ঘণ্টার মধ্যে</option>
                  <option value="scheduled">Scheduled / নিয়মিত তারিখ</option>
                </select>
              </div>
            </div>

            {/* Hospital & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Hospital Name &bull; হাসপাতাল <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kushtia General Hospital"
                  {...register('hospitalName')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                {errors.hospitalName && (
                  <p className="text-red-600 text-xs mt-1">{errors.hospitalName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  District &bull; জেলা <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('district')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select District</option>
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Upazila &bull; উপজেলা <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('upazila')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Select Upazila</option>
                  {upazilaOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Phone, Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Contact Mobile &bull; মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 017xxxxxxxx"
                  {...register('requesterPhone')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Direct number for donors who accept.
                </span>
                {errors.requesterPhone && (
                  <p className="text-red-600 text-xs mt-1">{errors.requesterPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Required Date &bull; তারিখ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  {...register('requiredDate')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
                {errors.requiredDate && (
                  <p className="text-red-600 text-xs mt-1">{errors.requiredDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Required Time &bull; সময় <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register('requiredTime')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Additional Notes &bull; অতিরিক্ত তথ্য
              </label>
              <textarea
                rows={3}
                placeholder="Mention hospital bed number, ward, or attending doctor instruction..."
                {...register('notes')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !user}
                className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-base shadow-md shadow-red-700/15 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting Request...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-white" />
                    <span>Broadcast Blood Request</span>
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
