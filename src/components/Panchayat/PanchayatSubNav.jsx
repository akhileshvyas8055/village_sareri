import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiActivity, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const PanchayatSubNav = ({ variant = 'bar' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sections = [
    {
      id: 'karyalay',
      title: 'ग्राम पंचायत कार्यालय',
      englishTitle: 'Panchayat Office',
      href: '/panchayat/karyalay',
      matchPaths: ['/panchayat/karyalay', '/panchayat-karyalay'],
      icon: FiHome,
      badge: 'प्रशासनिक प्रभाग'
    },
    {
      id: 'gram-sabha',
      title: 'ग्राम सभा पोर्टल',
      englishTitle: 'Gram Sabha',
      href: '/gram-sabha',
      matchPaths: ['/gram-sabha'],
      icon: FiUsers,
      badge: 'संवैधानिक जन मंच'
    },
    {
      id: 'vikas-karya',
      title: 'गाँव के विकास कार्य',
      englishTitle: 'Vikas Karya',
      href: '/vikas-karya',
      matchPaths: ['/vikas-karya'],
      icon: FiActivity,
      badge: 'विकास ट्रैकर'
    }
  ];

  const isCurrentActive = (sec) => {
    return sec.matchPaths.includes(currentPath);
  };

  return (
    <div className="w-full mb-6">
      {/* Sleek Top Switcher Strip */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Back to Main Panchayat Hub */}
        <Link
          to="/panchayat"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:text-[#135334] hover:bg-emerald-50 transition-colors shrink-0"
        >
          <FiArrowLeft className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>← मुख्य पंचायत पोर्टल</span>
          <span className="hidden lg:inline text-[10px] text-gray-400 font-normal">| तीनों पोर्टल चयन</span>
        </Link>

        {/* Right: 3 Direct Page Tabs in a clean single line */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const active = isCurrentActive(sec);

            return (
              <Link
                key={sec.id}
                to={sec.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border ${
                  active
                    ? 'bg-[#135334] text-white border-[#135334] shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50/70 hover:text-[#135334] hover:border-emerald-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-500'}`} />
                <span className="notranslate" translate="no">{sec.title}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PanchayatSubNav;
