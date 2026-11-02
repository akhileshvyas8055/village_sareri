import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import {
  FiChevronRight,
  FiHome,
  FiMapPin,
  FiPhoneCall,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiShield,
  FiAward,
  FiBookOpen,
  FiUsers,
  FiMail,
  FiCalendar
} from 'react-icons/fi';

const PanchayatKaryalayPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const panchayatRef = ref(rtdb, 'panchayat');
    const unsubscribe = onValue(
      panchayatRef,
      (snapshot) => {
        const val = snapshot.val();
        setData(val || {});
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Build a normalized list for all 11 Wards (Ward 1 to 11)
  const normalizedWardPanches = useMemo(() => {
    const rawPanches = data?.wardPanches;
    const panchesArray = rawPanches
      ? Object.entries(rawPanches).map(([id, val]) => ({ id, ...val }))
      : [];

    const result = [];
    for (let w = 1; w <= 11; w++) {
      const match = panchesArray.find(
        (p) => parseInt(p.ward, 10) === w && p.status !== 'inactive'
      );
      if (match) {
        result.push({
          wardNumber: w,
          name: match.name || 'जानकारी उपलब्ध नहीं',
          gender: match.gender || '',
          address: match.address || 'ब्राह्मणों की सरेरी',
          mobile: match.mobile || '',
          isAvailable: true
        });
      } else {
        result.push({
          wardNumber: w,
          name: 'जानकारी उपलब्ध नहीं',
          gender: '',
          address: 'सरेरी',
          mobile: '',
          isAvailable: false
        });
      }
    }
    return result;
  }, [data?.wardPanches]);

  if (loading) {
    return (
      <div className="min-h-screen pt-12 pb-16 flex flex-col items-center justify-center bg-[#FFFDF9]">
        <div className="w-14 h-14 border-4 border-[#135334] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#135334] font-bold text-sm sm:text-base animate-pulse">
          कार्यालय विवरण लोड हो रहा है...
        </p>
      </div>
    );
  }

  // Sarpanch Data
  const sarpanch = data?.sarpanch || {};
  const sarpanchName = sarpanch.name?.trim() || 'मुकेश कुमार तिवारी';
  const sarpanchPhoto = sarpanch.photo?.trim() || '/sarpanch.png';
  const sarpanchTermStart = sarpanch.termStart?.trim() || '30 अक्टूबर 2026';
  const sarpanchEducation = sarpanch.education?.trim() || 'स्नातक / Graduate';
  const sarpanchAddress = sarpanch.address?.trim() || 'ब्राह्मणों की सरेरी (भीलवाड़ा)';
  const sarpanchMobile = sarpanch.mobile?.trim() || '';

  // Up-Sarpanch Data
  const upSarpanch = data?.upSarpanch || {};
  const upSarpanchName = upSarpanch.name?.trim() || '';
  const upSarpanchMobile = upSarpanch.mobile?.trim() || '';
  const upSarpanchWard = upSarpanch.ward?.trim() || '';

  // VDO / Sachiv Data
  const sachiv = data?.sachiv || {};
  const sachivName = sachiv.name?.trim() || '';
  const sachivMobile = sachiv.mobile?.trim() || '';
  const sachivTimings = sachiv.officeTimings?.trim() || '10:00 AM – 05:00 PM';

  // Panchayat Statistics
  const info = data?.info || {};
  const totalWards = info.totalWards || '11';
  const population = info.population || '4,242';
  const bplFamilies = info.bplFamilies?.trim() || 'जानकारी उपलब्ध नहीं';

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-800 pt-3 sm:pt-6 pb-24 md:pb-16 font-sans antialiased overflow-x-hidden">
      <SEO
        title="Panchayat Karyalay | Gram Panchayat Office Brahmano Ki Sareri"
        description="सरेरी ग्राम पंचायत कार्यालय: सरपंच, उप-सरपंच, ग्राम विकास अधिकारी (सचिव), 11 वार्ड पंच निर्देशिका, कार्यालय समय, ई-मित्र केंद्र एवं प्रशासनिक सेवाएं।"
        url="https://villagesareri.in/panchayat/karyalay"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Gram Panchayat', url: 'https://villagesareri.in/panchayat' },
          { name: 'Panchayat Karyalay', url: 'https://villagesareri.in/panchayat/karyalay' }
        ]}
      />

      <div className="container mx-auto px-3.5 sm:px-6 lg:px-8 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4 font-medium"
        >
          <Link to="/" className="hover:text-[#135334] transition-colors">
            होम
          </Link>
          <FiChevronRight className="w-3 h-3 text-gray-400" />
          <Link to="/panchayat" className="hover:text-[#135334] transition-colors">
            ग्राम पंचायत
          </Link>
          <FiChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-[#135334] font-bold">ग्राम पंचायत कार्यालय</span>
        </nav>

        {/* 1. COMPACT PAGE HEADING & OFFICE LOCATION */}
        <header className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-900/10 shadow-xs text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#135334] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <FiHome className="w-3.5 h-3.5" />
            <span>आधिकारिक प्रशासनिक भवन</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-[#135334] leading-snug">
            ग्राम पंचायत कार्यालय
          </h1>

          <p className="text-sm sm:text-base text-gray-700 font-semibold mt-0.5">
            Gram Panchayat Office -{' '}
            <span className="notranslate text-[#FF6B00]" translate="no">
              Brahmano Ki Sareri
            </span>
          </p>

          <p className="text-[11px] sm:text-xs text-gray-500 max-w-lg mx-auto mt-1 leading-relaxed">
            पंचायत समिति: <strong>आसींद</strong> • जिला: <strong>भीलवाड़ा (राजस्थान)</strong> • पिन: 311026
          </p>

          <div className="w-14 h-1 bg-[#135334] mx-auto mt-3 rounded-full"></div>
        </header>

        {/* 2. OFFICE HOURS, CONTACT & JURISDICTION INFORMATION */}
        <section aria-label="कार्यालय समय व संपर्क" className="mb-5 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {/* Office Hours */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#135334] flex items-center justify-center shrink-0 border border-emerald-100">
                <FiClock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  कार्यालय समय
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                  सोमवार - शनिवार: 10 AM - 5 PM
                </span>
              </div>
            </div>

            {/* Public Hearing / Location */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-100">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  जनसुनवाई व कार्यालय स्थल
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                  ग्राम पंचायत भवन, सरेरी
                </span>
              </div>
            </div>

            {/* Jurisdiction */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-900/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <FiShield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  प्रशासनिक अधिकार क्षेत्र
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 block leading-tight">
                  कुल 11 वार्ड • सरेरी पंचायत
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED GRAND SARPANCH CARD (सर्वोच्च निर्वाचित जन प्रतिनिधि • PURE CUTOUT WITHOUT BACKGROUND) */}
        <section aria-label="सरपंच परिचय" className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-[#FCFBF7] via-white to-[#F4F8F4] rounded-3xl border-2 border-[#135334]/30 shadow-2xl overflow-hidden relative">
            {/* Top Royal Forest Green & Gold Accent Bar */}
            <div className="bg-gradient-to-r from-[#0C3822] via-[#135334] to-[#0A301D] text-white px-4 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-400/40">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl">🏛️</span>
                <div>
                  <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-300 block">
                    ग्राम पंचायत ब्राह्मणों की सरेरी
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-emerald-200 font-medium block">
                    पंचायती राज व्यवस्था • राजस्थान सरकार
                  </span>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-black px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FF6B00] to-amber-500 text-white shadow-xs border border-amber-300/40 tracking-wide uppercase">
                ★ सर्वोच्च निर्वाचित जन प्रतिनिधि ★
              </span>
            </div>

            {/* Saffron-Gold-Green Ribbon Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6B00] via-amber-300 to-[#135334]"></div>

            <div className="p-5 sm:p-7 md:p-9">
              {/* Layout: Centered on Mobile, 2-Column on Desktop */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                {/* 1. Portrait Cutout: PURE CUTOUT WITHOUT BACKGROUND */}
                <div className="flex flex-col items-center justify-end shrink-0 w-full md:w-80 lg:w-96 self-center md:self-end relative">
                  {/* Free-standing Cutout Image (No Box, No Background, Pure Natural Transparency) */}
                  <img
                    src={sarpanchPhoto}
                    alt={sarpanchName}
                    className="w-60 sm:w-72 md:w-80 lg:w-96 max-h-[420px] md:max-h-[460px] object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.30)] transition-transform duration-300 hover:scale-[1.02]"
                    loading="eager"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/sarpanch.png';
                    }}
                  />

                  {/* Elegant Name Plaque below the cutout */}
                  <div className="-mt-3 z-10 text-center py-1.5 px-5 rounded-full bg-gradient-to-r from-[#0C3822] via-[#135334] to-[#0C3822] text-white border-2 border-amber-300/70 shadow-lg inline-flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black tracking-wide text-amber-300">
                      श्री {sarpanchName}
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-100 font-semibold">
                      • सरपंच
                    </span>
                  </div>
                </div>

                {/* 2. Details Section */}
                <div className="flex-1 w-full text-center md:text-left">
                  {/* Constitutional Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-3 shadow-2xs">
                    <span>👑</span>
                    <span>संवैधानिक ग्राम प्रधान • मुख्य कार्यकारी</span>
                  </div>

                  {/* Main Name (Shown only once) */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-gray-900 tracking-tight leading-tight">
                    <span className="notranslate" translate="no">
                      {sarpanchName}
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base font-extrabold text-[#135334] tracking-wide mt-1">
                    ग्राम पंचायत सरपंच (Gram Panchayat Sarpanch)
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
                    ग्राम पंचायत <span className="notranslate text-gray-700 font-bold" translate="no">Brahmano Ki Sareri</span> • पंचायत समिति आसींद (भीलवाड़ा)
                  </p>

                  {/* Sarpanch's Inspiring Vision / Quote */}
                  <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/90 border-l-4 border-amber-500 border border-amber-200/60 shadow-xs relative text-left">
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl text-amber-500 font-serif leading-none shrink-0">“</span>
                      <p className="text-xs sm:text-sm text-gray-700 font-medium italic leading-relaxed">
                        सरेरी ग्राम पंचायत के प्रत्येक नागरिक का सम्मान, समग्र ग्राम विकास, स्वच्छता, शिक्षा एवं पारदर्शी पंचायती राज ही हमारा संकल्प है। गाँव की उन्नति में हर ग्रामीण की भागीदारी सुनिश्चित है।
                      </p>
                    </div>
                    <p className="text-[11px] font-extrabold text-[#135334] text-right mt-1.5">
                      — {sarpanchName} (सरपंच)
                    </p>
                  </div>

                  {/* 4 Official Credential Badges in 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 mt-4 text-left">
                    <div className="bg-white p-3 rounded-xl border-2 border-emerald-900/10 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <FiCalendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">कार्यकाल प्रारंभ</span>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 block truncate">
                        {sarpanchTermStart}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border-2 border-emerald-900/10 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <FiShield className="w-3.5 h-3.5 text-[#135334]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">संवैधानिक दायित्व</span>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 block truncate">
                        संपूर्ण पंचायत प्रधान
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border-2 border-emerald-900/10 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <FiBookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">शैक्षणिक योग्यता</span>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 block truncate">
                        {sarpanchEducation}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border-2 border-emerald-900/10 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                        <FiMapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">स्थायी निवास</span>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 block truncate">
                        {sarpanchAddress}
                      </span>
                    </div>
                  </div>

                  {/* Big Call Action (NO phone number printed on button) */}
                  <div className="mt-5 flex justify-center md:justify-start">
                    {sarpanchMobile ? (
                      <a
                        href={`tel:${sarpanchMobile}`}
                        className="min-h-[50px] w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-[#135334] via-[#0E4228] to-[#135334] hover:from-[#0B331F] hover:to-[#135334] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all border border-amber-300/40 active:scale-98"
                      >
                        <FiPhoneCall className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>सरपंच कार्यालय से सीधे संपर्क करें</span>
                      </a>
                    ) : (
                      <div className="min-h-[46px] w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/80 text-gray-700 text-xs font-bold flex items-center justify-center gap-2 border-2 border-emerald-900/15">
                        <FiPhoneCall className="w-4 h-4 text-gray-400" />
                        <span>संपर्क: जानकारी उपलब्ध नहीं</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 & 5. COMPACT ADMINISTRATIVE STRIP: UP-SARPANCH & VDO (बस दिख जाए - कोई कार्ड नहीं) */}
        <section aria-label="अन्य प्रशासनिक पदाधिकारी" className="mb-6 sm:mb-8">
          <div className="bg-[#FAF9F5] rounded-2xl p-3.5 sm:px-5 sm:py-3.5 border-2 border-emerald-900/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-600 font-bold uppercase tracking-wider text-[11px] shrink-0">
              <FiUsers className="w-4 h-4 text-[#135334]" />
              <span>पंचायत प्रशासनिक पदाधिकारी:</span>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6 w-full md:w-auto">
              {/* Up-Sarpanch */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-gray-500 font-medium">उप-सरपंच:</span>
                <span className="font-extrabold text-gray-900 notranslate" translate="no">
                  {upSarpanchName || 'जानकारी उपलब्ध नहीं'}
                </span>
                {upSarpanchWard && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    वार्ड {upSarpanchWard}
                  </span>
                )}
                {upSarpanchMobile && (
                  <a
                    href={`tel:${upSarpanchMobile}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-[#135334] font-bold flex items-center gap-1 text-[11px] transition-colors ml-1"
                    title="कॉल करें"
                  >
                    <FiPhoneCall className="w-3 h-3 text-[#135334]" />
                    <span>कॉल करें</span>
                  </a>
                )}
              </div>

              <div className="hidden sm:block text-gray-300">|</div>

              {/* VDO / Sachiv */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                <span className="text-gray-500 font-medium">ग्राम विकास अधिकारी (VDO):</span>
                <span className="font-extrabold text-gray-900 notranslate" translate="no">
                  {sachivName || 'जानकारी उपलब्ध नहीं'}
                </span>
                {sachivTimings && (
                  <span className="text-[11px] text-gray-500 font-medium">
                    ({sachivTimings})
                  </span>
                )}
                {sachivMobile && (
                  <a
                    href={`tel:${sachivMobile}`}
                    className="px-2.5 py-1 rounded-lg bg-blue-100/70 hover:bg-blue-200 text-blue-800 font-bold flex items-center gap-1 text-[11px] transition-colors ml-1"
                    title="कॉल करें"
                  >
                    <FiPhoneCall className="w-3 h-3 text-blue-600" />
                    <span>कॉल करें</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 6. PANCHAYAT DETAILS AND STATISTICS */}
        <section aria-label="पंचायत विवरण व सांख्यिकी" className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-900/10 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <span className="text-base">📊</span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#135334] leading-snug">
                  पंचायत विवरण एवं सांख्यिकी
                </h3>
                <span className="block text-[11px] sm:text-xs font-normal text-gray-500 font-sans tracking-normal">
                  (Panchayat Details & Statistics)
                </span>
              </div>
            </div>

            {/* 3 Key Stats: Wards (11), Population (4,242), BPL Families */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
              <div className="bg-emerald-50/70 p-3 sm:p-4 rounded-xl border border-emerald-100">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase block mb-1">
                  कुल वार्ड
                </span>
                <span className="text-xl sm:text-3xl font-extrabold text-[#135334] block leading-tight">
                  {totalWards}
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                  11 वार्ड प्रतिनिधि
                </span>
              </div>

              <div className="bg-orange-50/70 p-3 sm:p-4 rounded-xl border border-orange-100">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase block mb-1">
                  कुल जनसंख्या
                </span>
                <span className="text-xl sm:text-3xl font-extrabold text-[#FF6B00] block leading-tight">
                  {population}
                </span>
                <span className="text-[9px] sm:text-[10px] text-orange-700 font-semibold mt-0.5 block">
                  निवासी (जनगणना)
                </span>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase block mb-1">
                  BPL परिवार
                </span>
                <span className="text-xs sm:text-sm md:text-base font-extrabold text-gray-700 block mt-1.5 leading-tight">
                  {bplFamilies}
                </span>
                <span className="text-[9px] text-gray-400 mt-1 block">
                  आधिकारिक डेटा
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. WARD PANCHES DIRECTORY (WARD 1–11) */}
        <section aria-label="11 वार्ड पंच निर्देशिका" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#135334] flex items-start sm:items-center gap-2.5">
                <FiUsers className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="block text-lg sm:text-xl font-extrabold text-[#135334] leading-snug">
                    वार्ड पंच निर्देशिका
                  </span>
                  <span className="block text-xs sm:text-sm font-medium text-gray-500 font-sans tracking-normal mt-0.5">
                    (Ward Panches Directory)
                  </span>
                </div>
              </h2>
              <p className="text-xs text-gray-500">
                ग्राम पंचायत सरेरी के सभी 11 वार्डों के निर्वाचित जन प्रतिनिधि
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 self-start sm:self-auto">
              कुल 11 वार्ड
            </span>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {normalizedWardPanches.map((panch) => {
              const hasPhone = Boolean(panch.mobile?.trim());

              return (
                <div
                  key={panch.wardNumber}
                  className="bg-white rounded-2xl p-4 border-2 border-[#135334]/25 hover:border-[#135334] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Ward Badge & Gender */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#135334] text-white shadow-2xs group-hover:bg-[#0C3822] transition-colors border border-emerald-900/20">
                        वार्ड {panch.wardNumber}
                      </span>

                      {panch.gender && (
                        <span className="text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
                          {panch.gender === 'Female'
                            ? 'महिला'
                            : panch.gender === 'Male'
                            ? 'पुरुष'
                            : panch.gender}
                        </span>
                      )}
                    </div>

                    {/* Representative Name */}
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                      {panch.name !== 'जानकारी उपलब्ध नहीं' ? (
                        <span className="notranslate" translate="no">
                          {panch.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal italic">
                          जानकारी उपलब्ध नहीं
                        </span>
                      )}
                    </h3>

                    {/* Designation & Location */}
                    <div className="mt-1 text-xs text-[#135334] font-semibold">
                      वार्ड पंच • ग्राम पंचायत सरेरी
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="truncate">{panch.address}</span>
                    </div>
                  </div>

                  {/* Phone Call Button (with distinct outline - NO mobile number printed) */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100">
                    {hasPhone ? (
                      <a
                        href={`tel:${panch.mobile}`}
                        className="min-h-[42px] w-full px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#135334] text-xs font-extrabold flex items-center justify-center gap-2 border-2 border-[#135334]/30 hover:border-[#135334] transition-all shadow-2xs active:scale-98"
                      >
                        <FiPhoneCall className="w-3.5 h-3.5" />
                        <span>कॉल करें</span>
                      </a>
                    ) : (
                      <div className="text-[11px] text-gray-400 italic py-1.5 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        संपर्क उपलब्ध नहीं
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. LAST UPDATED INFORMATION & PATRIOTIC FOOTER */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-col items-center gap-1.5">
          <p className="flex items-center gap-1.5 font-medium">
            <FiClock className="w-3.5 h-3.5 text-gray-400" />
            <span>
              अंतिम अद्यतन:{' '}
              {new Date().toLocaleDateString('hi-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </p>
          <p className="font-extrabold text-[#135334] tracking-wide text-xs sm:text-sm">
            जय हिन्द • जय पंचायती राज 🇮🇳
          </p>
          <p className="text-[10px] text-gray-400">
            डिजिटल ग्राम पंचायत ब्राह्मणों की सरेरी (भीलवाड़ा, राजस्थान)
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PanchayatKaryalayPage;
