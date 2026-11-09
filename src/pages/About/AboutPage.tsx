import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, ShieldCheck, MapPin, Users, Activity, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 text-[#252525]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCE8E8] text-[#C62828] text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-[#C62828]" />
            <span>Community Voluntary Network</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#252525] tracking-tight">
            About Blood Bank Halsha
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A voluntary initiative connecting blood donors with patients across Halsha, Kushtia, and all 64 districts of Bangladesh.
          </p>
        </div>

        {/* Narrative */}
        <div className="prose prose-stone max-w-none space-y-6 text-gray-700 leading-relaxed">
          <div className="p-8 rounded-3xl bg-stone-50 border border-gray-200/80 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-[#C62828]" />
              Our Origins in Halsha, Kushtia
            </h2>
            <p>
              Blood Bank Halsha was conceptualized in <strong>Halsha</strong>, a historic union and railway hub situated under <strong>Mirpur Upazila in Kushtia District, Khulna Division</strong>. In many regional communities, finding compatible blood during emergencies—whether for maternity care, road accidents, or thalassemic treatment—often depended on stressful social media posts or fragmented phone trees.
            </p>
            <p>
              To solve this communication bottleneck, Blood Bank Halsha bridges patients with voluntary donors using real-time search, transparent compatibility mapping, and atomic request dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white text-[#C62828] flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#C62828]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Zero Commercialization</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We believe blood is a gift of life, not a commodity. We never charge money, trade blood units, or permit commercial brokering on this platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white text-[#C62828] flex items-center justify-center font-bold shadow-2xs">
                <Users className="w-5 h-5 text-[#C62828]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Privacy-First Architecture</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Voluntary donors deserve peace of mind. Mobile contact details are stored in isolated private collections and only shared when a donor consents.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-[#FCE8E8] border border-rose-200 text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Join the Movement</h3>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Whether you are residing in Halsha, Kushtia Sadar, or anywhere across Bangladesh, your voluntary pledge can give someone another birthday.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/donor-registration"
              className="px-6 py-3 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-sm transition-colors"
            >
              Become a Donor
            </Link>
            <Link
              to="/find-blood"
              className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm border border-gray-200 transition-colors"
            >
              Search Donors
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
