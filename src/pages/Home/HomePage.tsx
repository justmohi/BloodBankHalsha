import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Search, 
  UserPlus, 
  ShieldAlert, 
  HeartHandshake, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  FileText, 
  Lock,
  Sparkles
} from 'lucide-react';
import { BloodDonationHeroGraphic } from '@/src/components/common/BloodDonationHeroGraphic';
import { BloodGroup } from '@/src/types';

interface BloodGroupMeta {
  group: BloodGroup;
  canGiveTo: string;
  canReceiveFrom: string;
  tag?: string;
}

const BLOOD_GROUPS_DATA: BloodGroupMeta[] = [
  { group: 'A+', canGiveTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-' },
  { group: 'A-', canGiveTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-' },
  { group: 'B+', canGiveTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-' },
  { group: 'B-', canGiveTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-' },
  { group: 'O+', canGiveTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-' },
  { group: 'O-', canGiveTo: 'All Blood Types', canReceiveFrom: 'O-', tag: 'Universal Donor' },
  { group: 'AB+', canGiveTo: 'AB+ only', canReceiveFrom: 'All Blood Types', tag: 'Universal Recipient' },
  { group: 'AB-', canGiveTo: 'AB+, AB-', canReceiveFrom: 'AB-, A-, B-, O-' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGroupSelect = (group: BloodGroup) => {
    navigate(`/find-blood?group=${encodeURIComponent(group)}`);
  };

  return (
    <div className="bg-white text-[#252525]">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8E8] border border-rose-200 text-xs font-semibold text-[#C62828]">
                <Droplet className="w-4 h-4 fill-[#C62828]" />
                <span>Voluntary Blood Network &bull; Halsha, Kushtia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#252525] tracking-tight leading-[1.12]">
                Donate Blood. <br className="hidden sm:inline" />
                <span className="text-[#C62828]">Save Lives.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connecting voluntary blood donors with people who need blood across Bangladesh.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/find-blood"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-base shadow-lg shadow-red-700/20 active:scale-98 transition-all"
                >
                  <Search className="w-5 h-5" />
                  Find Blood
                </Link>

                <Link
                  to="/donor-registration"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#FCE8E8] hover:bg-rose-100/90 text-[#C62828] border border-rose-200 font-semibold text-base transition-all active:scale-98"
                >
                  <UserPlus className="w-5 h-5 text-[#C62828]" />
                  Become a Donor
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commitment</div>
                  <div className="text-sm font-bold text-gray-900">100% Voluntary</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Privacy</div>
                  <div className="text-sm font-bold text-gray-900">Contact Protected</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coverage</div>
                  <div className="text-sm font-bold text-gray-900">64 Districts</div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <BloodDonationHeroGraphic />
            </div>

          </div>
        </div>
      </section>

      {/* 2. BLOOD GROUP SECTION */}
      <section className="py-16 sm:py-20 bg-stone-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-[#252525] sm:text-4xl">
              Search by Blood Group
            </h2>
            <p className="text-base text-gray-600">
              Select any of the eight human blood groups to search for available voluntary donors in your district.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {BLOOD_GROUPS_DATA.map((item) => (
              <button
                key={item.group}
                type="button"
                onClick={() => handleGroupSelect(item.group)}
                className="group relative flex flex-col items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-[#C62828] hover:shadow-md hover:shadow-red-700/10 transition-all duration-200 text-left cursor-pointer focus:outline-hidden"
              >
                {item.tag && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#C62828] text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap shadow-2xs">
                    {item.tag === 'Universal Donor' ? 'Universal' : 'Universal Rx'}
                  </span>
                )}

                <div className="w-12 h-12 rounded-2xl bg-[#FCE8E8] group-hover:bg-[#C62828] text-[#C62828] group-hover:text-white flex items-center justify-center font-black text-xl transition-colors duration-200 shadow-2xs">
                  {item.group}
                </div>

                <div className="mt-3 text-center w-full">
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-[#C62828] transition-colors">
                    Find {item.group}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    Gives: {item.canGiveTo}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 w-full flex items-center justify-center text-[11px] font-semibold text-[#C62828] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Search</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/find-blood"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C62828] hover:underline"
            >
              <span>Explore all search filters (District, Upazila & Availability)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. EMERGENCY BLOOD REQUEST SECTION */}
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-red-700 via-[#C62828] to-red-900 text-white overflow-hidden shadow-xl p-8 sm:p-12">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-black/10 blur-xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-red-100 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Urgent Patient Support
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Facing an Urgent Blood Emergency?
                </h2>

                <p className="text-red-100 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Post an urgent request directly to the Blood Bank Halsha platform. Nearby voluntary donors in Kushtia and across Bangladesh will be notified instantly without delay.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-red-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Real-time Donor Notifications</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Multi-unit Tracking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Hospital Coordination</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-3">
                <Link
                  to="/blood-request"
                  className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-rose-50 text-[#C62828] font-bold text-base shadow-lg transition-all active:scale-98"
                >
                  <ShieldAlert className="w-5 h-5 text-[#C62828]" />
                  Request Blood Now
                </Link>

                <p className="text-center text-xs text-red-200 mt-1">
                  Requires member sign-in to prevent false alerts.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-16 sm:py-20 bg-stone-50/60 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
              Transparent & Simple
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#252525] sm:text-4xl">
              How Blood Bank Halsha Works
            </h2>
            <p className="text-base text-gray-600">
              Three streamlined steps designed to connect patients with ready donors safely and promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs hover:border-rose-200 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center font-bold">
                    <Search className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-extrabold text-stone-200">01</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  Find a Blood Donor
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Search through registered voluntary donors by selecting blood group, division, district, and upazila (such as Halsha, Mirpur, Kushtia).
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Donor phone numbers are shielded until confirmed</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs hover:border-rose-200 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-extrabold text-stone-200">02</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  Send a Blood Request
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Specify hospital details, patient urgency, number of blood units needed, and required time to initiate an organized request.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Atomic booking prevents duplicate promises</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs hover:border-rose-200 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-extrabold text-stone-200">03</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  Connect and Save a Life
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Voluntary donors review the request and accept. Verified communication is enabled to coordinate hospital arrival and donation.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                <Droplet className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                <span>100% voluntary, compassionate human care</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. DONOR REGISTRATION CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#FCE8E8] border border-rose-200 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#C62828] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Be Someone&apos;s Lifesaver</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] tracking-tight">
                Are You Ready to Save Lives?
              </h2>

              <p className="text-base text-gray-700 leading-relaxed">
                Voluntary blood donors are the backbone of community healthcare. Register your blood group and location today. When a patient in your area needs blood, your willingness can save a life.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-gray-600 pt-1">
                <span>&bull; Takes less than 2 minutes</span>
                <span>&bull; No public exposure of your phone number</span>
                <span>&bull; Free voluntary participation</span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link
                to="/donor-registration"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-base shadow-lg shadow-red-700/20 active:scale-98 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Become a Donor
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="py-16 sm:py-20 bg-stone-50/70 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
                About the Network
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-[#252525] tracking-tight">
                About Blood Bank Halsha
              </h2>

              <p className="text-base text-gray-700 leading-relaxed">
                Blood Bank Halsha began with a singular compassionate vision: no patient in Halsha, Mirpur, Kushtia, or neighboring districts should struggle to find blood during life-critical emergencies.
              </p>

              <p className="text-base text-gray-700 leading-relaxed">
                Operating entirely on voluntary principles, this platform connects generous voluntary donors directly with patients, families, and attending medical professionals. We do not charge fees, trade blood units, or commercialize the gift of life.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-200/80">
                  <h4 className="font-bold text-gray-900 text-sm">Community Focused</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Grounded in local communities with deep roots in Halsha & Kushtia.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-200/80">
                  <h4 className="font-bold text-gray-900 text-sm">Privacy by Architecture</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Strict isolation of donor contact records to eliminate spam and unauthorized access.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-8 space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C62828]" />
                  Local Roots, Nationwide Reach
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  While our primary hub is rooted in <strong>Halsha, Mirpur Upazila, Kushtia District</strong>, our technical infrastructure supports all 64 districts in Bangladesh. Whether an emergency occurs in Kushtia Sadar, Kumarkhali, Dhaka, or Chattogram, donors and families can mobilize rapidly.
                </p>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/80 space-y-2">
                  <span className="text-xs font-bold text-[#C62828] uppercase tracking-wide">
                    Our Core Principles
                  </span>
                  <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                    <li>100% voluntary and unpaid blood donation</li>
                    <li>Zero commercial middleman involvement</li>
                    <li>Equitable access regardless of patient background</li>
                    <li>Rigorous protection of voluntary donor privacy</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>In service to humanity since inception</span>
                  <Link to="/about" className="text-[#C62828] font-bold hover:underline">
                    Read our full story &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
