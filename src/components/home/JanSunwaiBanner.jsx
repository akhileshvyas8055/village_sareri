import React from 'react';
import { Link } from 'react-router-dom';
import {
  LuMessageSquareWarning,
  LuShieldCheck,
  LuArrowRight,
  LuPhoneCall,
  LuClock
} from 'react-icons/lu';

const JanSunwaiBanner = () => {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900 transition-colors border-t border-slate-200/60 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0D477A] via-[#09355C] to-[#0A2540] text-white p-6 sm:p-8 md:p-12 shadow-xl border border-blue-900/40">
          
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0D9488]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight leading-tight">
                आपकी समस्या, हमारी प्राथमिकता
              </h2>

              <p className="mt-3 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                गाँव से जुड़ी समस्या या सुझाव पंचायत तक पहुँचाएँ। स्वच्छता, सड़क, पानी, स्ट्रीट लाइट या विकास कार्यों से संबंधित किसी भी शिकायत का समयबद्ध समाधान पाएं।
              </p>
            </div>

            {/* Right Action Button */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/complaint"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F97316] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 min-h-[48px]"
                aria-label="Register Complaint"
              >
                <LuMessageSquareWarning className="w-5 h-5" />
                <span>Register Complaint</span>
                <LuArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/panchayat"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-colors backdrop-blur-sm min-h-[44px]"
              >
                <span>पंचायत संपर्क विवरण देखें</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default JanSunwaiBanner;
