import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBell,
  LuBuilding2,
  LuCompass,
  LuCalendar,
  LuStore,
  LuMessageSquareWarning,
  LuAward,
  LuArrowRight,
  LuUsers
} from 'react-icons/lu';

const serviceCards = [
  {
    id: 'notices',
    titleHi: 'डिजिटल सूचना पट्ट',
    titleEn: 'Digital Notice Board',
    description: 'गाँव एवं पंचायत की आधिकारिक सूचनाएँ, आदेश एवं महत्वपूर्ण घोषणाएं',
    path: '/notices',
    icon: LuBell,
    color: 'text-[#0D477A] bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300',
    borderColor: 'hover:border-[#0D477A]/40 dark:hover:border-blue-400/40',
    accent: '#0D477A',
    badge: 'Live'
  },
  {
    id: 'panchayat',
    titleHi: 'ग्राम पंचायत सेवाएँ',
    titleEn: 'Panchayat & Govt Services',
    description: 'सरपंच, सचिव, वार्ड पंच एवं पंचायत कार्यालय की प्रशासनिक जानकारी',
    path: '/panchayat',
    icon: LuBuilding2,
    color: 'text-[#0D9488] bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300',
    borderColor: 'hover:border-[#0D9488]/40 dark:hover:border-teal-400/40',
    accent: '#0D9488',
    badge: null
  },
  {
    id: 'about',
    titleHi: 'हमारा सरेरी दर्शन',
    titleEn: 'Explore Sareri',
    description: 'गाँव का गौरवशाली इतिहास, प्रमुख धार्मिक स्थल, संस्कृति एवं जनजीवन',
    path: '/about',
    icon: LuCompass,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300',
    borderColor: 'hover:border-indigo-500/40 dark:hover:border-indigo-400/40',
    accent: '#4F46E5',
    badge: null
  },
  {
    id: 'community',
    titleHi: 'ग्राम चौपाल व समुदाय',
    titleEn: 'Village Community',
    description: 'ग्रामीण संवाद, विचार-विमर्श, युवा मंच एवं सामाजिक सहभागिता',
    path: '/community',
    icon: LuUsers,
    color: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-300',
    borderColor: 'hover:border-cyan-600/40 dark:hover:border-cyan-400/40',
    accent: '#0891B2',
    badge: null
  },
  {
    id: 'businesses',
    titleHi: 'स्थानीय व्यापार व सेवाएँ',
    titleEn: 'Local Businesses & Directory',
    description: 'गाँव की दुकानें, कारीगर, कृषि सेवाएँ, चिकित्सा व स्थानीय बाज़ार प्रतिष्ठान',
    path: '/businesses',
    isComingSoon: false,
    icon: LuStore,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300',
    borderColor: 'hover:border-purple-500/40 dark:hover:border-purple-400/40',
    accent: '#9333EA',
    badge: 'Directory'
  },
  {
    id: 'events',
    titleHi: 'आयोजन एवं संस्कृति',
    titleEn: 'Village Events & Culture',
    description: 'वार्षिक मेले, जलझूलनी एकादशी, खेल महोत्सव एवं सांस्कृतिक कार्यक्रमों का विवरण',
    path: '/events',
    icon: LuCalendar,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    borderColor: 'hover:border-amber-500/40 dark:hover:border-amber-400/40',
    accent: '#D97706',
    badge: 'Melas'
  },
  {
    id: 'complaint',
    titleHi: 'जनसुनवाई एवं शिकायत',
    titleEn: 'Complaints & Suggestions',
    description: 'गाँव की समस्याओं एवं जनहित सुझावों को सीधे पंचायत तक पहुँचाएँ',
    path: '/complaint',
    icon: LuMessageSquareWarning,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
    borderColor: 'hover:border-rose-500/40 dark:hover:border-rose-400/40',
    accent: '#E11D48',
    badge: 'Jan Sunwai'
  },
  {
    id: 'pride',
    titleHi: 'सरेरी के गौरव',
    titleEn: 'Village Achievers',
    description: 'शिक्षा, खेल, समाज सेवा एवं प्रशासन में गाँव का नाम रोशन करने वाली हस्तियाँ',
    path: '/pride',
    icon: LuAward,
    color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderColor: 'hover:border-emerald-600/40 dark:hover:border-emerald-400/40',
    accent: '#059669',
    badge: null
  }
];

const CitizenServices = () => {
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  return (
    <section id="services" className="py-10 md:py-16 bg-white dark:bg-[#0B1120] transition-colors relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D477A] dark:text-white font-heading tracking-tight leading-tight">
            Digital Village Services
          </h2>

          <p className="mt-2 text-base sm:text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300">
            आपके गाँव की ज़रूरी सेवाएँ, एक ही जगह
          </p>
          <div className="w-16 h-1 bg-[#0D477A] dark:bg-sky-400 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* 7 Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {serviceCards.map((service) => {
            const IconComponent = service.icon;

            const cardInner = (
              <div
                className={`group relative h-full flex flex-col justify-between p-3.5 sm:p-5 md:p-6 bg-white dark:bg-slate-800/90 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${service.borderColor} cursor-pointer min-h-[160px] sm:min-h-[190px] md:min-h-[210px]`}
              >
                {/* Top Badge (if any) */}
                {service.badge && (
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                        service.isComingSoon
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                          : service.badge === 'Live'
                          ? 'bg-blue-100 text-[#0D477A] dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
                      }`}
                    >
                      {service.badge}
                    </span>
                  </div>
                )}

                {/* Top Content: Icon + Title */}
                <div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-inner ${service.color} mb-3 sm:mb-4`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base md:text-lg leading-snug group-hover:text-[#0D477A] dark:group-hover:text-sky-300 transition-colors">
                    {service.titleHi}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {service.titleEn}
                  </p>

                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#0D477A] dark:text-sky-300">
                  <span className="text-[11px] sm:text-xs">विवरण देखें</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700/70 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#0D477A] group-hover:text-white dark:group-hover:bg-sky-500 transition-all duration-300 group-hover:translate-x-0.5">
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );

            return (
              <Link
                key={service.id}
                to={service.path}
                className="block h-full focus:outline-none focus:ring-2 focus:ring-[#0D477A] rounded-xl sm:rounded-2xl min-h-[44px]"
                aria-label={`${service.titleHi} - ${service.titleEn}`}
              >
                {cardInner}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CitizenServices;
