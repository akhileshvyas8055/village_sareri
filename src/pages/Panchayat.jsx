import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  FiHome, 
  FiUsers, 
  FiActivity, 
  FiArrowRight, 
  FiClock, 
  FiMapPin, 
  FiCheckCircle 
} from 'react-icons/fi';

const PanchayatPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const portals = [
    {
      id: 'karyalay',
      title: 'ग्राम पंचायत कार्यालय',
      englishTitle: 'Gram Panchayat Office',
      subtitle: 'सरपंच, सचिव, वार्ड पंच व प्रशासनिक सूचनाएँ',
      href: '/panchayat/karyalay',
      icon: FiHome,
      badge: 'प्रशासनिक प्रभाग',
      description: 'ग्राम पंचायत का प्रशासनिक भवन। सरपंच, ग्राम विकास अधिकारी (सचिव) एवं सभी 11 वार्ड पंचों का विवरण, संपर्क सूत्र और नोटिस बोर्ड।',
      features: [
        'सरपंच व ग्राम विकास अधिकारी संपर्क',
        '11 वार्ड पंचों की सूची व विवरण',
        'कार्यालय सूचना पट्ट (Notice Board)'
      ],
      btnText: 'कार्यालय पेज खोलें'
    },
    {
      id: 'gram-sabha',
      title: 'ग्राम सभा पोर्टल',
      englishTitle: 'Gram Sabha Portal',
      subtitle: 'बैठकें, एजेंडा, पारित प्रस्ताव व निर्णय टाइमलाइन',
      href: '/gram-sabha',
      icon: FiUsers,
      badge: 'संवैधानिक जन मंच',
      description: 'नागरिकों की खुली संवैधानिक सभा। आगामी व आयोजित बैठकों की सूचना, कार्यसूची (Agenda), पारित प्रस्ताव व निर्णय प्रगति स्थिति।',
      features: [
        'आगामी व आयोजित बैठक विवरण',
        'बैठक कार्यवृत्त (MOM) व एजेंडा',
        'पारित प्रस्ताव व निर्णय टाइमलाइन'
      ],
      btnText: 'ग्राम सभा पेज खोलें'
    },
    {
      id: 'vikas-karya',
      title: 'गाँव के विकास कार्य',
      englishTitle: 'Development Works',
      subtitle: 'स्वीकृत, प्रगतिरत व पूर्ण निर्माण योजनाएं',
      href: '/vikas-karya',
      icon: FiActivity,
      badge: 'पारदर्शी निर्माण ट्रैकर',
      description: 'सरेरी ग्राम पंचायत के सभी निर्माण कार्यों की पारदर्शी ट्रैकिंग। सीसी सड़क, नाली, पेयजल ट्यूबवेल, बजट व प्रगति फोटो गैलरी।',
      features: [
        'स्वीकृत व प्रगतिरत निर्माण कार्य',
        'स्वीकृत बजट व वित्तीय व्यय विवरण',
        'साइट फोटोग्राफ्स व नागरिक फीडबैक'
      ],
      btnText: 'विकास कार्य पेज खोलें'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] pt-4 sm:pt-6 pb-16 font-sans">
      <SEO
        title="Gram Panchayat Brahmano Ki Sareri | Public Services & Representatives"
        description="सरेरी ग्राम पंचायत के सरपंच, उपसरपंच, सचिव व वार्ड पंचों की सूची, संपर्क विवरण, पंचायत समिति आसींद एवं सरकारी नागरिक सेवाओं की अधिकृत जानकारी।"
        url="https://villagesareri.in/panchayat"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Gram Panchayat', url: 'https://villagesareri.in/panchayat' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Simple & Clean Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#135334] mb-2 leading-tight">
            ग्राम पंचायत <span className="text-[#FF6B00]">सरेरी</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-700 font-semibold">
            Gram Panchayat <span className="notranslate" translate="no">Brahmano Ki Sareri</span>
          </p>
          <div className="w-16 h-1 bg-[#135334] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* 3 Same Size, Same Color, Medium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-10 items-stretch">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#135334]/30 hover:border-[#135334] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Badge + Icon (Same Color & Size for all 3) */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#135334] border border-emerald-200">
                      {portal.badge}
                    </span>

                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#135334] flex items-center justify-center border border-emerald-100 group-hover:bg-[#135334] group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#135334] transition-colors leading-snug mb-1">
                    <span className="notranslate" translate="no">{portal.title}</span>
                  </h2>
                  <div className="text-[11px] font-semibold text-gray-400 mb-2">
                    {portal.englishTitle}
                  </div>
                  <div className="text-xs font-medium text-emerald-800 mb-3 line-clamp-1">
                    {portal.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {portal.description}
                  </p>

                  {/* Features List (Same count & style for all 3) */}
                  <div className="space-y-1.5 mb-5 pt-3 border-t border-gray-100">
                    {portal.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-700">
                        <FiCheckCircle className="w-3.5 h-3.5 text-[#135334] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button (Same Color & Size for all 3) */}
                <div className="pt-3 border-t border-gray-100">
                  <Link
                    to={portal.href}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#135334] hover:bg-[#0e3e26] flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>{portal.btnText}</span>
                    <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Administration Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-[#135334] shrink-0" />
              <span>
                पंचायत समिति: <strong>आसींद</strong> • जिला: <strong>भीलवाड़ा (राजस्थान)</strong> • पिन कोड: 311026
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <FiClock className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>कार्यालय समय: सोमवार से शनिवार (10:00 AM – 05:00 PM)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>ग्राम पंचायत सरेरी • पंचायती राज व्यवस्था</p>
        </div>
      </div>
    </div>
  );
};

export default PanchayatPage;
