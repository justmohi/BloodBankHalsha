import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Droplet, MapPin, Hospital, Phone, UserRound, AlertCircle } from 'lucide-react';
import { BloodRequest } from '@/src/types';
import { getBloodRequestDetails } from '@/src/services/requests/bloodRequestService';

export const BloodRequestDetailsPage: React.FC = () => {
  const { requestId = '' } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBloodRequestDetails(requestId)
      .then((data) => { if (active) setRequest(data); })
      .catch((err: any) => { if (active) setError(err.message || 'Unable to load request details.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [requestId]);

  const requiredDate = request?.requiredDate
    ? new Date(`${request.requiredDate}T${request.requiredTime || '00:00'}:00`).toLocaleString('en-BD', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'Not specified';

  if (loading) return <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6"><p className="text-sm text-gray-600">Loading blood request details...</p></main>;

  if (error || !request) return (
    <main className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto rounded-2xl border border-rose-200 bg-white p-7 space-y-4">
        <AlertCircle className="w-8 h-8 text-[#C62828]" />
        <h1 className="text-xl font-bold">Request details unavailable</h1>
        <p className="text-sm text-gray-600">{error || 'Blood request not found.'}</p>
        <Link to="/notifications" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C62828]"><ArrowLeft className="w-4 h-4" /> Back to Notifications</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-stone-50/70 py-8 sm:py-12 px-4 text-[#252525]">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/notifications" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#C62828]"><ArrowLeft className="w-4 h-4" /> Back to Notifications</Link>
        <section className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[#C62828]"><Droplet className="w-3.5 h-3.5" /> Blood Request Details</span>
              <h1 className="mt-3 text-2xl font-extrabold">{request.patientName || 'Patient'}</h1>
              <p className="mt-1 text-sm text-gray-500">Request ID: {request.id}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold capitalize text-amber-800">{String(request.status || 'pending').replaceAll('_', ' ')}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-rose-50 p-4"><p className="text-xs text-gray-500">Blood Group</p><p className="mt-1 text-2xl font-extrabold text-[#C62828]">{request.bloodGroup}</p></div>
            <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">Required Units</p><p className="mt-1 text-2xl font-extrabold">{request.unitsRequired}</p><p className="text-xs text-gray-500">Fulfilled: {request.unitsFulfilled || 0}</p></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex items-start gap-3"><UserRound className="w-5 h-5 text-[#C62828] mt-0.5" /><div><p className="text-xs text-gray-500">Patient Information</p><p className="font-semibold">{request.patientName}</p><p className="text-sm text-gray-600">Age: {request.patientAge ?? 'Not specified'} · Gender: {request.patientGender || 'Not specified'}</p></div></div>
            <div className="flex items-start gap-3"><Hospital className="w-5 h-5 text-[#C62828] mt-0.5" /><div><p className="text-xs text-gray-500">Hospital & Ward</p><p className="font-semibold">{request.hospitalName}</p><p className="text-sm text-gray-600">Ward: {request.notes || 'Not specified'}</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-[#C62828] mt-0.5" /><div><p className="text-xs text-gray-500">Location</p><p className="font-semibold">{[request.area, request.upazila, request.district].filter(Boolean).join(', ')}</p></div></div>
            <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-[#C62828] mt-0.5" /><div><p className="text-xs text-gray-500">Required Date & Time</p><p className="font-semibold">{requiredDate}</p><p className="text-xs text-gray-500 capitalize">{String(request.emergencyLevel || '').replaceAll('_', ' ')}</p></div></div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-2">
            <h2 className="font-bold">Requester Contact</h2>
            <p className="text-sm text-gray-600">{request.requesterName || 'Requester'}</p>
            {request.requesterPhone ? <a href={`tel:${request.requesterPhone}`} className="inline-flex items-center gap-2 font-semibold text-[#C62828]"><Phone className="w-4 h-4" /> {request.requesterPhone}</a> : <p className="text-sm text-gray-500">Phone number not provided.</p>}
          </div>

          <p className="text-xs text-gray-400">Created: {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Not available'}</p>
        </section>
      </div>
    </main>
  );
};
