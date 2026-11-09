import React from 'react';
import { Droplet, Heart, Shield, Activity, Users } from 'lucide-react';

export const BloodDonationHeroGraphic: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center p-4">
      {/* Soft ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/40 via-red-100/30 to-amber-100/20 rounded-full blur-3xl -z-10" />

      {/* Main Vector Card Container */}
      <div className="relative w-full aspect-square max-w-[420px] bg-white rounded-3xl border border-rose-100 shadow-xl shadow-red-900/5 p-6 flex flex-col items-center justify-between overflow-hidden">
        
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between text-xs font-semibold z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-[#C62828] border border-rose-100">
            <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
            Active Voluntary Network
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Verified Matching
          </span>
        </div>

        {/* Central SVG Illustration */}
        <div className="relative my-auto flex flex-col items-center justify-center">
          <svg
            viewBox="0 0 240 240"
            className="w-56 h-56 drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circular pulse ring */}
            <circle cx="120" cy="120" r="100" stroke="#FCE8E8" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="120" cy="120" r="82" fill="#FFF5F5" />

            {/* Blood Bag outline */}
            <rect x="80" y="55" width="80" height="110" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
            {/* Blood Bag Top Tab */}
            <rect x="100" y="44" width="40" height="12" rx="4" fill="#CBD5E1" />
            <circle cx="120" cy="50" r="3" fill="#FFFFFF" />

            {/* Liquid Blood inside bag */}
            <path
              d="M83 110C83 110 95 105 110 108C125 111 135 106 145 109C154 111 157 110 157 110V151C157 157.627 151.627 163 145 163H95C88.3726 163 83 157.627 83 151V110Z"
              fill="#C62828"
            />
            {/* Liquid Highlight shimmer */}
            <path
              d="M90 120C90 120 95 118 105 120C115 122 125 118 135 120"
              stroke="#E53935"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Measurement lines on bag */}
            <line x1="88" y1="85" x2="100" y2="85" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="88" y1="95" x2="108" y2="95" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="88" y1="105" x2="100" y2="105" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

            {/* Heart symbol on bag */}
            <g transform="translate(110, 126)">
              <path
                d="M10 3.25C6.5 -1 0 1.5 0 6.5C0 11.5 10 18 10 18C10 18 20 11.5 20 6.5C20 1.5 13.5 -1 10 3.25Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </g>

            {/* Tubing coming out from blood bag bottom */}
            <path
              d="M120 165V185C120 195 105 200 105 210C105 218 115 224 125 224"
              stroke="#C62828"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Blood Drop at tube outlet */}
            <path
              d="M125 212C125 212 135 222 135 228C135 233.523 130.523 238 125 238C119.477 238 115 233.523 115 228C115 222 125 212 125 212Z"
              fill="#C62828"
            />

            {/* Sparkles / life indicators */}
            <circle cx="180" cy="80" r="4" fill="#EF4444" opacity="0.4" />
            <circle cx="60" cy="130" r="3" fill="#F87171" opacity="0.5" />
            <circle cx="185" cy="160" r="5" fill="#DC2626" opacity="0.3" />
          </svg>

          {/* Floating Pill: Halsha & Kushtia */}
          <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-xs border border-rose-100 shadow-md rounded-2xl p-2.5 px-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Focus Hub</span>
              <span className="text-xs font-bold text-gray-800">Halsha, Mirpur & Beyond</span>
            </div>
          </div>

          {/* Floating Pill: Rapid Connection */}
          <div className="absolute -top-1 -right-2 bg-white/95 backdrop-blur-xs border border-rose-100 shadow-md rounded-2xl p-2.5 px-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#C62828] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-[#C62828]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Impact</span>
              <span className="text-xs font-bold text-gray-800">1 Bag = Up to 3 Lives</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Label */}
        <div className="w-full pt-3 border-t border-rose-50 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Droplet className="w-3.5 h-3.5 text-[#C62828]" />
            Every Drop Counts
          </span>
          <span className="font-semibold text-gray-700">100% Free & Community-Led</span>
        </div>
      </div>
    </div>
  );
};
