import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 text-[#252525]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: November 2026 &bull; Blood Bank Halsha
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">1. Principle of Voluntary Isolation</h2>
            <p>
              Blood Bank Halsha is built on a strict privacy model. Public donor search profiles do <strong>not</strong> display your direct mobile number or full physical address. Contact details are maintained exclusively in protected Firestore documents (<code>donorPrivate</code>) and are shielded from web scrapers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Authentication profile (Name, Email, Profile Avatar from Google Sign-In)</li>
              <li>Voluntary donor information (Blood Group, District, Upazila, Area, Last Donation Date)</li>
              <li>Protected contact number provided during voluntary donor registration</li>
              <li>Emergency request details (Hospital name, patient blood group, units required)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">3. Non-Commercial Guarantee</h2>
            <p>
              We do not sell, rent, monetize, or disclose your contact information to third-party telemarketers or advertisers. All data is exclusively used for voluntary blood donor coordination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">4. Your Control and Removal</h2>
            <p>
              You can toggle your donation availability or remove your donor listing at any time via your user dashboard.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
