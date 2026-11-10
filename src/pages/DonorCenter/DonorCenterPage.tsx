import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRound, Droplet, HeartHandshake, Bell, ArrowRight, PlusCircle } from 'lucide-react';

const shortcuts = [
  { title: 'Dashboard & Profile', description: 'View and manage your account and donor profile.', to: '/dashboard', icon: UserRound, tone: 'text-slate-700 bg-slate-100' },
  { title: 'My Blood Requests', description: 'Track the blood requests you have created.', to: '/my-requests', icon: Droplet, tone: 'text-red-600 bg-red-50' },
  { title: 'Incoming Blood Requests', description: 'View requests sent to you as a donor and respond to them.', to: '/dashboard#incoming-requests', icon: HeartHandshake, tone: 'text-rose-600 bg-rose-50' },
  { title: 'Notifications', description: 'See request updates, donor responses, and alerts.', to: '/notifications', icon: Bell, tone: 'text-slate-600 bg-slate-100' }
];

export const DonorCenterPage: React.FC = () => {
  const { user, donorProfile } = useAuth();

  return (
    <div className="min-h-[75vh] bg-stone-50/60 py-10 sm:py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-[#C62828] flex items-center justify-center text-xl font-bold">{user?.displayName?.charAt(0) || 'D'}</div>
          )}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C62828]">Blood Bank Halsha • Donor Center</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hello, {donorProfile?.fullName || user?.displayName || 'Donor'}</h1>
            <p className="text-sm text-gray-600 mt-1">Choose what you want to do. All your donor tools are here.</p>
          </div>
          {!donorProfile && (
            <Link to="/donor-registration" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C62828] px-4 py-3 text-sm font-bold text-white hover:bg-[#B71C1C]">
              <PlusCircle className="w-4 h-4" /> Complete Donor Registration
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortcuts.map(({ title, description, to, icon: Icon, tone }) => (
            <Link key={title} to={to} className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
              <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${tone}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 group-hover:text-[#C62828]">{title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
              </div>
              <ArrowRight className="w-5 h-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#C62828]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
