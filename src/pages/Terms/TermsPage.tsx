import React from 'react';
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 text-[#252525]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Community Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#252525] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: November 2026 &bull; Blood Bank Halsha
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">1. Voluntary Purpose</h2>
            <p>
              Blood Bank Halsha facilitates voluntary communication between blood donors and recipients. It is not a licensed medical facility, blood storage center, or diagnostic laboratory. All donations must be tested and transfused under the supervision of qualified medical professionals at certified medical institutions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">2. Prohibition of Commercial Transactions</h2>
            <p>
              The sale or purchase of human blood is strictly prohibited. Demanding money, broker commissions, or commercial exchange for blood donation via this platform is a direct violation of Bangladeshi law and platform rules, leading to immediate account termination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">3. Emergency Medical Disclaimer</h2>
            <p>
              While this platform strives to rapidly connect patients with donors, we cannot guarantee donor availability or immediate response during emergency conditions. In case of life-critical trauma, always inform hospital emergency personnel and dial national emergency 999.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
