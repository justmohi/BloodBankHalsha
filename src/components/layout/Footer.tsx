import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, MapPin, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-200 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm">
                <img src="/blood-drop-logo.svg" alt="Blood Bank Halsha logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  Blood Bank <span className="text-rose-400">Halsha</span>
                </span>
                <span className="text-xs text-stone-400 uppercase tracking-wider">
                  Donate Blood. Save Lives.
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed">
              A community-driven voluntary blood donation initiative connecting blood donors with patients across Halsha, Kushtia, and all 64 districts in Bangladesh.
            </p>

            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Halsha, Mirpur Upazila, Kushtia, Bangladesh</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/find-blood" className="text-stone-400 hover:text-rose-400 transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link to="/donor-registration" className="text-stone-400 hover:text-rose-400 transition-colors">
                  Register as a Donor
                </Link>
              </li>
              <li>
                <Link to="/blood-request" className="text-stone-400 hover:text-rose-400 transition-colors">
                  Emergency Blood Request
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-400 hover:text-white transition-colors">
                  About Blood Bank Halsha
                </Link>
              </li>
            </ul>
          </div>

          {/* Donor Criteria & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Eligibility & Guidelines
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Age between 18 and 60 years</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Weight 45kg (female) / 48kg (male) or above</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Minimum 90–120 days interval between donations</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>No major surgery in the last 6 months</span>
              </li>
            </ul>
          </div>

          {/* Emergency & Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Emergency Guidance
            </h4>
            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Immediate Medical Emergency?</span>
              </div>
              <p className="text-stone-400 leading-relaxed">
                If the patient requires urgent immediate resuscitation or ICU assistance, always contact hospital trauma centers or dial national emergency <strong>999</strong> directly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Blood Bank Halsha. All voluntary rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-stone-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/about" className="hover:text-stone-300 transition-colors">
              Voluntary Network
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
